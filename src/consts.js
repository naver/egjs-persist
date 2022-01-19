import {performance, navigator, parseFloat} from "./browser";

export const CONST_PERSIST = "___persist___";
export const CONST_PERSIST_STATE = `state${CONST_PERSIST}`;
export const CONST_DEPTHS = "depths";
export const CONST_LAST_URL = "lastUrl";
const navigation = performance && performance.navigation;

export const TYPE_NAVIGATE = (navigation && navigation.TYPE_NAVIGATE) || 0;
export const TYPE_RELOAD = (navigation && navigation.TYPE_RELOAD) || 1;
export const TYPE_BACK_FORWARD = (navigation && navigation.TYPE_BACK_FORWARD) || 2;

const userAgent = navigator ? navigator.userAgent : "";

export const IS_PERSIST_NEEDED = (function() {
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
