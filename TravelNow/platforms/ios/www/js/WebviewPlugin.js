var webviewplugin = {
    
	callNativeFunction: function (success, fail, resultType) {
		return Cordova.exec( success, fail,
                        "com.amadeus.webviewplugin",
                        "showWebviewOnApp",
                        [resultType]);
	}
	
	
};