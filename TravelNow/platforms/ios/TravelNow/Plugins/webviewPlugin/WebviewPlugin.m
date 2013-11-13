//
//  WebviewPlugin.m
//  TravelNow
//
//  Created by Roshan Khan on 09/11/13.
//
//

#import "WebviewPlugin.h"

@implementation WebviewPlugin
	
- (void)showWebviewOnApp:(CDVInvokedUrlCommand*)command
{
CDVPluginResult* pluginResult = nil;
NSString* myarg = [command.arguments objectAtIndex:0];

if (myarg != nil) {
	pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
	
//	UIWebView *urlwebview=[[UIWebView alloc]initWithFrame:CGRectMake(0, 600, 1024,768)];
	UIWebView *urlwebview = [[UIWebView alloc] initWithFrame:CGRectMake(0, 600, 768, 400)];
	[urlwebview setBackgroundColor:[UIColor clearColor]];
	
	NSString *url=@"http://www.cleartrip.com/packages/results?num_rooms=1&adults1=1&chk_in=4%2F03%2F2014&num_rooms=1&origin=Bangalore%2C+IN+-+Bengaluru+International+Airport+%28BLR%29&state=Delhi&from=BLR&city=New+Delhi&country=IN&children1=0&return_date=8%2F03%2F2014&chk_out=8%2F03%2F2014&adults=1&depart_date=4%2F03%2F2014&childs=0&dest_code=35485&infants=0";
	
	NSURL *nsurl=[NSURL URLWithString:url];
	NSURLRequest *nsrequest=[NSURLRequest requestWithURL:nsurl];

//	[[urlwebview scrollView] setContentOffset:CGPointMake(0, 100)];
	
	NSLog(@"self.webView scrollView %@", [self.webView scrollView]);
	[[self.webView scrollView] addSubview:urlwebview];
	
	[urlwebview loadRequest:nsrequest];

	
} else {
	pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Arg was null"];
}
[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)webViewDidStartLoad:(UIWebView *)webView {
		NSLog(@"page is loading");
	}
	
-(void)webViewDidFinishLoad:(UIWebView *)webView {
	NSLog(@"finished loading");
}
	
@end
