import {RegExp, parseFloat, performance} from "../../src/browser";
import utils from "../../src/utils";
import UtilsInjector from "inject-loader!../../src/utils";




describe("utils", function() {
    var ualist = [
        {
            "device":  "Android 2.3.6 SamsungBrowser",
            "ua": "Mozilla/5.0 (Linux;U;Android 2.3.6;ko-kr;SHV-E160S Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
            "isNeeded": false
        },
        {
            "device":  "Android 4.3.0 chrome42",
            "ua": "Mozilla/5.0 (Linux; Android 4.3.0; SM-G900S Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.108 Mobile Safari/537.36",
            "isNeeded": true
        },
        {
            "device":  "Android 4.3.0(galaxy s3) SamsungBrowser",
            "ua": "Mozilla/5.0 (Linux; Android 4.3; ko-kr; SHW-M440S Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
            "isNeeded": true
        },
        {
            "device":  "Android 4.0.4 webview",
            "ua": "Mozilla/5.0 (Linux; U; Android 4.0.4; SM-E210S Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 NAVER(inapp; search; 490; 7.4.1)",
            "isNeeded": false
        },
        {
            "device":  "Android 5.1.1 SamsungBrowser",
            "ua": "Mozilla/5.0 (Linux; Android 5.1.1; SAMSUNG SM-G925S Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.2 Chrome/38.0.2125.102 Mobile Safari/537.36",
            "isNeeded": true
        },
        {
            "device":  "iOS 8.0",
            "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12B440",
            "isNeeded": false
        },
        {
            "device":  "iOS 7.0",
            "ua": "Mozilla/5.0 (iPhone;CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B146 Safari/8536.25",
            "isNeeded": false
        },
        {
            "device":  "IE10",
            "ua": "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
            "isNeeded": true
        },
        {
            "device":  "IE9",
            "ua": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
            "isNeeded": true
        },
        {
            "device":  "Chrome",
            "ua": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/53.0.2785.143 Chrome/53.0.2785.143 Safari/537.36",
            "isNeeded": true
        }
    ];

    describe("#isNeeded", function() {
        ualist.forEach(function(uaInfo) {
            it(`on ${uaInfo.device}`, () => {
                // Given
                var MockUtils = UtilsInjector(
                    {
                        "./browser": {
                            navigator: {
                                userAgent: uaInfo.ua
                            },
                            RegExp: RegExp,
                            parseFloat: parseFloat,
                            performance: performance
                        }
                    }
                );

                // When
                const isPersistNeeded = MockUtils.isNeeded;

                // Then
                expect(isPersistNeeded).to.equal(uaInfo.isNeeded);
            });

        });
    });

    describe("#isBackForwardNavigated", function() {
        it(`should return true, when back/forward navigated`, () => {
            // Given
            var MockUtils = UtilsInjector(
                {
                    "./browser": {
                        navigator: navigator,
                        performance: {
                            navigation: {
                                TYPE_BACK_FORWARD: 2,
                                TYPE_NAVIGATE: 0,
                                TYPE_RELOAD: 1,
                                TYPE_RESERVED: 255,
                                type: 2
                            }
                        },
                        RegExp: RegExp,
                        parseFloat: parseFloat
                    }
                }
            );

            // When
            const isBackForwardNavigated = MockUtils.isBackForwardNavigated();

            // Then
            expect(isBackForwardNavigated).is.ok;
        });

        it(`should return false, when refresh/address navigated`, () => {
            // Given
            var MockUtils = UtilsInjector(
                {
                    "./browser": {
                        navigator: navigator,
                        performance: {
                            navigation: {
                                TYPE_BACK_FORWARD: 2,
                                TYPE_NAVIGATE: 0,
                                TYPE_RELOAD: 1,
                                TYPE_RESERVED: 255,
                                type: 1
                            }
                        },
                        RegExp: RegExp,
                        parseFloat: parseFloat
                    }
                }
            );

            // When
            const isBackForwardNavigated = MockUtils.isBackForwardNavigated();

            // Then
            expect(isBackForwardNavigated).is.not.ok;
        });

        it(`should not throw error on iOS 7`, () => {
            // Given
            let isErrorThrown = false;

            // When
            try {
                var MockUtils = UtilsInjector(
                    {
                        "./browser": {
                            navigator: navigator,
                            RegExp: RegExp,
                            parseFloat: parseFloat,
                            performance: performance
                        }
                    }
                );
                MockUtils.isBackForwardNavigated();
            } catch (e) {
                debugger;
                isErrorThrown = true;
            }

            // Then
            expect(isErrorThrown).is.not.ok;
        });

        it(`should not throw error on IE8`, () => {
            // Given
            let isErrorThrown = false;

            // When
            try {
                var MockUtils = UtilsInjector(
                    {
                        "./browser": {                            
                            performance: {
                                navigation: {
                                    redirectCount: 0,
                                    type: 1
                                }
                            },
                            navigator: navigator,
                            RegExp: RegExp
                        }
                    }
                );
                MockUtils.isBackForwardNavigated();
            } catch (e) {
                isErrorThrown = true;
            }

            // Then
            expect(isErrorThrown).is.not.ok;
        });
    });
});