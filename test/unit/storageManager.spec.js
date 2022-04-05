/* eslint-disable */
import * as StorageManager from "../../src/storageManager";
import * as orgBrowser from "../../src/browser";
import StorageManagerInjector from "inject-loader!../../src/storageManager";
import { getUrl, getStorageKey } from "../../src/utils";

const KEY = getStorageKey(getUrl());

describe("StorageManager", function() {
    describe("getter setter", function() {
        it("#setStateByKey", () => {
            // Given
            // When
            StorageManager.setStateByKey(KEY, "TEST", 100);

            // Then
            expect(StorageManager.getStateByKey(KEY, "TEST")).to.equal(100);
        });

        it("#getStateByKey", () => {
            // Given
            StorageManager.setStateByKey(KEY, "TEST", 100);

            // When
            const data = StorageManager.getStateByKey(KEY, "TEST");

            // Then
            expect(data).to.equal(100);
        });

        it("#reset", () => {
            // Given
            StorageManager.setStateByKey(KEY, "TEST", 100);

            // When
            StorageManager.reset(KEY);

            // Then
            const data = StorageManager.getStateByKey(KEY, "TEST");
            expect(data).to.not.exist;
        });
    });
    describe("storage usage control", function() {
        it("Resetting should remove storage usage", () => {
            // Given
            const storage = StorageManager.getStorage();
            StorageManager.setStateByKey(KEY, "TEST", 100);

            // When
            StorageManager.reset(KEY);

            // Then
            const storageValue = storage.getItem(KEY);
            expect(storageValue).to.not.exist;
        });

        it("Removing values should reduce storage usage", () => {
            // Given
            const storage = StorageManager.getStorage();
            StorageManager.setStateByKey(KEY, "TEST", 100);
            const prvStorageSize = storage.getItem(KEY).length;

            // When
            StorageManager.setStateByKey(KEY, "TEST", undefined);

            // Then
            const curStorageSize = storage.getItem(KEY).length;
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
                StorageManager.getStorage().setItem(KEY, storageVal);
                let errorThrown = false;
                let warningShown = false;

                // When
                try {
                    let MockStorageManager = StorageManagerInjector({
                        "./browser": {
							...orgBrowser,
							console: {
								warn: () => {
									warningShown = true;
								},
							}
                        }
                    });
                    MockStorageManager.getStateByKey(KEY, "TEST");
                } catch (e) {
					console.log(e.message);
                    errorThrown = true;
                }

                // Then
                expect(errorThrown).to.not.ok;
                expect(warningShown).to.ok;
            });
        })
    });
});
