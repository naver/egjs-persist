/* eslint-disable no-use-before-define */
import {
	reset,
	setStateByKey,
	getStateByKey,
	getStorage,
} from "./storageManager";
import PersistQuotaExceededError from "./PersistQuotaExceededError";
import {isNeeded, getUrl, getStorageKey, getNavigationType, isQuotaExceededError} from "./utils";
import {console, window} from "./browser";
import {TYPE_BACK_FORWARD, TYPE_NAVIGATE, CONST_PERSIST_STATE, CONST_DEPTHS, CONST_LAST_URL} from "./consts";

let currentUrl = "";


function execRec(obj, path, func) {
	let _obj = obj;

	if (!_obj) {
		_obj = isNaN(path[0]) ? {} : [];
	}

	const head = path.shift();

	if (path.length === 0) {
		if (_obj instanceof Array && isNaN(head)) {
			console.warn("Don't use key string on array");
		}
		func(_obj, head);
		return _obj;
	}

	_obj[head] = execRec(_obj[head], path, func);
	return _obj;
}

function setPersistState(key, value) {
	try {
		setStateByKey(CONST_PERSIST_STATE, key, value);
	} catch (e) {
		if (catchQuotaExceededError(e, CONST_PERSIST_STATE, value)) {
			if (key === CONST_LAST_URL) {
				setPersistState(key, value);
			} else if (key === CONST_DEPTHS) {
				setPersistState(key, value && value.slice(1));
			}
		}
	}
}
function getPersistState(key) {
	return getStateByKey(CONST_PERSIST_STATE, key);
}

function replaceDepth() {
	const url = getUrl();

	if (currentUrl === url) {
		return;
	}
	const prevUrl = currentUrl;

	try {
		currentUrl = url;

		const depths = getPersistState(CONST_DEPTHS) || [];

		// remove prev url
		const prevIndex = depths.indexOf(prevUrl);

		if (prevIndex >= 0) {
			depths.splice(prevIndex, 1);
			reset(getStorageKey(prevUrl));
		}

		// remove next url info
		const currentIndex = depths.indexOf(url);

		if (currentIndex >= 0) {
			depths.splice(currentIndex, 1);
			reset(getStorageKey(url));
		}

		depths.push(url);
		setPersistState(CONST_DEPTHS, depths);
		setPersistState(CONST_LAST_URL, url);
	} catch (e) {
		// revert currentUrl
		currentUrl = prevUrl;
		throw e;
	}
}

function updateDepth(type = 0) {
	const url = getUrl();

	if (currentUrl === url) {
		return;
	}
	// url is not the same for the first time, pushState, or replaceState.
	const prevUrl = currentUrl;

	try {
		currentUrl = url;
		const depths = getPersistState(CONST_DEPTHS) || [];

		if (type === TYPE_BACK_FORWARD) {
			// Change current url only
			const currentIndex = depths.indexOf(url);

			~currentIndex && setPersistState(CONST_LAST_URL, url);
		} else {
			const prevLastUrl = getPersistState(CONST_LAST_URL);

			reset(getStorageKey(url));

			if (type === TYPE_NAVIGATE && url !== prevLastUrl) {
				// Remove all url lists with higher index than current index
				const prevLastIndex = depths.indexOf(prevLastUrl);
				const removedList = depths.splice(prevLastIndex + 1, depths.length);

				removedList.forEach(removedUrl => {
					reset(getStorageKey(removedUrl));
				});
				// If the type is NAVIGATE and there is information about current url, delete it.
				const currentIndex = depths.indexOf(url);

				~currentIndex && depths.splice(currentIndex, 1);
			}
			// Add depth for new address.
			if (depths.indexOf(url) < 0) {
				depths.push(url);
			}
			setPersistState(CONST_DEPTHS, depths);
			setPersistState(CONST_LAST_URL, url);
		}
	} catch (e) {
		// revert currentUrl
		currentUrl = prevUrl;
		throw e;
	}
}

function catchQuotaExceededError(e, key, value) {
	if (clearFirst()) {
		return true;
	} else if (isQuotaExceededError(e)) {
		throw new PersistQuotaExceededError(key, value ? JSON.stringify(value) : "");
	} else {
		throw e;
	}
}

