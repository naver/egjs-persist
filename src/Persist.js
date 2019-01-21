import * as StorageManager from "./storageManager";
import {isNeeded} from "./utils";
import {console} from "./browser";

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

/**
 * Get or store the current state of the web page using JSON.
 * @ko 웹 페이지의 현재 상태를 JSON 형식으로 저장하거나 읽는다.
 * @alias eg.Persist
 *
 * @support {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest" , "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
 */
class Persist {
	static VERSION = "#__VERSION__#";
	static StorageManager = StorageManager;
	/**
	* Constructor
	* @param {String | Object} key The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
	* @param {String} [key.key]  The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
	* @param {Boolean} [key.excludeHash] This option can store or get information about url except hash. <ko>이 옵션은 hash를 제외한 url에 대한 정보를 저장화거나 가져올 수 있다.</ko>
	**/
	constructor(key) {
		this.state = {
			excludeHash: false,
			key: "",
		};

		const state = this.state;
		const keyType = typeof key;

		if (keyType === "string") {
			state.key = key;
		} else if (keyType === "object") {
			for (const name in key) {
				state[name] = key[name];
			}
		}
	}

	/**
	 * Read value
	 * @param {String?} path target path
	 * @return {String|Number|Boolean|Object|Array}
	 */
	get(path) {
		// find path
		const {key, excludeHash} = this.state;
		const globalState =	StorageManager.getStateByKey(key, excludeHash);

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
		// find path
		const {key, excludeHash} = this.state;
		const globalState =	StorageManager.getStateByKey(key, excludeHash);

		if (path.length === 0) {
			StorageManager.setStateByKey(key, value, excludeHash);
		} else {
			StorageManager.setStateByKey(
				key,
				setRec(globalState, path.split("."), value),
				excludeHash
			);
		}

		return this;
	}

	/**
	 * @static
	 * Return whether you need "Persist" module by checking the bfCache support of the current browser
	 * @return {Boolean}
	 */
	static isNeeded() {
		return isNeeded;
	}
}

export default Persist;
