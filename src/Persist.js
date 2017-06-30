import StorageManager from "./storageManager";
import {isNeeded} from "./utils";
import {console} from "./browser";

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
	// when called as plain method
	if (!(this instanceof Persist)) {
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

	// when called as constructer
	this.key = key;
}

Persist.prototype.get = function(path) {
	// find path
	const globalState =	StorageManager.getStateByKey(this.key);

	if (path.length === 0) {
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
};

Persist.prototype.set = function(path, value) {
	// find path
	const globalState =	StorageManager.getStateByKey(this.key);

	if (path.length === 0) {
		StorageManager.setStateByKey(this.key, value);
	} else {
		StorageManager.setStateByKey(
			this.key,
			setRec(globalState, path.split("."), value)
		);
	}

	return this;
};

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

export default Persist;
