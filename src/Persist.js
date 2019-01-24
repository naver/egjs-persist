/* eslint-disable no-use-before-define */
import {
	reset,
	setStateByKey,
	getStateByKey,
	getStorage,
} from "./storageManager";
import {isNeeded, getUrl, getStorageKey, getNavigationType} from "./utils";
import {console, window} from "./browser";
import {TYPE_BACK_FORWARD, TYPE_NAVIGATE, CONST_PERSIST_STATE, CONST_DEPTHS, CONST_LAST_URL} from "./consts";

let lastUrl = "";
let currentUrl = "";

function setRec(obj, path, value) {
	let _obj = obj;

	if (!_obj) {
		_obj = isNaN(path[0]) ? {} : [];
	}

	const head = path.shift();

	if (path.length === 0) {
		if (_obj instanceof Array && isNaN(head)) {
			console.warn("Don't use key string on array");
		}
		_obj[head] = value;
		return _obj;
	}

	_obj[head] = setRec(_obj[head], path, value);
	return _obj;
}

function updateDepth(url, type) {
	if (currentUrl !== url) {
		currentUrl = url;
		const depths = getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS) || [];

		if (type === TYPE_BACK_FORWARD) {
			// Change current url only
			const currentIndex = depths.indexOf(currentUrl);

			if (~currentIndex) {
				lastUrl = currentUrl;
				setStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL, lastUrl);
			}
		} else {
			const prevLastUrl = getStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL);

			reset(getStorageKey(currentUrl), null);
			if (type === TYPE_NAVIGATE) {
				// Remove all url lists with higher index than current index
				const prevLastIndex = depths.indexOf(prevLastUrl);
				const removedList = depths.splice(prevLastIndex + 1, depths.length);

				removedList.forEach(removedUrl => {
					reset(getStorageKey(removedUrl), null);
				});
				// If the type is NAVIGATE and there is information about current url, delete it.
				const currentIndex = depths.indexOf(currentUrl);

				~currentIndex && depths.splice(currentIndex, 1);
				setStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS, depths);
			}
		}
	}
}
function addDepth(url) {
	if (url !== lastUrl) {
		lastUrl = url;

		const depths = getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS) || [];

		if (depths.indexOf(lastUrl) < 0) {
			depths.push(lastUrl);
			setStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS, depths);
		}
		setStateByKey(CONST_PERSIST_STATE, CONST_LAST_URL, lastUrl);
	}
}
function clear() {
	const depths = getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS) || [];

	depths.forEach(url => {
		reset(getStorageKey(url), null);
	});

	reset(CONST_PERSIST_STATE, null);

	currentUrl = "";
	lastUrl = "";
}
if ("onpopstate" in window) {
	window.addEventListener("popstate", () => {
		// popstate event occurs when backward or forward
		updateDepth(getUrl(), TYPE_BACK_FORWARD);
	});
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
		const url = getUrl();
		const urlKey = getStorageKey(url);

		// update url for pushState, replaceState
		updateDepth(url, TYPE_NAVIGATE);
		// find path
		const globalState =	getStateByKey(urlKey, this.key);

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
		if (!isTargetExist || !currentItem) {
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
		const url = getUrl();
		const urlKey = getStorageKey(url);

		// update url for pushState, replaceState
		updateDepth(url, TYPE_NAVIGATE);

		// find path
		const key = this.key;
		const globalState =	getStateByKey(urlKey, key);

		if (path.length === 0) {
			setStateByKey(urlKey, key, value);
		} else {
			setStateByKey(
				urlKey,
				key,
				setRec(globalState, path.split("."), value)
			);
		}

		// If you are using set method, add the current url to depth.
		addDepth(url);
		return this;
	}
}

// If navigation's type is not TYPE_BACK_FORWARD, delete information about current url.
updateDepth(getUrl(), getNavigationType());
export default Persist;
