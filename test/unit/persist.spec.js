import Persist from "../../src/Persist";
import PersistInjector from "inject-loader!../../src/Persist";

describe("Persist", function() {
    describe("#persist", function() {
        it("save number, get number", () => {
            // Given
            const data = 100;

            // When
            Persist("TESTKEY", data);

            // Then
            expect(Persist("TESTKEY")).to.equal(data);
        });

        it("save string data, get string data", () => {
            // Given
            const data = JSON.stringify({
                "scrollTop": 100
            });

            // When
            Persist("TESTKEY", data);

            // Then
            expect(Persist("TESTKEY")).to.equal(data);
        });

        it("save object data, get object data", () => {
            // Given
            const data = {
                "scrollTop": 100
            };

            // When
            Persist("TESTKEY", data);

            // Then
            expect(Persist("TESTKEY")).to.deep.equal({
                "scrollTop": 100
            });
        });

        it("remove state data with undefined and key", () => {
            // Given
            const data = {
                "scrollTop": 100
            };
            Persist("TESTKEY", data);

            // When
            Persist("TESTKEY", undefined);

            // Then
            expect(Persist("TESTKEY")).to.equal(null);
        });

        it("remove state data with null and key", () => {
            // Given
            const data = {
                "scrollTop": 100
            };
            Persist("TESTKEY", data);

            // When
            Persist("TESTKEY", null);

            // Then
            expect(Persist("TESTKEY")).to.equal(null);
        });
    });

    describe("path param with instance", function() {
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
                            }
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
});