import {getStorage, getStorageType} from "./storageManager";

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
 * @property {Object} values Values of high size in storage. (maxLengh: 3) <ko>스토리지의 높은 사이즈의 값들. (최대 3개)</ko>
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
		const storage = getStorage();
		let valuesText = "";
		let values = [];

		if (storage) {
			const length = storage.length;

			for (let i = 0; i < length; ++i) {
				const itemKey = storage.key(i);
				const item = storage.getItem(itemKey) || "";

				values.push({key: itemKey, size: item.length});
			}
			values = values.sort((a, b) => b.size - a.size).slice(0, 3);

			if (values.length) {
				valuesText = ` The highest values of ${storageType} are ${values.map(item => JSON.stringify({[item.key]: item.size})).join(", ")}.`;
			}
		}

		super(`Setting the value (size: ${size}) of '${key}' exceeded the ${storageType}'s quota.${valuesText}`);

		setPrototypeOf(this, PersistQuotaExceededError.prototype);
		this.name = "PersistQuotaExceededError";
		this.storageType = storageType;
		this.key = key;
		this.size = size;
		this.values = values;
	}
}

export default PersistQuotaExceededError;
