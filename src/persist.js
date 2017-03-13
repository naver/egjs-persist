import StorageManager from "./storageManager";
import {isNeeded} from "./utils";

/**
* Get or store the current state of the web page using JSON.
* @ko 웹 페이지의 현재 상태를 JSON 형식으로 저장하거나 읽는다.
* @method persist
* @param {String} key The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
* @param {Object} [state] The value to be stored in a given key <ko>키에 저장할 값</ko>
* @example
Persist(key);
Persist(key, value);
**/
function persist(key, value) {
	if (typeof key !== "string") {
		console.warn("first param must be a string!");
		return undefined;
	}

	if (value || arguments.length === 2) {
		StorageManager.setStateByKey(key, value);
	}

	return StorageManager.getStateByKey(key);
}

/**
* Return whether you need "Persist" module by checking the bfCache support of the current browser
* @ko 현재 브라우저의 bfCache 지원여부에 따라 persist 모듈의 필요여부를 반환한다.
* @namespace
* @property {function} isNeeded
* @example
Persist.isNeeded();
*/
persist.isNeeded = function() {
	return isNeeded;
};

persist.VERSION = "#__VERSION__#";

export default persist;
