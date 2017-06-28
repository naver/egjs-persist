import Persist from "../../src/Persist";

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
});