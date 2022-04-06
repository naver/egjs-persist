/* eslint-disable no-use-before-define */
import {
	reset,
	setState,
	getState,
	getStateByKey,
	setStateByKey,
	getDepths,
	getPersistState,
} from "./storageManager";
import PersistHistory from "./PersistHistory";
import {location, history, document, window} from "./browser";
import {getNavigationType, getUrl, getStorageKey, getUrlKey, getHashUrl} from "./utils";
import {TYPE_BACK_FORWARD, TYPE_NAVIGATE, CONST_PERSIST_STATE, CONST_DEPTHS, CONST_LAST_URL, CONST_HASH_DEPTHS_PERSIST, CONST_HASH} from "./consts";
import PersistQuotaExceededError from "./PersistQuotaExceededError";


function setHashDepths(depths, key = getUrlKey()) {
	return setStateByKey(key, CONST_HASH_DEPTHS_PERSIST, depths);
}

/*
 * flush current history state for hash
 */
function resetHash(key, hash) {
	const originalState = getState(key);
	const hashDepths = originalState[CONST_HASH_DEPTHS_PERSIST];

	if (hashDepths && hashDepths.length) {
		if (typeof hash === "undefined") {
			const nextState = {};

			for (const name in originalState) {
				if (name.indexOf(CONST_HASH) === 0) {
					nextState[name] = originalState[name];
				}
			}
			setState(key, nextState);
		} else {
			delete originalState[`${CONST_HASH}${hash}`];
			setState(key, originalState);
		}
	} else {
		setState(key, null);
	}
}
function replaceHashDepth() {
	const prevHash = PersistHistory.hash;
	const prevUrl = PersistHistory.url;
	const prevUrlKey = getStorageKey(prevUrl);
	const prevHashUrl = PersistHistory.hashUrl;

	const hashUrl = getHashUrl();
	const urlKey = getUrlKey();
	const hash = location.hash;
	const hashLength = history.length;

	if (hashUrl === prevHashUrl) {
		return;
	}

	PersistHistory.hash = hash;
	PersistHistory.hashUrl = hashUrl;
	PersistHistory.length = hashLength;
	// remove hash info
	resetHash(getStorageKey(prevUrl), prevHash);

	// remove prev hash
	const prevDepths = getHashDepths(prevUrlKey);
	const prevHashIndex = prevDepths.indexOf(prevHash);

	if (prevHashIndex > -1) {
		prevDepths.splice(prevHashIndex, 1);
	}
	const isSameKey = urlKey === prevUrlKey;
	const depths = isSameKey ? prevDepths : getHashDepths();
	const hashIndex = depths.indexOf(hash);

	// remove next hash info
	if (hashIndex > -1) {
		resetHash(urlKey, hash);
		depths.splice(hashIndex, 1);
	}
	if (isSameKey) {
		const addedIndex = hashIndex === -1 || hashIndex > prevHashIndex ?
			prevHashIndex : prevHashIndex - 1;

		depths.splice(addedIndex, 0, hash);
	} else {
		depths.splice(0, 0, hash);
		setHashDepths(prevDepths, prevUrlKey);
	}

	// add next hash
	setHashDepths(depths, urlKey);
}
function updateHashDepth(type = 0) {
	const prevLength = PersistHistory.length;
	const prevHash = PersistHistory.hash;
	const prevUrl = PersistHistory.url;
	const prevHashUrl = PersistHistory.hashUrl;

	const url = getUrl();
	const hashUrl = getHashUrl();
	const urlKey = getUrlKey();
	const hash = location.hash;
	const hashLength = history.length;

	let hashType = type;

	if (hashUrl === prevHashUrl) {
		return;
	}
	const historyState = history.state;

	if (historyState == null) {
		hashType = TYPE_NAVIGATE;

		// warning
		history.replaceState({[CONST_PERSIST_STATE]: true}, document.title, location.href);
	} else if (type === TYPE_BACK_FORWARD && hashLength !== prevLength) {
		hashType = TYPE_NAVIGATE;
	}
	PersistHistory.hash = hash;
	PersistHistory.hashUrl = hashUrl;
	PersistHistory.length = hashLength;

	const depths = getHashDepths();

	if (hashType === TYPE_BACK_FORWARD) {
		return;
	}

	// remove url key
	// remove hash key for first refresh or first navigate
	resetHash(urlKey, hash);

	// Remove all url lists with higher index than current index
	if (hashType === TYPE_NAVIGATE) {
		const prevLastIndex = prevUrl === url ?
			depths.indexOf(prevHash) : 0;

		if (prevLastIndex > -1 && prevHash != null) {
			const removedList = depths.splice(prevLastIndex + 1, depths.length);

			removedList.forEach(removedHash => {
				resetHash(urlKey, removedHash);
			});
		}
		// If the type is NAVIGATE and there is information about current hash, delete it.
		const currentIndex = depths.indexOf(hash);

		~currentIndex && depths.splice(currentIndex, 1);
	}

	// Add depth for new address.
	if (depths.indexOf(hash) < 0) {
		depths.push(hash);
	}
	setHashDepths(depths);
}

export function getHashDepths(key = getUrlKey()) {
	return getStateByKey(key, CONST_HASH_DEPTHS_PERSIST) || [];
}

export function isQuotaExceededError(e) {
	return e.name === "QuotaExceededError" || e.name === "PersistQuotaExceededError";
}

