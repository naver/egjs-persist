import StorageManagerInjector from "inject-loader!../../src/storageManager";
import {CONST_PERSIST_STATE, CONST_DEPTHS} from "../../src/consts";
import * as StorageManager from "../../src/storageManager";

/* eslint-disable import/prefer-default-export */
export function wait(time = 100) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

export function sessionStorageForLimit(limit, limit2 = limit) {
	// Compare with limit when adding depth and limit2 when adding value.
	return {
		removeItem: key => window.sessionStorage.removeItem(key),
		getItem: key => window.sessionStorage.getItem(key),
		setItem: (key, value) => {
			let isExceed = false;

			try {
				if (key === CONST_PERSIST_STATE) {
					isExceed = JSON.parse(value || "{depths: []}")[CONST_DEPTHS].length > limit;
				} else {
					isExceed = StorageManager.getStateByKey(CONST_PERSIST_STATE, CONST_DEPTHS).length > limit2;
				}
			} catch (e) {

			}
			if (isExceed) {
				throw new Error("exceed storage");
			}
			window.sessionStorage.setItem(key, value);
		},
	};
}

export function storageManagerForLimit(limit, limit2) {
	// 
	return StorageManagerInjector(
		{
			"./browser": {
				window,
				history: window.history,
				location: window.location,
				JSON: window.JSON,
				sessionStorage: sessionStorageForLimit(limit, limit2),
				localStorage: null,
			},
		}
	);
}
