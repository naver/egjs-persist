var isPersistNeeded = eg.Persist.isNeeded();



var type = typeof performance !== "undefined" && performance.navigation && performance.navigation.type;


window.addEventListener("popstate", function () {
	update("true");
});
function update(pop) {
	var depths = (eg.Persist.StorageManager.getStateByKey("state___persist___", "depths") || []).map(function (url) {
		var dirs =  url.split("/");
	
		return dirs[dirs.length - 1];
	}).join(" -> ");


	
	document.querySelector("#testlog").innerHTML =
		"isPersistNeeded : " + isPersistNeeded + "; pop : " + pop + "<br/>" + 
		"href : " + location.href + "<br/>" +
		"path : " + location.pathname + "<br/>" + 
		"length : " + depths + "<br/>" + 
		"last : " + eg.Persist.StorageManager.getStateByKey("state___persist___", "lastUrl") + "<br/>" + 
		"type : " + type  + "<br/>" + 
		"";
}
function pushBig() {
	var arr = [];

	for (var i = 0; i < 2 ** 20; ++i) {
		// 300kb * 4 = 1.2
		arr[i] = "ab";
	}

	const persist = new eg.Persist("aaaa");

	var text = arr.join("");

	persist.set("rand" + Math.floor(Math.random() * 100), text);
	update();
}
update();