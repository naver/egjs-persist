import {window} from "./browser";

const wp = window.performance;

// In case of IE8, TYPE_BACK_FORWARD is undefined.
function isBackForwardNavigated() {
	return (wp && wp.navigation &&
        (wp.navigation.type === (wp.navigation.TYPE_BACK_FORWARD || 2)));
}

export default {isBackForwardNavigated};
