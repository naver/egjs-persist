/*
 * Copyright (c) 2015 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
import {navigator, parseFloat, performance, location, console} from "./browser";
import {CONST_PERSIST} from "./consts";

const userAgent = navigator ? navigator.userAgent : "";

export const isNeeded = (function() {
	const isIOS = (new RegExp("iPhone|iPad", "i")).test(userAgent);
	const isMacSafari = (new RegExp("Mac", "i")).test(userAgent) &&
		!(new RegExp("Chrome", "i")).test(userAgent) &&
		(new RegExp("Apple", "i")).test(userAgent);
	const isAndroid = (new RegExp("Android ", "i")).test(userAgent);
	const isWebview = (new RegExp("wv; |inapp;", "i")).test(userAgent);
	const androidVersion = isAndroid ? parseFloat(new RegExp(
		"(Android)\\s([\\d_\\.]+|\\d_0)", "i"
	).exec(userAgent)[2]) : undefined;

	return !(isIOS ||
			isMacSafari ||
			(isAndroid &&
				((androidVersion <= 4.3 && isWebview) || androidVersion < 3)));
})();

// In case of IE8, TYPE_BACK_FORWARD is undefined.
export function getNavigationType() {
	return performance && performance.navigation &&
		performance.navigation.type;
}


export function getHashUrl() {
	return location ? location.href : "";
}

export function getUrl() {
	return getHashUrl().split("#")[0];
}

export function getStorageKey(name) {
	return name + CONST_PERSIST;
}

export function getUrlKey() {
	return getStorageKey(getUrl());
}

export function execRec(obj, path, func) {
	let _obj = obj;

	if (!_obj) {
		const firstElement = path[0];

		_obj = isNaN(firstElement) || firstElement === "" ? {} : [];
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
