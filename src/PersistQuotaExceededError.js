import {getStorageType} from "./storageManager";

const setPrototypeOf = Object.setPrototypeOf || ((obj, proto) => {
	// eslint-disable-next-line no-proto
	obj.__proto__ = proto;
	return obj;
});


/**
 * Special type of known error that {@link Persist} throws.
 * @ko Persist 내부에서 알려진 오류 발생시 throw되는 에러
 * @property {string} key Error key <ko>에러가 되는 키</ko>
 * @property {string} message Error message <ko>에러 메시지</ko>
 * @property {"SessionStorage" | "LocalStorage" | "History" | "None"} storageType The storage type in which the error occurred <ko>에러가 발생한 스토리지 타입</ko>
 * @property {number} size The size of the value in which the error occurred <ko>에러가 발생한 값의 사이즈</ko>
 * @example
 * ```ts
 * import Persist, { PersistQuotaExceededError } from "@egjs/persist";
 * try {
 *   const persist = new Persist("key");
 * } catch (e) {
 *   if (e instanceof PersistQuotaExceededError) {
 *     console.error("size", e.size);
 *   }
 * }
 * ```
 */
class PersistQuotaExceededError extends Error {
	/**
	 * @param key Error message<ko>에러 메시지</ko>
	 * @param value Error value<ko>에러 값</ko>
	 */
	constructor(key, value) {
		const size = value.length;
		const storageType = getStorageType();

		super(`Setting the value (size: ${size}) of '${key}' exceeded the ${storageType}'s quota.`);

		setPrototypeOf(this, PersistQuotaExceededError.prototype);
		this.name = "PersistQuotaExceededError";
		this.storageType = storageType;
		this.key = key;
		this.size = size;
	}
}

export default PersistQuotaExceededError;
