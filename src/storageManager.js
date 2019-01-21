import {window, history, location, sessionStorage, localStorage} from "./browser";
import {isBackForwardNavigated} from "./utils";
import CONST_PERSIST from "./consts";

const isSupportState = history && "replaceState" in history && "state" in history;

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
	} else if (isStorageAvailable(localStorage)) {
		strg = localStorage;
	}

	return strg;
})();

function warnInvalidStorageValue() {
	/* eslint-disable no-console */
	console.warn("window.history or session/localStorage has no valid " +
			"format data to be handled in persist.");
	/* eslint-enable no-console */
}

function getStorageKey() {
	return storage ? location.href + CONST_PERSIST : undefined;
}

function getStorage() {
	return storage;
}

function getKey(excludeHash) {
	const href = location.href;

	return (excludeHash ? href.split("#")[0] : href) + CONST_PERSIST;
}
/*
 * Get state value
 */
function getState(excludeHash) {
	const PERSIST_KEY = getKey(excludeHash);
	let state;
	let stateStr;

	if (storage) {
		stateStr = storage.getItem(PERSIST_KEY);
	} else if (history.state) {
		if (typeof history.state === "object" && history.state !== null) {
			stateStr = history.state[PERSIST_KEY];
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

function getStateByKey(key, excludeHash) {
	if (!isSupportState && !storage) {
		return undefined;
	}

	let result = getState(excludeHash)[key];

	// some device returns "null" or undefined
	if (result === "null" || typeof result === "undefined") {
		result = null;
	}
	return result;
}

/*
 * Set state value
 */
function setState(state, excludeHash) {
	const PERSIST_KEY = getKey(excludeHash);

	if (storage) {
		if (state) {
			storage.setItem(
				PERSIST_KEY, JSON.stringify(state));
		} else {
			storage.removeItem(PERSIST_KEY);
		}
	} else {
		try {
			const historyState = !history || history.state == null ? {} : history.state;

			if (history && typeof historyState === "object") {
				historyState[PERSIST_KEY] = JSON.stringify(state);
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

function setStateByKey(key, data, excludeHash) {
	if (!isSupportState && !storage) {
		return;
	}

	const beforeData = getState(excludeHash);

	beforeData[key] = data;
	setState(beforeData, excludeHash);
}

/*
 * flush current history state
 */
function reset() {
	setState(null);
}

// in case of reload
!isBackForwardNavigated() && reset();

export {
	reset,
	setStateByKey,
	getStateByKey,
	getStorageKey,
	getStorage,
};
