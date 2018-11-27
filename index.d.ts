declare module "@egjs/persist" {
	type persistValueType = any | null | undefined;

	class Persist {
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
	}

	export default Persist;
}
