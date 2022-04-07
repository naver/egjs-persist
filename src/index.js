import Persist from "./Persist";
import HashPersist from "./HashPersist";
import PersistQuotaExceededError from "./PersistQuotaExceededError";


export {
	updateDepth,
	replaceDepth,
	registerHashPersist,
	releaseEvent,
} from "./historyManager";

export {
	HashPersist,
	PersistQuotaExceededError,
};

export default Persist;
