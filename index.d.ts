declare module "@egjs/persist" {
	type persistValueType = any | null | undefined;

	class Persist {
		/**
		 * Clear all information in Persist
		 */
		public static clear(): void;

		/**
		 * Return whether you need "Persist" module by checking the bfCache support of the current browser
		 */
		public static isNeeded(): boolean;

		constructor(key: string);

		/**
		 * Read value
		 */
		public get(path?: string): persistValueType;

		/**
		 * Save value
		 */
		public set(path: string, value: persistValueType): this;

		/**
		 * Remove value
		 */
		public remove(path: string): this;
	}

	export class PersistQuotaExceededError extends Error {
		public name: string;
		public storageType: "SessionStorage" | "LocalStorage" | "History" | "None";
		public key: string;
		public size: number;
	}
	export function updateDepth(type?: number): void;
	export function replaceDepth(): void;
	export default Persist;
}
