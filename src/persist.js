import {window} from "./browser";
import StorageManager from "./storageManager";
import {isBackForwardNavigated} from "./utils";
import {CONST_PERSIST} from "./consts";

const GLOBAL_KEY = `KEY${CONST_PERSIST}}`;
const userAgent = window.navigator.userAgent;

const isNeeded = (function() {
	const isIOS = (new RegExp("/iPhone|iPad/", "i")).test(userAgent);
	const isMacSafari = (new RegExp("Mac", "i")).test(userAgent) &&
		!(new RegExp("Chrome", "i")).test(userAgent) &&
		(new RegExp("Apple", "i")).test(userAgent);
	const isAndroid = (new RegExp("/Android/", "i")).test(userAgent);
	const isWebview = (new RegExp("/wv; /", "i")).test(userAgent);
	const androidVersion = isAndroid ? parseFloat(new RegExp(
		"(Android)\\s([\\d_\\.]+|\\d_0)", "i"
	).exec(userAgent)[2]) : undefined;

	return !(isIOS ||
			isMacSafari ||
			(isAndroid &&
				(androidVersion <= 4.3 && isWebview || androidVersion < 3)));
})();

// in case of reload
!isBackForwardNavigated() && StorageManager.reset();

/**
* Get or store the current state of the web page using JSON.
* @ko 웹 페이지의 현재 상태를 JSON 형식으로 저장하거나 읽는다.
* @method persist
* @param {String} key The key of the state information to be stored <ko>저장할 상태 정보의 키</ko>
* @param {Object} [state] The value to be stored in a given key <ko>키에 저장할 값</ko>
**/
/*
Persist(key)
Persist(key, value)
Persist.isNeeded();
*/
function persist(state, data) {
	let key;

	if (typeof state === "string") {
		key = state;
	} else {
		key = GLOBAL_KEY;
		data = arguments.length === 1 ? state : null;
	}

	if (data || arguments.length === 2) {
		StorageManager.setStateByKey(key, data);
	}

	return StorageManager.getStateByKey(key);
}

persist.isNeeded = function() {
	return isNeeded;
};

persist.VERSION = "#__VERSION__#";

export default persist;
