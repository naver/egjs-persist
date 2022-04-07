/* eslint-disable no-new */
/* eslint-disable no-unused-expressions */
import Persist from "../../src/Persist";
import {injectHashPersist, mockPersistModulesWithBrowser, reloadPersist, wait} from "./TestHelper";
import {HashPersist, registerHashPersist} from "../../src";
import PersistHistory from "../../src/PersistHistory";
import {clear, getHashDepths} from "../../src/historyManager";

describe("HashPersist", () => {
	beforeEach(() => {
		location.hash = "";
		clear();
		sessionStorage.clear();
		registerHashPersist();
	});

	afterEach(() => {
		PersistHistory.useHash = false;
	});

	it("should check whether the default Persist gets the value properly even if the hash changes", async () => {
		// Given
		const persist = new Persist();

		persist.set("a", "a");

		// When
		location.hash = "a";
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("#a");
		expect(persist.get("a")).to.be.equals("a");
		expect(getHashDepths()).to.be.deep.equals(["", "#a"]);
	});

	it(`should check whether the value of HashPersist changes according to hash. ("" => #a)`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		location.hash = "a";
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("#a");
		expect(persist.get("a")).to.be.equals(null);
		expect(getHashDepths()).to.be.deep.equals(["", "#a"]);
	});

	it(`should check whether the value of HashPersist changes according to hash. ("" => #a => #b)`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		// hash #a
		location.hash = "a";
		await wait();
		persist.set("a", "b");

		// hash #b
		location.hash = "b";
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("#b");
		expect(persist.get("a")).to.be.equals(null);
		expect(getHashDepths()).to.be.deep.equals(["", "#a", "#b"]);
	});
	it(`should check whether the value of HashPersist changes according to hash. ("" => #a => ""(bf))`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		// hash #a
		location.hash = "a";
		await wait();

		persist.set("a", "b");

		// hash "" (bf)
		history.back();
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("");
		expect(persist.get("a")).to.be.equals("a");
		expect(getHashDepths()).to.be.deep.equals(["", "#a"]);
	});
	it(`should check if the order of hash depth is changed when navigating to overlapping hashes. ("" => #a => ""(navigate))`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		// hash #a
		location.hash = "a";
		await wait();

		persist.set("a", "b");

		// hash "" (navigate)
		location.hash = "";
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("");
		expect(persist.get("a")).to.be.equals(null);
		expect(getHashDepths()).to.be.deep.equals(["#a", ""]);
	});
	it(`should check if the value of "#a" is overwritten ("" => #a => ""(bf) => #a(navigate))`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		// hash #a
		location.hash = "a";
		await wait();

		persist.set("a", "b");

		// hash "" (bf)
		history.back();
		await wait();

		// hash #b (navigate)
		location.hash = "a";
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("#a");
		expect(persist.get("a")).to.be.equals(null);
		expect(getHashDepths()).to.be.deep.equals(["", "#a"]);
	});
	it(`should check if forward history disappears when navigating the page. ("" => #a => ""(bf) => #b(navigate))`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		// hash #a
		location.hash = "a";
		await wait();

		persist.set("a", "b");

		// hash "" (bf)
		history.back();
		await wait();

		// hash #b (navigate)
		location.hash = "b";
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("#b");
		expect(getHashDepths()).to.be.deep.equals(["", "#b"]);
	});
	it(`should check if the value is cleared upon reload. ("" => #a => ""(bf, reload))`, async () => {
		// Given
		const persist = new HashPersist();

		// hash ""
		persist.set("a", "a");

		// When
		// hash #a
		location.hash = "a";
		await wait();

		persist.set("a", "b");

		// hash "" (bf)
		history.back();
		await wait();

		// hash "" (virtual reload)
		reloadPersist();
		await wait();

		// Then
		expect(PersistHistory.hash).to.be.equals("");
		expect(persist.get("a")).to.be.equals(null);
		expect(getHashDepths()).to.be.deep.equals(["", "#a"]);
	});
	it(`should check if it works even if the url value changes ("" => a#a => ""(bf) => a#a(bf))`, async () => {
		// Given
		const mockModules = mockPersistModulesWithBrowser();
		const InjectedHashPersist = injectHashPersist(mockModules);

		mockModules["./historyManager"].registerHashPersist();
		const persist = new InjectedHashPersist();
		const mockHistory = mockModules["./browser"].history;
		const mockPersistHistory = mockModules["./PersistHistory"];

		// hash ""
		persist.set("a", "a");

		// hash a#a
		mockHistory.pushState({}, "", `/a#a`);
		persist.set("a", "b");

		// When
		// hash ""
		mockHistory.go(-1);
		const noHashValue = persist.get("a");

		// hash a#a
		mockHistory.go(1);
		const aHashValue = persist.get("a");

		// Then
		expect(mockPersistHistory.hash).to.be.equals("#a");
		expect(noHashValue).to.be.equals("a");
		expect(aHashValue).to.be.equals("b");
	});
	it(`should checks whether the value is replaced when the state is replaced in the same url ("" => #a => #b(replace))`, async () => {
		// Given
		const mockModules = mockPersistModulesWithBrowser();
		const InjectedHashPersist = injectHashPersist(mockModules);
		const mockHistoryManager = mockModules["./historyManager"];

		mockHistoryManager.registerHashPersist();
		const persist = new InjectedHashPersist();
		const mockHistory = mockModules["./browser"].history;
		const mockLocation = mockModules["./browser"].location;
		const mockPersistHistory = mockModules["./PersistHistory"];
		const defaultUrl = mockLocation.href.replace(mockLocation.origin, "");

		// hash ""
		persist.set("a", "a");

		// hash #a
		mockHistory.pushState({}, "", `${defaultUrl}#a`);
		persist.set("a", "b");

		// When
		// hash #b (replace)
		mockHistory.replaceState({}, "", `${defaultUrl}#b`);
		mockHistoryManager.replaceDepth();

		// Then
		expect(mockHistoryManager.getHashDepths()).to.be.deep.equals(["", "#b"]);
		expect(mockPersistHistory.hash).to.be.equals("#b");
	});
	it(`should checks whether the value is replaced when the state is replaced in another url ("" => #a => a#a(replace))`, async () => {
		// Given
		const mockModules = mockPersistModulesWithBrowser();
		const InjectedHashPersist = injectHashPersist(mockModules);
		const mockHistoryManager = mockModules["./historyManager"];

		mockHistoryManager.registerHashPersist();
		const persist = new InjectedHashPersist();
		const mockHistory = mockModules["./browser"].history;
		const mockLocation = mockModules["./browser"].location;
		const getUrlKey = mockModules["./utils"].getUrlKey;
		const mockPersistHistory = mockModules["./PersistHistory"];
		const defaultUrl = mockLocation.href.replace(mockLocation.origin, "");
		const prevUrlKey = getUrlKey();

		// hash ""
		persist.set("a", "a");

		// hash #a
		mockHistory.pushState({}, "", `${defaultUrl}#a`);
		persist.set("a", "b");

		// When
		// hash a#a (replace)
		mockHistory.replaceState({}, "", `/a#a`);
		mockHistoryManager.replaceDepth();

		// Then
		expect(mockHistoryManager.getHashDepths(prevUrlKey)).to.be.deep.equals([""]);
		expect(mockHistoryManager.getHashDepths()).to.be.deep.equals(["#a"]);
		expect(mockPersistHistory.hash).to.be.equals("#a");
	});
	it(`should checks whether the value is replaced when the state is replaced in another url ("" => a#a => a#b => ""(bf) => a#c(replace))`, async () => {
		// Given
		const mockModules = mockPersistModulesWithBrowser();
		const InjectedHashPersist = injectHashPersist(mockModules);
		const mockHistoryManager = mockModules["./historyManager"];

		mockHistoryManager.registerHashPersist();
		const persist = new InjectedHashPersist();
		const mockHistory = mockModules["./browser"].history;
		const mockPersistHistory = mockModules["./PersistHistory"];

		// hash ""
		persist.set("a", "a");

		// hash a#a
		mockHistory.pushState({}, "", `/a#a`);
		persist.set("a", "a#a");

		// hash a#b
		mockHistory.pushState({}, "", `/a#b`);
		persist.set("a", "a#b");

		// hash ""
		mockHistory.go(-2);

		// When
		// hash a#c
		mockHistory.replaceState({}, "", `/a#c`);
		mockHistoryManager.replaceDepth();

		// Then
		expect(mockHistoryManager.getHashDepths()).to.be.deep.equals(["#c", "#a", "#b"]);
		expect(mockPersistHistory.hash).to.be.equals("#c");
	});
	it(`should checks whether the value is replaced when the state is replaced in another url ("" => a#a => a#b => ""(bf) => a#b(replace))`, async () => {
		// Given
		const mockModules = mockPersistModulesWithBrowser();
		const InjectedHashPersist = injectHashPersist(mockModules);
		const mockHistoryManager = mockModules["./historyManager"];

		mockHistoryManager.registerHashPersist();
		const persist = new InjectedHashPersist();
		const mockHistory = mockModules["./browser"].history;
		const mockPersistHistory = mockModules["./PersistHistory"];

		// hash ""
		persist.set("a", "a");

		// hash a#a
		mockHistory.pushState({}, "", `/a#a`);
		persist.set("a", "a#a");

		// hash a#b
		mockHistory.pushState({}, "", `/a#b`);
		persist.set("a", "a#b");

		// hash ""
		mockHistory.go(-2);

		// When
		// hash a#b
		mockHistory.replaceState({}, "", `/a#b`);
		mockHistoryManager.replaceDepth();

		// Then
		expect(mockHistoryManager.getHashDepths()).to.be.deep.equals(["#b", "#a"]);
		expect(mockPersistHistory.hash).to.be.equals("#b");
	});
});
