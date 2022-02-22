/* eslint-disable no-new */
/* eslint-disable no-unused-expressions */
import UtilsInjector from "inject-loader!../../src/utils";
import StorageManagerInjector from "inject-loader!../../src/storageManager";
import Persist from "../../src/Persist";
import * as utils from "../../src/utils";
import * as StorageManager from "../../src/storageManager";
import {CONST_PERSIST_STATE, CONST_DEPTHS, CONST_LAST_URL} from "../../src/consts";
import {wait, storageManagerForLimit, injectBrowser, injectPersistModules, INJECT_URL, injectPersist, injectPersistExports, getDepths} from "./TestHelper";
import { PersistQuotaExceededError } from "../../src";

const StorageManagerUsingHistory = StorageManagerInjector(
	{
		"./browser": {
			window,
			history: window.history,
			location: window.location,
			JSON: window.JSON,
			sessionStorage: null,
			localStorage: null,
		},
	}
);

const PersistUsingHistory = injectPersist({
	"./storageManager": StorageManagerUsingHistory,
});

const mockBrowser = injectBrowser();
const mockState = {
	"./storageManager": StorageManagerInjector({
		"./browser": mockBrowser,
	}),
	"./utils": UtilsInjector({
		"./browser": mockBrowser,
	}),
};


