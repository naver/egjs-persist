import {performance} from "./browser";

export const CONST_PERSIST = "___persist___";
export const CONST_PERSIST_STATE = `state${CONST_PERSIST}`;
export const CONST_DEPTHS = "depths";
export const CONST_LAST_URL = "lastUrl";
const navigation = performance && performance.navigation;

export const TYPE_NAVIGATE = (navigation && navigation.TYPE_NAVIGATE) || 0;
export const TYPE_RELOAD = (navigation && navigation.TYPE_RELOAD) || 1;
export const TYPE_BACK_FORWARD = (navigation && navigation.TYPE_BACK_FORWARD) || 2;
