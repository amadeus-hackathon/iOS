//
//  WebviewPlugin.h
//  TravelNow
//
//  Created by Roshan Khan on 09/11/13.
//
//

#import <Cordova/CDV.h>

@interface WebviewPlugin : CDVPlugin <UIWebViewDelegate>{
	
}

- (void)showWebviewOnApp:(CDVInvokedUrlCommand*)command;
	
@end
