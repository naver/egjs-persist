import StorageManager from "./storageManager";
import {isNeeded} from "./utils";

/**
 * @namespace eg
 */

/**
* Get or store the current state of the web page using JSON.
* @ko 웹 페이지의 현재 상태를 JSON 형식으로 저장하거나 읽는다.
* @name eg#Persist
* @alias eg.Persist
* @method
* @param {String} key The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
* @param {Object} [state] The value to be stored in a given key <ko>키에 저장할 값</ko>
* @example
```javascript
eg.Persist(key);
eg.Persist(key, value);
```
**/
function Persist(key, value) {
	if (typeof key !== "string") {
		/* eslint-disable no-console */
		console.warn("first param must be a string!");
		/* eslint-enable no-console */
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
* @group eg.Persist
* @name eg.Persist.isNeeded
* @alias eg.Persist.isNeeded
* @namespace
* @property {function} isNeeded
* @example
eg.Persist.isNeeded();
*/
Persist.isNeeded = function() {
	return isNeeded;
};

Persist.VERSION = "#__VERSION__#";

export default Persist;
