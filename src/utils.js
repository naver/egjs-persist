import {navigator, parseFloat, performance, location} from "./browser";
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

export function getUrl() {
	return location ? location.href.split("#")[0] : "";
}

export function getStorageKey(name) {
	return name + CONST_PERSIST;
}

export function isQuotaExceededError(e) {
	return e.name === "QuotaExceededError" || e.name === "PersistQuotaExceededError";
}
