## Persisted comments loaded with ajax
1. Click "load comments" button and load more comments.
2. Click link to the end page.
3. Go back with browser back button on mobile phone.
4. **Check loaded comments are still there.**
5. Click refresh button on mobile phone.
6. **Check loaded comments are gone.**

{% include_relative assets/html/demo.html %}

```js

const persist = new eg.Persist("commentModule");

$(".loadCmtBtn").on("click", function() {
	// Make change to the component. (append comments) 
	$.get("/api/123/nextcomment", function(commentHtml) {
		$(".commentContainer").append(commentHtml);		

		// Save snapshot of the component when there is a change
		var snapshot = $(".commentContainer").html();
		persist.set("commentsHTML", snapshot);
	});
});
	
// Restore state when initiate component
if(!persist.get("") === null) {
	var commentsHTML = persist.get("commentsHTML");
	$(".commentContainer").html(commentsHTML);
}
```
