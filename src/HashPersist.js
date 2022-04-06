/* eslint-disable class-methods-use-this */
/* eslint-disable no-use-before-define */
import {location} from "./browser";
import {CONST_HASH} from "./consts";
import Persist from "./Persist";

/**
 * Get or store the current state of the web page using JSON according to hash.
 * @ko 웹 페이지의 현재 상태를 hash에 따라 JSON 형식으로 저장하거나 읽는다.
 * @memberof eg.Persist
 * @alias eg.Persist.HashPersist
 * @extends eg.Persist
 *
 * @support {"ie": "9+", "ch" : "latest", "ff" : "latest",  "sf" : "latest" , "edge" : "latest", "ios" : "7+", "an" : "2.3+ (except 3.x)"}
 */
class HashPersist extends Persist {
	/**
	 * Read value
	 * @param {String?} path target path
	 * @return {String|Number|Boolean|Object|Array}
	 */
	get(path) {
		return this._get(this._getKey(), this._getPath(path));
	}
	/**
	 * Save value
	 * @param {String} path target path
	 * @param {String|Number|Boolean|Object|Array} value value to save
	 * @return {Persist}
	 */
	set(path, value) {
		return this._set(this._getKey(), this._getPath(path), value);
	}
	/**
	 * Remove value
	 * @param {String} path target path
	 * @return {Persist}
	 */
	remove(path) {
		return this._remove(this._getKey(), this._getPath(path));
	}
	_getKey() {
		return `${CONST_HASH}${location.hash}`;
	}
	_getPath(path) {
		let nextPath = path;

		if (Array.isArray(nextPath)) {
			nextPath = [this.key, ...nextPath];
		} else {
			nextPath = `${this.key}.${nextPath}`;
		}
		return nextPath;
	}
}

export default HashPersist;
