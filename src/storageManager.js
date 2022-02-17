import {window, history, location, sessionStorage, localStorage} from "./browser";
import {CONST_PERSIST} from "./consts";

const isSupportState = history && "replaceState" in history && "state" in history;
let storageType = "None";

function isStorageAvailable(storage) {
	if (!storage) {
		return undefined;
	}
	const TMP_KEY = `__tmp__${CONST_PERSIST}`;

	try {
		// In case of iOS safari private mode, calling setItem on storage throws error
		storage.setItem(TMP_KEY, CONST_PERSIST);

		// In Chrome incognito mode, can not get saved value
		// In IE8, calling storage.getItem occasionally makes "Permission denied" error
		return storage.getItem(TMP_KEY) === CONST_PERSIST;
	} catch (e) {
		return false;
	}
}

const storage = (function() {
	let strg;

	if (isStorageAvailable(sessionStorage)) {
		strg = sessionStorage;
		storageType = "SessionStorage";
	} else if (isStorageAvailable(localStorage)) {
		strg = localStorage;
		storageType = "LocalStorage";
	} else if (history && history.state) {
		storageType = "History";
	}

	return strg;
})();

function warnInvalidStorageValue() {
	/* eslint-disable no-console */
	console.warn("window.history or session/localStorage has no valid " +
			"format data to be handled in persist.");
	/* eslint-enable no-console */
}

/*
 * Get state value
 */
function getState(key) {
	let state;

	let stateStr;

	if (storage) {
		stateStr = storage.getItem(key);
	} else if (history.state) {
		if (typeof history.state === "object" && history.state !== null) {
			stateStr = history.state[key];
		} else {
			warnInvalidStorageValue();
		}
	} else {
		stateStr = history.state;
	}

	// the storage is clean
	if (stateStr === null) {
		return {};
	}

	// "null" is not a valid
	const isValidStateStr = typeof stateStr === "string" &&
								stateStr.length > 0 && stateStr !== "null";

	try {
		state = JSON.parse(stateStr);

		// like '[ ... ]', '1', '1.234', '"123"' is also not valid
		const isValidType = !(typeof state !== "object" || state instanceof Array);

		if (!isValidStateStr || !isValidType) {
			throw new Error();
		}
	} catch (e) {
		warnInvalidStorageValue();
		state = {};
	}

	// Note2 (Android 4.3) return value is null
	return state;
}

/*
 * Set state value
 */
function setState(key, state) {
	if (storage) {
		if (state) {
			storage.setItem(
				key, JSON.stringify(state));
		} else {
			storage.removeItem(key);
		}
	} else {
		try {
			const historyState = !history || history.state == null ? {} : history.state;

			if (history && typeof historyState === "object") {
				historyState[key] = JSON.stringify(state);
				history.replaceState(
					historyState,
					document.title,
					location.href
				);
			} else {
				/* eslint-disable no-console */
				console.warn("To use a history object, it must be an object that is not a primitive type.");
				/* eslint-enable no-console */
			}
		} catch (e) {
			/* eslint-disable no-console */
			console.warn(e.message);
			/* eslint-enable no-console */
		}
	}

	state ? window[CONST_PERSIST] = true : delete window[CONST_PERSIST];
}


export function getStorage() {
	return storage;
}

export function getStorageType() {
	return storageType;
}

export function getStateByKey(key, valueKey) {
	if (!isSupportState && !storage) {
		return undefined;
	}

	let result = getState(key)[valueKey];

	// some device returns "null" or undefined
	if (result === "null" || typeof result === "undefined") {
		result = null;
	}
	return result;
}

export function setStateByKey(key, valueKey, data) {
	if (!isSupportState && !storage) {
		return;
	}

	const beforeData = getState(key);

	beforeData[valueKey] = data;
	setState(key, beforeData);
}

/*
 * flush current history state
 */
export function reset(key) {
	setState(key, null);
}