export function catchQuotaExceededError(e, key, value) {
	if (clearFirst()) {
		return true;
	} else if (isQuotaExceededError(e)) {
		throw new PersistQuotaExceededError(key, value ? JSON.stringify(value) : "");
	} else {
		throw e;
	}
}

export function trySetPersistState(key, value) {
	try {
		setStateByKey(CONST_PERSIST_STATE, key, value);
	} catch (e) {
		if (catchQuotaExceededError(e, CONST_PERSIST_STATE, value)) {
			if (key === CONST_LAST_URL) {
				trySetPersistState(key, value);
			} else if (key === CONST_DEPTHS) {
				trySetPersistState(key, value && value.slice(1));
			}
		}
	}
}

export function clearFirst() {
	const depths = getDepths();
	const removed = depths.splice(0, 1);

	if (!removed.length) {
		// There is an error because there is no depth to add data.
		return false;
	}
	const removedUrl = removed[0];

	reset(getStorageKey(removedUrl));
	if (PersistHistory.url === removedUrl) {
		PersistHistory.url = "";
		trySetPersistState(CONST_LAST_URL, "");
		if (!depths.length) {
			// I tried to add myself, but it didn't add up, so I got an error.
			return false;
		}
	}

	trySetPersistState(CONST_DEPTHS, depths);
	// Clear the previous record and try to add data again.
	return true;
}

export function replaceDepth() {
	const url = getUrl();

	if (PersistHistory.useHash) {
		replaceHashDepth();
	}
	if (PersistHistory.url === url) {
		return;
	}
	const prevUrl = PersistHistory.url;

	try {
		PersistHistory.url = url;

		const depths = getDepths();

		// remove prev url
		const prevIndex = depths.indexOf(prevUrl);

		if (prevIndex >= 0) {
			depths.splice(prevIndex, 1);
			resetHash(getStorageKey(prevUrl));
		}

		// remove next url info
		const currentIndex = depths.indexOf(url);

		if (currentIndex >= 0) {
			depths.splice(currentIndex, 1);
			resetHash(getStorageKey(url));
		}
		if (prevIndex >= 0) {
			const addedIndex = currentIndex === -1 || currentIndex > prevIndex ?
				prevIndex :
				prevIndex - 1;

			depths.splice(addedIndex, 0, url);
		} else {
			depths.push(url);
		}
		trySetPersistState(CONST_DEPTHS, depths);
		trySetPersistState(CONST_LAST_URL, url);
	} catch (e) {
		// revert PersistHistory.url
		PersistHistory.url = prevUrl;
		throw e;
	}
}

export function updateDepth(type = 0) {
	const url = getUrl();

	if (PersistHistory.useHash) {
		updateHashDepth(type);
	}
	if (PersistHistory.url === url) {
		return;
	}
	// url is not the same for the first time, pushState, or replaceState.
	const prevUrl = PersistHistory.url;

	try {
		PersistHistory.url = url;
		const depths = getDepths();

		if (type === TYPE_BACK_FORWARD) {
			// Change current url only
			const currentIndex = depths.indexOf(url);

			~currentIndex && trySetPersistState(CONST_LAST_URL, url);
		} else {
			const prevLastUrl = getPersistState(CONST_LAST_URL);

			// remove url key
			// remove hash key for first refresh or first navigate
			resetHash(getStorageKey(url));

			if (type === TYPE_NAVIGATE && url !== prevLastUrl) {
				// Remove all url lists with higher index than current index
				const prevLastIndex = depths.indexOf(prevLastUrl);

				if (prevLastIndex >= -1) {
					const removedList = depths.splice(prevLastIndex + 1, depths.length);

					removedList.forEach(removedUrl => {
						reset(getStorageKey(removedUrl));
					});
				}
				// If the type is NAVIGATE and there is information about current url, delete it.
				const currentIndex = depths.indexOf(url);

				~currentIndex && depths.splice(currentIndex, 1);
			}
			// Add depth for new address.
			if (depths.indexOf(url) < 0) {
				depths.push(url);
			}
			trySetPersistState(CONST_DEPTHS, depths);
			trySetPersistState(CONST_LAST_URL, url);
		}
	} catch (e) {
		// revert PersistHistory.url
		PersistHistory.url = prevUrl;
		throw e;
	}
}

export function clear() {
	const depths = getDepths();

	depths.forEach(url => {
		reset(getStorageKey(url));
	});

	reset(CONST_PERSIST_STATE);

	PersistHistory.url = "";
	PersistHistory.hashUrl = "";
	PersistHistory.hash = null;
}

export function useHashPersist() {
	if (PersistHistory.useHash) {
		return;
	}
	PersistHistory.useHash = true;
	updateHashDepth(getNavigationType());
}

export function releaseEvent() {
	window.removeEventListener("popstate", onPopState);
}
function onPopState() {
	// popstate event occurs when backward or forward
	try {
		updateDepth(TYPE_BACK_FORWARD);
	} catch (e) {
		// Global function calls prevent errors.
		if (!isQuotaExceededError(e)) {
			throw e;
		}
	}
}
// execute global
if ("onpopstate" in window) {
	window.addEventListener("popstate", onPopState);
}

// If navigation's type is not TYPE_BACK_FORWARD, delete information about current url.
try {
	updateDepth(getNavigationType());
} catch (e) {
	// Global function calls prevent errors.
	if (!isQuotaExceededError(e)) {
		throw e;
	}
}
