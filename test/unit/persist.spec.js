import Persist from "../../src/Persist";

describe("persist", () => {
	let persist;

	beforeEach(() => {
		persist = new Persist();
	});

	afterEach(() => {
		
		persist = null;
	});

	it("should created instance", () => {
		expect(persist).to.be.an.instanceof(Persist);
	});
});
