var isPersistNeeded = eg.Persist.isNeeded();

var newsData = [
	"French far right National Front 'routed' in key vote",
	"China football revolution can be a financial game changer",
	"The dogs that protect Little Penguins",
	"'If I became an informer the chemotherapy could continue'",
	"The employees shut inside coffins"
];

var newsAddUnit = 5;

function NewsLoader(baseElId) {
	this.baseId = baseElId;
	this.persist = new eg.Persist(this.baseId);
	this.$baseEl = $("#" + this.baseId);
	this.$ListContainer = $(".listContainer", this.$baseEl);
	this.$LoadBtn= $("button", this.$baseEl);
	this.$LoadBtn.on("click", $.proxy( this._appendNews, this ));
	
	// Prevent unintended block highlighting when using delegation
	this.$ListContainer.addClass("NO_TAP_HIGHLIGHT");
    if(isPersistNeeded) {
		this.$ListContainer.on("click", "a", $.proxy( function(e){
	    /*
	     * @todo : Restore component state
	     */
			this.persist.set("scrollPos", document.body.scrollTop);
		}, this));

		var persistedHtml = this.persist.get("html");
		persistedHtml && this.$ListContainer.html(persistedHtml);
    }
}
NewsLoader.prototype._appendNews = function() {
	var newsHtml = "";
	for(var i = 0 ; i < newsAddUnit ; i++){
		var randomNews = newsData[Math.floor(Math.random()*newsData.length)];
		newsHtml += "<li class='row'><p><a href='http://me2.do/FF0C3V8H'>"+randomNews+"</a><p></li>";
	}
	this.$ListContainer.append($(newsHtml));
    /*
     * @todo : use Persist method to save data for restoring component state
     */
    if(isPersistNeeded) {
		this.persist.set("html", this.$ListContainer.html());  	
    }
};

new NewsLoader("newsLoader1");
new NewsLoader("newsLoader2");