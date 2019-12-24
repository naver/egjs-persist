const win = (typeof window !== `undefined` && window) || {};

export {win as window};
export const console = win.console;
export const document = win.document;
export const history = win.history;
export const location = win.location;
export const navigator = win.navigator;
export const parseFloat = win.parseFloat;
export const performance = win.performance;

let localStorage = null;

let sessionStorage = null;

try {
	localStorage = win.localStorage;
	sessionStorage = win.sessionStorage;
} catch (e) {
}

export {
	localStorage,
	sessionStorage,
};
