Aria.tplScriptDefinition({
    $classpath : "app.templates.DetailsLayoutScript",
	$constructor: function(){
	},    
	$prototype : {
		$dataReady: function() {
			var myScroll;
			console.log(this.data);
		},
		
		$displayReady: function(){
			myScroll = new iScroll('wrapper');
			document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
			$(window).bind('orientationchange', function() {
				myScroll.refresh();
			});
		}

 	}
})