describe("Persist", () => {
	describe("isNeeded", () => {
		it("isNeeded on chrome", () => {
			// Given
			// When
			const isNeeded = Persist.isNeeded();

			// Then
			expect(isNeeded).to.be.true;
		});
	});

	describe("clear", () => {
		it("call clear", () => {
			// Given
			// first clear
			Persist.clear();

			// save value
			const persist = new Persist();

			persist.set("test", 100);

			// exist value
			const value = persist.get("test");
			// When

			// remove all
			Persist.clear();

			// not exist value
			const value2 = persist.get("test");

			// Then
			expect(value).to.be.equal(100);
			expect(value2).to.be.not.ok;
		});
	});
	describe("History", () => {
		it("save index, get index when history.state is null", () => {
			// Given
			history.replaceState(null, null, null);
			expect(history.state).to.equal(null);
			const persist = new PersistUsingHistory("TESTKEY");

			// When
			persist.set("flick", {
				index: 10,
			});

			// Then
			expect(persist.get("flick.index")).to.equal(10);
		});
	});

	describe("Preserve types", () => {
		beforeEach(() => {
			location.hash = "";
			sessionStorage.clear();
		});
		it("save 0, false, get 0, false", () => {
			// Given
			const persist = new Persist({
				key: "TESTKEY",
			});

			// When
			persist.set("test.a", "");
			persist.set("test.b", 0);
			persist.set("test.c", null);
			persist.set("test.d", undefined);
			persist.set("a", "");
			persist.set("b", 0);
			persist.set("c", null);
			persist.set("d", undefined);

			// Then
			expect(persist.get("test.a")).to.be.equals("");
			expect(persist.get("test.b")).to.be.equals(0);
			expect(persist.get("test.c")).to.be.equals(null);
			expect(persist.get("test.d")).to.be.equals(null);
			expect(persist.get("a")).to.be.equals("");
			expect(persist.get("b")).to.be.equals(0);
			expect(persist.get("c")).to.be.equals(null);
			expect(persist.get("d")).to.be.equals(null);
		});
		it("save number, get number(hash is all different)", () => {
			// Given
			const persist = new Persist({
				key: "TESTKEY",
			});

			// When
			location.hash = "#a";
			persist.set("test", 10);

			// the same value is output.
			const result1 = persist.get("test");

			location.hash = "#b";
			const result2 = persist.get("test");

			// Then
			expect(result1).to.equal(10);
			expect(result2).to.equal(10);
		});
		it("save number, get number", () => {
			// Given
			const persist = new Persist("TESTKEY");

			persist.set("", null);
			const data = 100;

			// When
			persist.set("", data);

			// Then
			expect(persist.get("")).to.equal(data);
		});

		it("save string data, get string data", () => {
			// Given
			const persist = new Persist("TESTKEY");

			persist.set("", null);
			const data = JSON.stringify({
				"scrollTop": 100,
			});

			// When
			persist.set("", data);

			// Then
			expect(persist.get("")).to.equal(data);
		});

		it("save object data, get object data", () => {
			// Given
			const persist = new Persist("TESTKEY");

			persist.set("", null);
			const data = {
				"scrollTop": 100,
			};

			// When
			persist.set("", data);

			// Then
			expect(persist.get("")).to.deep.equal(data);
		});

		it("remove state data with undefined and key", () => {
			// Given
			const persist = new Persist("TESTKEY");

			persist.set("", null);
			const data = {
				"scrollTop": 100,
			};

			persist.set("", data);

			// When
			persist.set("", undefined);

			// Then
			expect(persist.get("")).to.equal(null);
		});

		it("remove state data with null and key", () => {
			// Given
			const persist = new Persist("TESTKEY");

			persist.set("", null);
			const data = {
				"scrollTop": 100,
			};

			persist.set("", data);

			// When
			persist.set("", null);

			// Then
			expect(persist.get("")).to.equal(null);
		});

		it("remove state data with remove method", () => {
			// Given
			const persist = new Persist("TESTKEY");

			persist.set("", {
				"scrollTop": 100,
				"a": {
					"b": 1,
				},
			});

			// When
			// remove a > b key
			persist.remove("a.b");

			const value1 = persist.get("");

			// remove scrollTop key
			persist.remove("scrollTop");

			const value2 = persist.get("");

			// remove all
			persist.remove("");

			const value3 = persist.get("");

			// Then

			expect(value1).to.be.deep.equals({
				scrollTop: 100,
				a: {},
			});
			expect(value2).to.be.deep.equals({
				a: {},
			});
			expect(value3).to.be.deep.equals(null);
		});
	});

	describe("path param with instance", () => {
		describe("get global", () => {
			it("can get data with empty path string", () => {
				// Given
				const persist = new Persist("TESTKEY");

				// When
				persist.set("a", 1);

				persist.set("b", 2);


				// Then
				expect(persist.get("")).to.deep.equal({
					a: 1,
					b: 2,
				});
			});

			it("can get data without params", () => {
				// Given
				const persist = new Persist("TESTKEY");

				// When
				persist.set("a", 1);
				persist.set("b", 2);

				// Then
				expect(persist.get()).to.deep.equal({
					a: 1,
					b: 2,
				});
			});
		});

		describe("set global with empty path string", () => {
			it("can save primitive type: number", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("", 100);


				// Then
				expect(persist.get("")).to.equal(100);
			});

			it("can save primitive type: string", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("", "hello");

				// Then
				expect(persist.get("")).to.equal("hello");
			});

			it("can save object type", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("", {"name": "john"});

				// Then
				expect(persist.get("")).to.deep.equal({"name": "john"});
			});

			it("can remove with null", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", "hello");

				// When
				persist.set("", null);

				// Then
				expect(persist.get("")).to.equal(null);
			});

			it("can remove with undefined", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", "hello");

				// When
				persist.set("", undefined);

				// Then
				expect(persist.get("")).to.equal(null);
			});
		});
		describe("object", () => {
			it("can set with global property", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("foo", {"name": "john"});


				// Then
				expect(persist.get("foo")).to.deep.equal({"name": "john"});
			});

			it("can set on property", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);
				persist.set("foo", {"name": "john"});

				// When
				persist.set("bar", {"name": "mary"});

				// Then
				expect(persist.get("")).to.deep.equal(
					{
						"foo": {"name": "john"},
						"bar": {"name": "mary"},
					}
				);
				expect(persist.get("foo")).to.deep.equal({"name": "john"});
				expect(persist.get("bar")).to.deep.equal({"name": "mary"});
				expect(persist.get("foo.name")).equal("john");
				expect(persist.get("bar.name")).equal("mary");
			});

			it("can set additional property", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);
				persist.set("foo", {"name": "john"});

				// When
				persist.set("foo.age", 33);

				// Then
				expect(persist.get("foo")).to.deep.equal({"name": "john", "age": 33});
				expect(persist.get("foo.age")).equal(33);
			});

			it("null on empty property", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("foo", {"name": "john"});

				// Then
				expect(persist.get("foo.age")).equal(null);
			});

			it("can remove with null", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);
				persist.set("foo", {"name": "john"});

				// When
				persist.set("foo", null);

				// Then
				expect(persist.get("foo")).equal(null);
			});

			it("can remove with undefined", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);
				persist.set("foo", {"name": "john"});

				// When
				persist.set("foo", undefined);

				// Then
				expect(persist.get("foo")).equal(null);
			});

			it("can automatically generate nested object", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("foo.foo.foo.foo.foo.name", "mary");

				// Then
				expect(persist.get("foo.foo.foo.foo.foo.name")).equal("mary");
				expect(persist.get("foo.foo.foo.foo.foo") instanceof Object).is.ok;
				expect(persist.get("foo.foo.foo.foo") instanceof Object).is.ok;
				expect(persist.get("foo.foo.foo") instanceof Object).is.ok;
				expect(persist.get("foo.foo") instanceof Object).is.ok;
				expect(persist.get("foo") instanceof Object).is.ok;
			});
		});

		describe("array", () => {
			it("cannot setting key value on array with warning", () => {
				// Given
				let warnCalled = false;
				const MockedPersist = injectPersist(
					{
						"./browser": {

							console: {
								...console,
								warn: () => {
									warnCalled = true;
								},
							},
							window: {

							},
						},

					}
				);

				const persist = new MockedPersist("TESTKEY");

				persist.set("", null);
				persist.set("0", {"name": "john"});


				// When
				persist.set("item", {"name": "john"});

				// Then
				expect(warnCalled).is.ok;
				expect(persist.get("item")).is.equal(null);
			});

			it("can set as global", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("1", {"name": "john"});

				// Then
				expect(persist.get("") instanceof Array).is.ok;
				expect(persist.get("")).is.deep.equal([null, {"name": "john"}]);
				expect(persist.get("").length).equal(2);
				expect(persist.get("0")).equal(null);
				expect(persist.get("1")).is.deep.equal({"name": "john"});
				expect(persist.get("1.name")).equal("john");
			});

			it("can set with global property", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("foo", [{"name": "john"}]);

				// Then
				expect(persist.get("foo")).to.deep.equal([{"name": "john"}]);
				expect(persist.get("foo.0")).to.deep.equal({"name": "john"});
				expect(persist.get("foo.0.name")).equal("john");
			});

			it("can automatically generate array", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("foo.1", {"name": "mary"});

				// Then
				expect(persist.get("foo")).to.deep.equal([null, {"name": "mary"}]);
				expect(persist.get("foo").length).to.deep.equal(2);
				expect(persist.get("foo.0")).to.deep.equal(null);
				expect(persist.get("foo.1")).to.deep.equal({"name": "mary"});
				expect(persist.get("foo.1.name")).to.deep.equal("mary");
			});

			it("can automatically generate nested array", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("foo.1.1.1.1", {"name": "mary"});

				// Then
				expect(persist.get("foo.1.1.1.1.name")).equal("mary");
				expect(persist.get("foo.1") instanceof Array).is.ok;
				expect(persist.get("foo.1.1") instanceof Array).is.ok;
				expect(persist.get("foo.1.1.1") instanceof Array).is.ok;
				expect(persist.get("foo.1.1.1.1") instanceof Array).is.not.ok;
			});
		});

		describe("method chaining", () => {
			it("can set method chaining", () => {
				// Given
				const persist = new Persist("TESTKEY");

				persist.set("", null);

				// When
				persist.set("index", 3)

					.set("isActive", true);

				// Then
				expect(persist.get("index")).to.equal(3);
				expect(persist.get("isActive")).to.equal(true);
			});
		});
	});
	describe("test exceed", () => {
		const pathname = location.pathname;

		beforeEach(() => {
			const length = sessionStorage.length;

			for (let i = 0; i < length; ++i) {
				sessionStorage.removeItem(sessionStorage.key(i));
			}
			Persist.clear();
		});
		afterEach(() => {
			history.replaceState({}, "", pathname);
		});

		it(`test depth test for exceed test (depths limit: 0)`, () => {
			try {
				// Given
				const persist = new(injectPersist(
					{
						"./storageManager": storageManagerForLimit(0),
						"./browser": {
							window: {},
							console: window,
						},
					}
				))("");

				// When
				persist.set("a", "");
			} catch (e) {
				// Then
				// An unconditional error occurs.
				expect(e).to.be.an.instanceof(PersistQuotaExceededError);
				return;
			}
			throw new Error("Errors should occur unconditionally, but they ignored them.");
		});
		it(`should check if other values of sessionStorage are displayed`, () => {
			try {
				// Given
				const persist = new(injectPersist(
					{
						"./storageManager": storageManagerForLimit(0),
						"./browser": {
							window: {},
							console: window,
						},
					}
				))("");

				sessionStorage.setItem("test1", "22");
				sessionStorage.setItem("test2", "1114");

				// When
				persist.set("a", "1");
			} catch (e) {
				// Then
				expect(e).to.be.an.instanceof(PersistQuotaExceededError);
				expect(e.message).to.have.string("test1");
				expect(e.message).to.have.string("test2");
				// 0: tmp__state__
				expect(e.values[1].key).to.be.equals("test2");
				expect(e.values[1].size).to.be.equals(4);

				expect(e.values[2].key).to.be.equals("test1");
				expect(e.values[2].size).to.be.equals(2);
				return;
			}
			throw new Error("Errors should occur unconditionally, but they ignored them.");
		});
		[2, 3, 4, 5].forEach(limit => {
			it(`test depth test for exceed test (depths limit: ${limit}, value limit: ${limit - 1})`, () => {
				// Given
				const persist = new(injectPersist(
					{
						"./storageManager": storageManagerForLimit(limit, limit - 1),
						"./browser": {
							window: {},
							console,
						},
					}
				))("");


				if (limit < 3) {
					// When
					history.pushState({}, "", "/a0");
					persist.set("a", "1");

					// Then
					const state1 = getDepths().length;

					expect(state1).to.be.equals(limit - 1);

					// When
					history.pushState({}, "", "/a1");
					persist.set("a", "1");

					// Then
					const state2 = getDepths().length;

					expect(state2).to.be.equals(limit - 1);
				} else {
					for (let j = 0; j < limit - 2; ++j) {
						// When
						history.pushState({}, "", `/a${j}`);
						persist.set("a", "1");

						// Then
						// value limit = 3
						// start, a0
						// start, a0 , a1
						// a0 , a1, a2
						const state = getDepths().length;

						expect(state).to.be.equals(j + 2);
					}
				}
				// Keep adding any number.
				for (let i = 0; i < 20; ++i) {
					// When
					history.pushState({}, "", `/a${limit + i}`);
					persist.set("a", 1);

					// Then
					const currentState = getDepths().length;

					expect(currentState).to.be.equals(limit - 1);
				}
			});
		});
		[1, 2, 3, 4, 5].forEach(limit => {
			it(`test depth test for exceed test (limit: ${limit})`, () => {
				// Given
				const mockModules = injectPersistModules({
					sessionLimitCount: limit,
				});
				const mockHistory = mockModules["./browser"].history;
				const mockLocation = mockModules["./browser"].location;
				const persist = new(injectPersist(mockModules))("");

				for (let i = 2; i <= 8; ++i) {
					// When
					mockHistory.pushState({}, "", `/a${i}`);
					persist.set("a", "1");

					// Then
					const depths = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS);
					const length = depths.length;

					if (i < limit) {
						// 1: start
						// 2: start, a2
						// 3: start, a2, a3
						// 4: start, a2, a3, a4
						// 5: start, a2, a3, a4, a5
						expect(length).to.be.equal(i);
						expect(depths[0].lastIndexOf(pathname)).to.be.not.equal(-1);
					} else if (i > limit) {
						// limit = 1
						// 1: start
						// 2: a2
						// 3: a3
						// 4: a4
						// 5: a5
						// limit = 2
						// 1: start
						// 2: start, a2
						// 3: a2, a3
						// 4: a3, a4
						// 5: a4, a5
						expect(length).to.be.equal(limit);
						expect(depths[0].indexOf(`/a${i - limit + 1}`)).to.be.not.equal(-1);

						// removed item (0 ~ i - limit)
						for (let j = 0; j < i - limit + 1; ++j) {
							expect(StorageManager.getStateByKey(utils.getStorageKey(`${mockLocation.origin}/a${j}`), "")).to.be.not.ok;
						}

						// saved item (i - limit + 1 ~ i)
						for (let j = 0; j < limit; ++j) {
							const url = `${mockLocation.origin}/a${i - limit + 1 + j}`;

							expect(depths[j]).to.be.equals(url);
							expect(StorageManager.getStateByKey(utils.getStorageKey(url), "").a).to.be.ok;
						}
					} else {
						// i === limit is no delete
						expect(length).to.be.equal(limit);
					}
				}
			});
		});
	});
	describe("test depth", () => {
		const pathname = location.pathname;

		beforeEach(() => {
			Persist.clear();
		});
		afterEach(() => {
			history.replaceState({}, "", pathname);
		});
		it("test depth start -> a -> b -> c", () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersist(mockModules);
			const persist = new InjectedPersist("");

			InjectedPersist.clear();
			// When
			const prevUrl1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			persist.set("0", 1);
			const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			mockHistory.pushState({}, "", "/a");
			const prevUrl2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			persist.set("a", 1);
			const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			mockHistory.pushState({}, "", "/b");
			const prevUrl3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			persist.set("b", 1);
			const length3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			mockHistory.pushState({}, "", "/c");
			const prevUrl4 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			persist.set("c", 1);
			const length4 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl4 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			// Then
			expect(length1).to.be.equals(1);
			expect(length2).to.be.equals(2);
			expect(length3).to.be.equals(3);
			expect(length4).to.be.equals(4);

			expect(prevUrl1).to.be.not.ok;
			expect(prevUrl2.lastIndexOf(pathname)).to.be.equals(prevUrl2.length - pathname.length);
			expect(prevUrl3.lastIndexOf("a")).to.be.equals(prevUrl3.length - 1);
			expect(prevUrl4.lastIndexOf("b")).to.be.equals(prevUrl4.length - 1);

			expect(currentUrl1).to.be.equals(prevUrl2);
			expect(currentUrl2).to.be.equals(prevUrl3);
			expect(currentUrl3).to.be.equals(prevUrl4);
			expect(currentUrl4.lastIndexOf("c")).to.be.equals(currentUrl4.length - 1);
		});
		it("test depth start -> a -> b -> a(new)", () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersist(mockModules);
			const persist = new InjectedPersist("");

			InjectedPersist.clear();

			// When
			// start
			persist.set("0", 1);

			// a
			mockHistory.pushState({}, "", "/a");

			persist.set("a", 1);

			// b
			mockHistory.pushState({}, "", "/b");

			persist.set("b", 1);

			// a (new)
			mockHistory.pushState({}, "", "/a");

			// remove (a) information
			injectPersist(injectPersistModules({
				href: `${INJECT_URL}/a`,
			}));

			// start -> a(x) -> b -> a
			const depths1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS);

			persist.set("c", 1);
			// start -> b -> a(new)
			const depths2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS);
			const length1 = depths1.length;
			const length2 = depths2.length;

			// Then
			expect(length1).to.be.equals(3);
			expect(length2).to.be.equals(3);

			// start
			expect(depths1[0].lastIndexOf(pathname)).to.be.equals(depths1[0].length - pathname.length);
			// b
			expect(depths1[1].lastIndexOf("b")).to.be.equals(depths1[1].length - 1);
			// a
			expect(depths1[2].lastIndexOf("a")).to.be.equals(depths1[2].length - 1);

			// start
			expect(depths2[0].lastIndexOf(pathname)).to.be.equals(depths2[0].length - pathname.length);
			// b
			expect(depths2[1].lastIndexOf("b")).to.be.equals(depths2[1].length - 1);
			// a
			expect(depths2[2].lastIndexOf("a")).to.be.equals(depths2[2].length - 1);
		});
		it("test depth start -> a -> start(back) -> a(forward)", async () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersist(mockModules);
			const persist = new InjectedPersist("");

			InjectedPersist.clear();

			// When
			// start
			persist.set("value", 1);
			const value1 = persist.get("value");
			const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			// a
			mockHistory.pushState({}, "", "/a");
			persist.set("value", 2);
			const value2 = persist.get("value");
			const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			// start (back)
			mockHistory.go(-1);
			await wait();


			const value3 = persist.get("value");
			const length3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			// a (forward)
			mockHistory.go(1);
			await wait();

			const value4 = persist.get("value");
			const length4 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
			const currentUrl4 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);


			// Then
			// start
			expect(value1).to.be.equals(1);
			expect(length1).to.be.equals(1);
			expect(currentUrl1.lastIndexOf(pathname)).to.be.equals(currentUrl1.length - pathname.length);

			// a
			expect(value2).to.be.equals(2);
			expect(length2).to.be.equals(2);
			expect(currentUrl2.lastIndexOf("a")).to.be.equals(currentUrl2.length - 1);

			// start(back)
			// same value1
			expect(value3).to.be.equals(value1);
			expect(length3).to.be.equals(2);
			expect(currentUrl3.lastIndexOf(pathname)).to.be.equals(currentUrl1.length - pathname.length);

			// a (forward)
			// same value2
			expect(value4).to.be.equals(value2);
			expect(length4).to.be.equals(2);
			expect(currentUrl4.lastIndexOf("a")).to.be.equals(currentUrl2.length - 1);
		});
		it("test depth start -> a -> b -> start(back) -> a(new)", async () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersist(mockModules);
			const persist = new InjectedPersist("");

			InjectedPersist.clear();

			// When
			// start
			persist.set("value", 1);

			// a
			mockHistory.pushState({}, "", "/a");
			persist.set("value", 2);

			// b
			mockHistory.pushState({}, "", "/b");
			persist.set("value", 3);

			// start(back)
			mockHistory.go(-2);
			await wait();
			const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// a(new)
			mockHistory.pushState({}, "", "/a");
			await wait();
			const value = persist.get("value");
			const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// Then
			// start -> a -> b
			expect(length1).to.be.equals(3);
			// start -> a
			expect(length2).to.be.equals(2);
			expect(value).to.be.not.ok;
		});
		it("test depth with reloead start -> a -> b -> start -> start(reload)", async () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersist(mockModules);
			const persist = new InjectedPersist("");

			InjectedPersist.clear();

			// When
			// start
			persist.set("value", 1);

			// a
			mockHistory.pushState({}, "", "/a");
			persist.set("value", 2);

			// b
			mockHistory.pushState({}, "", "/b");
			persist.set("value", 3);

			// start(back)
			mockHistory.go(-2);
			await wait();
			const value1 = persist.get("value");
			const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// start(reload)
			// remove start information
			injectPersist(
				{
					"./utils": {
						...utils,
						getNavigationType: () => 1,
					},
				}
			);
			const value2 = persist.get("value");
			const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// Then
			expect(value1).to.be.equals(1);
			expect(length1).to.be.equals(3);

			expect(value2).to.be.not.ok;
			expect(length2).to.be.equals(3);
		});
		it("test depth only get() with start -> a -> b -> start(back)", async () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersist(mockModules);
			const persist = new InjectedPersist("");

			InjectedPersist.clear();

			// When
			// start
			persist.get("a");
			const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// a
			mockHistory.pushState({}, "", "/a");
			persist.get("a");
			const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// b
			mockHistory.pushState({}, "", "/b");
			persist.get("a");
			const length3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// start(back)
			mockHistory.go(-2);
			await wait();
			persist.get("a");
			const length4 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// start(reload)
			// remove start information
			injectPersist(
				{
					"./utils": {
						...utils,
						getNavigationType: () => 1,
					},
				}
			);

			// same length4
			const length5 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

			// Then
			expect(length1).to.be.equals(1);
			expect(length2).to.be.equals(2);
			expect(length3).to.be.equals(3);
			expect(length4).to.be.equals(3);
			expect(length5).to.be.equals(3);
		});
		it("should check remove 'b' depth when replaceDepth for start -> a -> b -> c(replace)", () => {
			// Given
			const mockModules = injectPersistModules();
			const mockHistory = mockModules["./browser"].history;
			const InjectedPersist = injectPersistExports(mockModules);
			const persist = new InjectedPersist.default("");

			InjectedPersist.default.clear();

			// When
			// start
			persist.set("0", 1);

			// a
			mockHistory.pushState({}, "", "/a");

			persist.set("a", 1);

			// b
			mockHistory.pushState({}, "", "/b");

			persist.set("b", 1);

			// c (replace)
			mockHistory.replaceState({}, "", "/c");

			InjectedPersist.replaceDepth();


			// start -> a(x) -> c
			const depths = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS);

			// Then
			expect(depths.length).to.be.equals(3);
			// start
			expect(new RegExp(`${pathname}$`, "g").test(depths[0])).to.be.true;
			// a
			expect(/\/a$/g.test(depths[1])).to.be.true;
			// c
			expect(/\/c$/g.test(depths[2])).to.be.true;
		});
	});
});
