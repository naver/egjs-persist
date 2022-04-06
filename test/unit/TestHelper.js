/* eslint-disable no-use-before-define */
import PersistInjector from "inject-loader!../../src/Persist";
import HashPersistInjector from "inject-loader!../../src/HashPersist";
import StorageManagerInjector from "inject-loader!../../src/storageManager";
import HistoryManagerInjector from "inject-loader!../../src/historyManager";
import PersistHistoryInjector from "inject-loader!../../src/PersistHistory";
import UtilsInjector from "inject-loader!../../src/utils";
import {CONST_PERSIST_STATE, CONST_DEPTHS} from "../../src/consts";
import * as StorageManager from "../../src/storageManager";
import * as orgBrowser from "../../src/browser";
import PersistHistory from "../../src/PersistHistory";
import {updateDepth} from "../../src";


const DEFAULT_HREF = location.href;

export const INJECT_URL = "https://inject.com";

/* eslint-disable import/prefer-default-export */
export function wait(time = 100) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

export function throwQuotaExceedError() {
	const err = new Error(`Failed to execute 'setItem' on 'Storage': Setting the value of 'URL' exceeded the quota.`);

	err.name = "QuotaExceededError";

	throw err;
}
export function reloadPersist() {
	PersistHistory.url = "";
	PersistHistory.hashUrl = "";
	PersistHistory.hash = null;
	updateDepth(1);
}
export function clearStorage() {
	const length = sessionStorage.length;

	for (let i = 0; i < length; ++i) {
		sessionStorage.removeItem(sessionStorage.key(i));
	}
}
export function injectBrowser(href = DEFAULT_HREF) {
	const location = {
		pathname: INJECT_URL,
		origin: INJECT_URL,
		href,
		set hash(hash) {
			if (location.hash === hash) {
				return;
			}
			const url = location.href.replace(location.origin, "");

			history.pushState(null, "", url + hash);

			window.dispatchEvent(new Event("popstate"));
		},
		get hash() {
			return states[index].hash;
		},
	};
	const states = [{
		state: null,
		href: location.href,
		hash: "",
	}];
	let index = 0;
	const history = {
		get length() {
			return states.length;
		},
		get state() {
			return states[index].state;
		},
		go(offset) {
			index += offset;

			location.href = states[index].href;

			window.dispatchEvent(new Event("popstate"));
		},
		pushState(state, title, url) {
			location.href = location.origin + url;
			++index;
			const hashs = url.match(/#.+/g);

			states.splice(index, states.length - index, {
				state,
				href: location.origin + url,
				hash: hashs ? hashs[0] : "",
			});
		},
		replaceState(state, title, url) {
			location.href = location.origin + url;
			const hashs = url.match(/#.+/g);

			states[index] = {
				state,
				href: location.origin + url,
				hash: hashs ? hashs[0] : "",
			};
		},
	};

	return {
		...orgBrowser,
		location,
		history,
	};
}
export function sessionStorageForLimit(depthsLimit, addedLimit = depthsLimit) {
	// Compare with limit when adding depth and limit2 when adding value.
	return {
		removeItem: key => window.sessionStorage.removeItem(key),
		getItem: key => window.sessionStorage.getItem(key),
		setItem: (key, value) => {
			let isExceed = false;


			try {
				if (key === CONST_PERSIST_STATE) {
					isExceed = JSON.parse(value || "{depths: []}")[CONST_DEPTHS].length > depthsLimit;
				} else {
					isExceed = StorageManager.getDepths().length > addedLimit;
				}
			} catch (e) {
			}
			if (isExceed) {
				throwQuotaExceedError();
			}
			window.sessionStorage.setItem(key, value);
		},
	};
}

export function mockPersistModules({
	browser = {},
	utils = {},
}) {
	const mockedBrowser = {
		...orgBrowser,
		...browser,
	};
	const mockedUtils = {
		...UtilsInjector({
			"./browser": mockedBrowser,
		}),
		...utils,
	};
	const mockedPersistHistory = PersistHistoryInjector();
	const mockedStorageManager = StorageManagerInjector({
		"./browser": mockedBrowser,
	});

	return {
		"./browser": mockedBrowser,
		"./PersistHistory": mockedPersistHistory,
		"./historyManager": HistoryManagerInjector({
			"./browser": mockedBrowser,
			"./storageManager": mockedStorageManager,
			"./utils": mockedUtils,
			"./PersistHistory": mockedPersistHistory,
		}),
		"./storageManager": mockedStorageManager,
		"./utils": mockedUtils,
	};
}

export function mockPersistModulesWithBrowser({
	href = DEFAULT_HREF,
	sessionLimitCount = -1,
} = {}) {
	const mockedBrowser = injectBrowser(href);

	if (sessionLimitCount >= 0) {
		mockedBrowser.sessionStorage = sessionStorageForLimit(sessionLimitCount);
	}
	return mockPersistModules({
		browser: mockedBrowser,
	});
}

export function injectHashPersist(options) {
	const mockBrowser = options["./browser"];

	return HashPersistInjector({
		"./Persist": injectPersist(options),
		"./browser": mockBrowser,
	});
}
export function injectPersist(options) {
	const nextOptions = {...options};

	delete nextOptions["./browser"];
	delete nextOptions["./PersistHistory"];
	return PersistInjector(nextOptions);
}

export function storageManagerForLimit(limit, limit2) {
	//
	return StorageManagerInjector(
		{
			"./browser": {
				window,
				history: window.history,
				location: window.location,
				JSON: window.JSON,
				sessionStorage: sessionStorageForLimit(limit, limit2),
				localStorage: null,
			},
		}
	);
}

export function injectPersistForLimit(depthsLimit, addedLimit) {
	const storageManager = storageManagerForLimit(depthsLimit, addedLimit);
	const historyManager = HistoryManagerInjector({
		"./storageManager": storageManager,
	});


	return injectPersist({
		"./storageManager": storageManager,
		"./historyManager": historyManager,
	});
}