function clearFirst() {
	const depths = getPersistState(CONST_DEPTHS) || [];
	const removed = depths.splice(0, 1);

	if (!removed.length) {
		// There is an error because there is no depth to add data.
		return false;
	}
	const removedUrl = removed[0];

	reset(getStorageKey(removedUrl));
	if (currentUrl === removedUrl) {
		currentUrl = "";
		setPersistState(CONST_LAST_URL, "");
		if (!depths.length) {
			// I tried to add myself, but it didn't add up, so I got an error.
			return false;
		}
	}
	setPersistState(CONST_DEPTHS, depths);
	// Clear the previous record and try to add data again.
	return true;
}

function clear() {
	const depths = getPersistState(CONST_DEPTHS) || [];

	depths.forEach(url => {
		reset(getStorageKey(url));
	});

	reset(CONST_PERSIST_STATE);

	currentUrl = "";
}

/**
 * Get or store the current state of the web page using JSON.
 * @ko 웹 페이지의 현재 상태를 JSON 형식으로 저장하거나 읽는다.
 * @alias eg.Persist
 *
 * @support {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest" , "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
 */
class Persist {
	static VERSION = "#__VERSION__#";
	static StorageManager = {
		reset,
		setStateByKey,
		getStateByKey,
		getStorage,
	};
	/**
	 * @static
	 * Clear all information in Persist
	 */
	static clear() {
		clear();
	}
	/**
	 * @static
	 * Return whether you need "Persist" module by checking the bfCache support of the current browser
	 * @return {Boolean}
	 */
	static isNeeded() {
		return isNeeded;
	}
	/**
	* Constructor
	* @param {String} key The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
	**/
	constructor(key) {
		this.key = key || "";
	}

	/**
	 * Read value
	 * @param {String?} path target path
	 * @return {String|Number|Boolean|Object|Array}
	 */
	get(path) {
		// update url for pushState, replaceState
		updateDepth(TYPE_NAVIGATE);

		// find path
		const urlKey = getStorageKey(getUrl());
		const globalState = getStateByKey(urlKey, this.key);


		if (!path || path.length === 0) {
			return globalState;
		}

		const pathToken = path.split(".");

		let currentItem = globalState;

		let isTargetExist = true;

		for (let i = 0; i < pathToken.length; i++) {
			if (!currentItem) {
				isTargetExist = false;
				break;
			}
			currentItem = currentItem[pathToken[i]];
		}
		if (!isTargetExist || currentItem == null) {
			return null;
		}
		return currentItem;
	}
	/**
	 * Save value
	 * @param {String} path target path
	 * @param {String|Number|Boolean|Object|Array} value value to save
	 * @return {Persist}
	 */
	set(path, value) {
		// update url for pushState, replaceState
		updateDepth(TYPE_NAVIGATE);
		// find path
		const key = this.key;
		const urlKey = getStorageKey(getUrl());
		const globalState = getStateByKey(urlKey, key);

		try {
			if (path.length === 0) {
				setStateByKey(urlKey, key, value);
			} else {
				const allValue = execRec(globalState, path.split("."), (obj, head) => {
					obj[head] = value;
				});

				setStateByKey(
					urlKey,
					key,
					allValue
				);
			}
		} catch (e) {
			if (catchQuotaExceededError(e, urlKey, value)) {
				this.set(path, value);
			}
		}
		return this;
	}
	/**
	 * Remove value
	 * @param {String} path target path
	 * @return {Persist}
	 */
	remove(path) {
		// update url for pushState, replaceState
		updateDepth(TYPE_NAVIGATE);

		// find path
		const key = this.key;
		const urlKey = getStorageKey(getUrl());
		const globalState = getStateByKey(urlKey, key);

		try {
			if (path.length === 0) {
				setStateByKey(urlKey, key, null);
			} else {
				const value = execRec(globalState, path.split("."), (obj, head) => {
					if (typeof obj === "object") {
						delete obj[head];
					}
				});

				setStateByKey(
					urlKey,
					key,
					value
				);
			}
		} catch (e) {
			if (catchQuotaExceededError(e)) {
				this.remove(path);
			}
		}
		return this;
	}
}


if ("onpopstate" in window) {
	window.addEventListener("popstate", () => {
		// popstate event occurs when backward or forward
		try {
			updateDepth(TYPE_BACK_FORWARD);
		} catch (e) {
			// Global function calls prevent errors.
			if (!isQuotaExceededError(e)) {
				throw e;
			}
		}
	});
}

// If navigation's type is not TYPE_BACK_FORWARD, delete information about current url.
try {
	updateDepth(getNavigationType());
} catch (e) {
	// Global function calls prevent errors.
	if (!isQuotaExceededError(e)) {
		throw e;
	}
}

export {
	updateDepth,
	replaceDepth,
};

export default Persist;
