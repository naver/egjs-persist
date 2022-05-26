/*
 * Copyright (c) 2015 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
import Persist, * as modules from "./index";

for (const name in modules) {
	Persist[name] = modules[name];
}

export default Persist;
