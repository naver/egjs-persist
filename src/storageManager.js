import {window, history, location, JSON, sessionStorage, localStorage} from "./browser";
import utils from "./utils";
import CONST_PERSIST from "./consts";

const isSupportState = "replaceState" in history && "state" in history;

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

// jscs:enable maximumLineLength
function warnInvalidStorageValue() {
	/* jshint ignore:start */
	console.warn("window.history or session/localStorage has no valid " +
			"format data to be handled in persist.");
	/* jshint ignore:end */
}

function getStorageKey() {
	return storage ? location.href + CONST_PERSIST : undefined;
}

function getStorage() {
	return storage;
}

/*
 * Get state value
 */
function getState() {
	let state;
	const stateStr = storage ?
		storage.getItem(location.href + CONST_PERSIST) : history.state;

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

function getStateByKey(key) {
	if (!isSupportState && !storage) {
		return undefined;
	}

	let result = getState()[key];

	// some device returns "null" or undefined
	if (result === "null" || typeof result === "undefined") {
		result = null;
	}
	return result;
}

/*
 * Set state value
 */
function setState(state) {
	if (storage) {
		if (state) {
			storage.setItem(
				location.href + CONST_PERSIST, JSON.stringify(state));
		} else {
			storage.removeItem(location.href + CONST_PERSIST);
		}
	} else {
		try {
			history.replaceState(
				state === null ? null : JSON.stringify(state),
				document.title,
				location.href
			);
		} catch (e) {
			/* jshint ignore:start */
			console.warn(e.message);
			/* jshint ignore:end */
		}
	}

	state ? window[CONST_PERSIST] = true : delete window[CONST_PERSIST];
}

function setStateByKey(key, data) {
	if (!isSupportState && !storage) {
		return;
	}

	const beforeData = getState();

	beforeData[key] = data;
	setState(beforeData);
}

/*
 * flush current history state
 */
function reset() {
	setState(null);
}

// in case of reload
!utils.isBackForwardNavigated() && reset();

export default {
	reset,
	setStateByKey,
	getStateByKey,
	getStorageKey,
	getStorage
};
