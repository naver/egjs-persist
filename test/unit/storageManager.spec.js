/* eslint-disable */
import * as StorageManager from "../../src/storageManager";
import StorageManagerInjector from "inject-loader!../../src/storageManager";

describe("StorageManager", function() {
    describe("reset when initialize", function() {
        it("Should call reset when no BACK/FORWARD navigated", () => {
            // Given
            StorageManager.setStateByKey("TEST", 100);

            // When
            var MockStorageManager = StorageManagerInjector(
                {
                    "./utils": {
                        isBackForwardNavigated: () => false
                    }
                }
            );

            // Then
            expect(StorageManager.getStateByKey("TEST")).is.not.exist;
        });

        it("Should not call reset when BACK/FORWARD navigated", () => {
            // Given
            StorageManager.setStateByKey("TEST", 100);

            // When
            var MockStorageManager = StorageManagerInjector(
                {
                    "./utils": {
                        isBackForwardNavigated: () => true
                    }
                }
            );

            // Then
            expect(StorageManager.getStateByKey("TEST")).is.exist;
        });
    });

    describe("getter setter", function() {
        it("#setStateByKey", () => {
            // Given

            // When
            StorageManager.setStateByKey("TEST", 100);

            // Then
            expect(StorageManager.getStateByKey("TEST")).to.equal(100);
        });

        it("#getStateByKey", () => {
            // Given
            StorageManager.setStateByKey("TEST", 100);

            // When
            const data = StorageManager.getStateByKey("TEST");

            // Then
            expect(data).to.equal(100);
        });

        it("#reset", () => {
            // Given
            StorageManager.setStateByKey("TEST", 100);

            // When
            StorageManager.reset();

            // Then
            const data = StorageManager.getStateByKey("TEST");
            expect(data).to.not.exist;
        });
    });
    describe("location.href with hash", function() {
        [true, false].forEach(hash => {
            it(`should check with hash (hash: ${hash})`, () => {
                // Given
                var MockStorageManager1 = StorageManagerInjector(
                    {
                        "./browser": {
                            location: {
                                href: "a#hash"
                            },
                            history: window.history,
                            sessionStorage: window.sessionStorage,
                            window: window
                        }
                    }
                );
                var MockStorageManager2 = StorageManagerInjector(
                    {
                        "./browser": {
                            location: {
                                href: "a"
                            },
                            history: window.history,
                            sessionStorage: window.sessionStorage,
                            window: window
                        }
                    }
                );
                // When
                MockStorageManager1.setStateByKey("TEST1", 100, hash);
                MockStorageManager2.setStateByKey("TEST2", 100, hash);
                // Then
                expect(MockStorageManager1.getStateByKey("TEST1", hash)).to.be.equals(100);
                expect(MockStorageManager2.getStateByKey("TEST2", hash)).to.be.equals(100);
                if (hash) {
                    // MockStorageManager1 is different from MockStorageManager2.
                    // hash: true => MockStorageManager1 has TEST1, has not TEST2
                    // hash: true => MockStorageManager2 has TEST2, has not TEST1
                    expect(MockStorageManager1.getStateByKey("TEST2", hash)).to.be.not.equals(100);
                    expect(MockStorageManager2.getStateByKey("TEST1", hash)).to.be.not.equals(100);
                } else {
                    // hash: false => MockStorageManager1 has TEST1, TEST2
                    // hash: false => MockStorageManager2 has TEST1, TEST2
                    expect(MockStorageManager1.getStateByKey("TEST2", hash)).to.be.equals(100);
                    expect(MockStorageManager2.getStateByKey("TEST1", hash)).to.be.equals(100);
                }
            });
        });
    });
    describe("storage usage control", function() {
        it("Resetting should remove storage usage", () => {
            // Given
            const storageKey = StorageManager.getStorageKey();
            const storage = StorageManager.getStorage();
            StorageManager.setStateByKey("TEST", 100);

            // When
            StorageManager.reset();

            // Then
            const storageValue = storage.getItem(storageKey);
            expect(storageValue).to.not.exist;
        });

        it("Removing values should reduce storage usage", () => {
            // Given
            const storageKey = StorageManager.getStorageKey();
            const storage = StorageManager.getStorage();
            StorageManager.setStateByKey("TEST", 100);
            const prvStorageSize = storage.getItem(storageKey).length;

            // When
            StorageManager.setStateByKey("TEST", undefined);

            // Then
            const curStorageSize = storage.getItem(storageKey).length;
            expect(prvStorageSize > curStorageSize).to.be.ok;
        });
    });

    describe("lack of dependency", function() {
        it("no error with no sessionStorage/localStorage", () => {
            // Given
            let errorThrown = false;
            const mockDependcency = {
                "./browser": {
                    sessionStorage: undefined,
                    localStorage: undefined,
                    history: history,
                    JSON: JSON,
                    location: location,
                    window: window
                }
            };

            // When
            try {
                var MockStorageManager = StorageManagerInjector(mockDependcency);
            } catch (e) {
                errorThrown = true;
            }

            // Then
            expect(errorThrown).to.not.ok;
        });

        it("no error with no JSON", () => {
            // Given
            let errorThrown = false;
            const mockDependcency = {
                "./browser": {
                    sessionStorage: undefined,
                    localStorage: undefined,
                    history: history,
                    JSON: undefined,
                    location: location,
                    window: window
                }
            };

            // When
            try {
                var MockStorageManager = StorageManagerInjector(mockDependcency);
            } catch (e) {
                errorThrown = true;
            }

            // Then
            expect(errorThrown).to.not.ok;
        });
    });

    describe("storage value exception", function() {
        const consoleWarn = console.warn;
        afterEach(() => {
            console.warn = consoleWarn;            
        });
        const storageValues = ['{', '[ 1,2,3 ]', '1', '1.234', '"123"'];
        storageValues.forEach(storageVal => {
            it("show warning and no error with storage value: " + storageVal, () => {
                // Given
                StorageManager.getStorage().setItem(StorageManager.getStorageKey(), storageVal);
                let errorThrown = false;
                let warningShown = false;
                console.warn = function () {
                    warningShown = true;
                };

                // When
                try {
                    let MockStorageManager = StorageManagerInjector({
                        "./utils": {
                            isBackForwardNavigated: () => true
                        },
                        "./browser": {
                            sessionStorage: sessionStorage,
                            localStorage: localStorage,
                            history: history,
                            JSON: JSON,
                            location: location,
                            window: window
                        }
                    });
                    MockStorageManager.getStateByKey("TEST");
                } catch (e) {
                    errorThrown = true;
                }

                // Then
                expect(errorThrown).to.not.ok;
                expect(warningShown).to.ok;
            });
        })
    });
});