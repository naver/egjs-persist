import PersistInjector from "inject-loader!../../src/Persist";
import StorageManagerInjector from "inject-loader!../../src/storageManager";
import Persist from "../../src/Persist";
import * as utils from "../../src/utils";
import * as StorageManager from "../../src/storageManager";
import { CONST_PERSIST_STATE, CONST_DEPTHS, CONST_LAST_URL } from "../../src/consts";
import {wait} from "./TestHelper";

const StorageManagerUsingHistory = StorageManagerInjector(
    {
        "./browser": {
            window: window,
            history: window.history,
            location: window.location,
            JSON: window.JSON,
            sessionStorage: null,
            localStorage: null
        }
    }
);

const PersistUsingHistory = PersistInjector(
    {
        "./storageManager": StorageManagerUsingHistory
    }
);


describe("Persist", function() {

    describe("isNeeded", function() {
        it("isNeeded on chrome", () => {
            // Given
            // When
            const isNeeded = Persist.isNeeded();

            // Then
            expect(isNeeded).to.be.true;
        });
    });

    describe("clear", function() {
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
    describe("History", function() {
        it("save index, get index when history.state is null", () => {
            // Given
            history.replaceState(null,null,null);
            expect(history.state).to.equal(null);
            const persist = new PersistUsingHistory("TESTKEY");
            
            // When
            persist.set("flick", {
                index: 10
            });

            // Then
            expect(persist.get("flick.index")).to.equal(10);
        });
    });

    describe("Preserve types", function() {
        beforeEach(() => {
            location.hash = "";
            sessionStorage.clear();
        });
        it("save number, get number(hash is all different)", () => {
        // Given
        const persist = new Persist({
            key: "TESTKEY",
            excludeHash: true,
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
                "scrollTop": 100
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
                "scrollTop": 100
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
                "scrollTop": 100
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
                "scrollTop": 100
            };
            persist.set("", data);

            // When
            persist.set("", null);

            // Then
            expect(persist.get("")).to.equal(null);
        });
    });

    describe("path param with instance", function() {
    	describe("get global", function() {
    		it("can get data with empty path string", () => {
    			// Given
				const persist = new Persist("TESTKEY");

				// When
				persist.set("a", 1);
				persist.set("b", 2);

				// Then
				expect(persist.get("")).to.deep.equal({
					a: 1,
					b: 2
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
					b: 2
				});
			});
		});

        describe("set global with empty path string", function() {
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
                persist.set("", { "name": "john" });

                // Then
                expect(persist.get("")).to.deep.equal({ "name": "john" });
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
        describe("object", function() {
            it("can set with global property", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);

                // When
                persist.set("foo", { "name": "john" });

                // Then
                expect(persist.get("foo")).to.deep.equal({ "name": "john" });
            });

            it("can set on property", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);
                persist.set("foo", { "name": "john" });

                // When
                persist.set("bar", { "name": "mary" });

                // Then
                expect(persist.get("")).to.deep.equal(
                    {
                        "foo": { "name": "john" },
                        "bar": { "name": "mary" }
                    }
                );
                expect(persist.get("foo")).to.deep.equal({ "name": "john" });
                expect(persist.get("bar")).to.deep.equal({ "name": "mary" });
                expect(persist.get("foo.name")).equal("john");
                expect(persist.get("bar.name")).equal("mary");
            });

            it("can set additional property", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);
                persist.set("foo", { "name": "john" });

                // When
                persist.set("foo.age", 33);

                // Then
                expect(persist.get("foo")).to.deep.equal({ "name": "john", "age": 33 });
                expect(persist.get("foo.age")).equal(33);
            });

            it("null on empty property", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);

                // When
                persist.set("foo", { "name": "john" });

                // Then
                expect(persist.get("foo.age")).equal(null);
            });

            it("can remove with null", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);
                persist.set("foo", { "name": "john" });

                // When
                persist.set("foo", null);

                // Then
                expect(persist.get("foo")).equal(null);
            });

            it("can remove with undefined", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);
                persist.set("foo", { "name": "john" });

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

        describe("array", function() {

            it("cannot setting key value on array with warning", () => {
                // Given
                let warnCalled = false;
                const MockedPersist = PersistInjector(
                    {
                        "./browser": {
                            console: {
                                warn: function() {
                                    warnCalled = true;
                                }
                            },
                            window: {

                            },
                        }
                    }
                );

                const persist = new MockedPersist("TESTKEY");
                persist.set("", null);
                persist.set("0", { "name": "john" });


                // When
                persist.set("item", { "name": "john" });

                // Then
                expect(warnCalled).is.ok;
                expect(persist.get("item")).is.equal(null);
            });

            it("can set as global", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);

                // When
                persist.set("1", { "name": "john" });

                // Then
                expect(persist.get("") instanceof Array).is.ok;
                expect(persist.get("")).is.deep.equal([null, { "name": "john" }]);
                expect(persist.get("").length).equal(2);
                expect(persist.get("0")).equal(null);
                expect(persist.get("1")).is.deep.equal({ "name": "john" });
                expect(persist.get("1.name")).equal("john");
            });

            it("can set with global property", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);

                // When
                persist.set("foo", [{ "name": "john" }]);

                // Then
                expect(persist.get("foo")).to.deep.equal([{ "name": "john" }]);
                expect(persist.get("foo.0")).to.deep.equal({ "name": "john" });
                expect(persist.get("foo.0.name")).equal("john");
            });

            it("can automatically generate array", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);

                // When
                persist.set("foo.1", { "name": "mary" });

                // Then
                expect(persist.get("foo")).to.deep.equal([null, { "name": "mary" }]);
                expect(persist.get("foo").length).to.deep.equal(2);
                expect(persist.get("foo.0")).to.deep.equal(null);
                expect(persist.get("foo.1")).to.deep.equal({ "name": "mary" });
                expect(persist.get("foo.1.name")).to.deep.equal("mary");
            });

            it("can automatically generate nested array", () => {
                // Given
                const persist = new Persist("TESTKEY");
                persist.set("", null);

                // When
                persist.set("foo.1.1.1.1", { "name": "mary" });

                // Then
                expect(persist.get("foo.1.1.1.1.name")).equal("mary");
                expect(persist.get("foo.1") instanceof Array).is.ok;
                expect(persist.get("foo.1.1") instanceof Array).is.ok;
                expect(persist.get("foo.1.1.1") instanceof Array).is.ok;
                expect(persist.get("foo.1.1.1.1") instanceof Array).is.not.ok;
            });
        });

        describe("method chaining", function() {
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
        })
    });
    describe("test depth", function () {
        const pathname = location.pathname;
        beforeEach(() => {
            Persist.clear();
        });
        afterEach(() => {
            history.replaceState({}, "", pathname);
        })
        it("test depth start -> a -> b -> c", () => {
            // Given
            const persist = new Persist();

            // When
            const prevUrl1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);
            persist.set("0", 1);
            const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
            const currentUrl1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

            history.pushState({}, "", "/a");
            const prevUrl2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);
            persist.set("a", 1);
            const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
            const currentUrl2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

            history.pushState({}, "", "/b");
            const prevUrl3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);
            persist.set("b", 1);
            const length3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
            const currentUrl3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

            history.pushState({}, "", "/c");
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
            const persist = new Persist();

            // When
            // start
            persist.set("0", 1);

            // a
            history.pushState({}, "", "/a");
            persist.set("a", 1);

            // b
            history.pushState({}, "", "/b");
            persist.set("b", 1);

            // a (new)
            history.pushState({}, "", "/a");
            
            // remove (a) information
            PersistInjector(
                {
                    "./utils": {
                        ...utils,
                        getNavigationType: () => 0,
                    },
                }
            );
            const depths1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS);

            persist.set("c", 1);
            const depths2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS);            
            const length1 = depths1.length;
            const length2 = depths2.length;

            // Then
            expect(length1).to.be.equals(2);
            expect(length2).to.be.equals(3);

            // start
            expect(depths1[0].lastIndexOf(pathname)).to.be.equals(depths1[0].length - pathname.length);
            expect(depths1[1].lastIndexOf("b")).to.be.equals(depths1[1].length - 1);
            expect(depths2[0].lastIndexOf(pathname)).to.be.equals(depths2[0].length - pathname.length);
            expect(depths2[1].lastIndexOf("b")).to.be.equals(depths2[1].length - 1);
            expect(depths2[2].lastIndexOf("a")).to.be.equals(depths2[2].length - 1);
        });
        it("test depth start -> a -> start(back) -> a(forward)", async () => {
            // Given
            const persist = new Persist();

            // When
            // start
            persist.set("value", 1);
            const value1 = persist.get("value");
            const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
            const currentUrl1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

            // a
            history.pushState({}, "", "/a");
            persist.set("value", 2);
            const value2 = persist.get("value");
            const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
            const currentUrl2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

            // start (back)
            history.go(-1);
            await wait();

            const value3 = persist.get("value");
            const length3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;
            const currentUrl3 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

            // a (forward)
            history.go(1);
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
            const persist = new Persist();

            // When
            // start
            persist.set("value", 1);

            // a
            history.pushState({}, "", "/a");
            persist.set("value", 2);

            // b
            history.pushState({}, "", "/b");
            persist.set("value", 3);

            // start(back)
            history.go(-2);
            await wait();
            const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

            // a(new)
            history.pushState({}, "", "/a");
            await wait();
            const value = persist.get("value");
            const length2 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

            // Then
            expect(length1).to.be.equals(3);
            expect(length2).to.be.equals(1);
            expect(value).to.be.not.ok;
        });
        it("test depth with reloead start -> a -> b -> start -> start(reload)", async () => {
            // Given
            const persist = new Persist();

            // When
            // start
            persist.set("value", 1);

            // a
            history.pushState({}, "", "/a");
            persist.set("value", 2);

            // b
            history.pushState({}, "", "/b");
            persist.set("value", 3);

            // start(back)
            history.go(-2);
            await wait();
            const value1 = persist.get("value");
            const length1 = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length;

            // start(reload)
            // remove start information
            PersistInjector(
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
        })
    });
});
