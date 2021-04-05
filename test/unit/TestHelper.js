import StorageManagerInjector from "inject-loader!../../src/storageManager";
import UtilsInjector from "inject-loader!../../src/utils";
import {CONST_PERSIST_STATE, CONST_DEPTHS} from "../../src/consts";
import * as StorageManager from "../../src/storageManager";
import * as browser from "../../src/browser";

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

export function injectBrowser(href = DEFAULT_HREF) {
	const location = {
		pathname: INJECT_URL,
		origin: INJECT_URL,
		href,
	};
	const states = [{
		state: null,
		href: location.href,
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
			states.splice(index, states.length - index, {
				state,
				href: location.origin + url,
			});
		},
		replaceState(state, title, url) {
			location.href = location.origin + url;

			states[index] = {
				state,
				href: location.origin + url,
			};
		},
	};

	return {
		...browser,
		location,
		history,
	};
}
export function sessionStorageForLimit(limit, limit2 = limit) {
	// Compare with limit when adding depth and limit2 when adding value.
	return {
		removeItem: key => window.sessionStorage.removeItem(key),
		getItem: key => window.sessionStorage.getItem(key),
		setItem: (key, value) => {
			let isExceed = false;

			try {
				if (key === CONST_PERSIST_STATE) {
					isExceed = JSON.parse(value || "{depths: []}")[CONST_DEPTHS].length > limit;
				} else {
					isExceed = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length > limit2;
				}
			} catch (e) {

			}
			if (isExceed) {
				throw new Error("exceed storage");
			}
			window.sessionStorage.setItem(key, value);
		},
	};
}

export function injectPersistModules({
	href = DEFAULT_HREF,
	sessionLimitCount = -1,
} = {}) {
	const mockBrowser = injectBrowser(href);

	if (sessionLimitCount >= 0) {
		mockBrowser.sessionStorage = sessionStorageForLimit(sessionLimitCount);
	}

	return {
		"./browser": mockBrowser,
		"./storageManager": StorageManagerInjector({
			"./browser": mockBrowser,
		}),
		"./utils": UtilsInjector({
			"./browser": mockBrowser,
		}),
	};
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
