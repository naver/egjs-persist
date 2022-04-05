/* eslint-disable class-methods-use-this */
/* eslint-disable no-use-before-define */
import {
	reset,
	setStateByKey,
	getStateByKey,
	getStorage,
} from "./storageManager";
import {isNeeded, getUrlKey, execRec} from "./utils";
import {TYPE_NAVIGATE} from "./consts";
import {clear, updateDepth, catchQuotaExceededError} from "./historyManager";

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
		return this._get(this.key, path);
	}
	/**
	 * Save value
	 * @param {String} path target path
	 * @param {String|Number|Boolean|Object|Array} value value to save
	 * @return {Persist}
	 */
	set(path, value) {
		return this._set(this.key, path, value);
	}
	/**
	 * Remove value
	 * @param {String} path target path
	 * @return {Persist}
	 */
	remove(path) {
		return this._remove(this.key, path);
	}
	_get(key, path) {
		// update url for pushState, replaceState
		updateDepth(TYPE_NAVIGATE);

		const urlKey = getUrlKey();
		const globalState = getStateByKey(urlKey, key);

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
	_set(key, path, value) {
		// update url for pushState, replaceState
		updateDepth(TYPE_NAVIGATE);

		const urlKey = getUrlKey();
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
				this._set(key, path, value);
			}
		}
		return this;
	}
	_remove(key, path) {
		// update url for pushState, replaceState
		updateDepth(TYPE_NAVIGATE);

		// find path
		const urlKey = getUrlKey();
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
				this._remove(key, path);
			}
		}
		return this;
	}
}

export default Persist;
