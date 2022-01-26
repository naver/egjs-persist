import Persist, * as modules from "./index";

for (const name in modules) {
	Persist[name] = modules[name];
}

export default Persist;
