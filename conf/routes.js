/**
 * Note : this file is monitored and the server will automatically
 *        update itself reflecting changes to this file
 */


var route = require("../lib/router/route");

/**
 * Routes are used to internally redirect or format the requested pathname
 * to another resource or location. 
 *
 * Example: if the request is "/user/images" (with {id:123} as parameter),
 * then the request could be forewarded by a dynamic route to the resource
 * "/users/resources/fetch" (with {id=123,type:'image'} as paramter)
 *
 *       new route.DynamicRoute('user.images', true, function(info) {
 *          if (info.path == '/user/images') {
 *             info.query.type = 'image'
 *             return 'uses/resources/fetch';
 *          } else {
 *             return false;
 *          }
 *       })
 *
 * Example: if the request is "/js/jquery.js", then the request could be
 * forwarded to "/scripts/lib/jquery-1.4.4.min.js". Since changes to this
 * file does not need to restart the server, updating JQuery to the latest
 * version is only a matter of updating the route's alias
 *
 *       new route.StaticRoute('jquery', true, 
 *                             '/js/jquery.js', '/scripts/lib/jquery-1.4.4.min.js')
 *
 * If the route option 'content' is not set to false and it's return value
 * (a string) is a valid file in "/pub" or if the route option 'content' is
 * set to true, then the file is streamed to the client. Otherwise, the path
 * is supposed to be a Node module. If the module or the content file does not
 * exist, an 404 error is issued to the client.
 */

this.routes = [
	new route.StaticRoute('/cycle2', '/cycle3', true),
	new route.StaticRoute('/buz', '/module/controller/buz', false),
	new route.StaticRoute('/cycle1', '/cycle2', true),
	new route.StaticRoute('/foo', '/bar', true),
	new route.StaticRoute('/foo/bar', '/bar', true),
	new route.StaticRoute('/cycle', '/cycle1', true),
	new route.StaticRoute('/cycle2', '/cycle', true),
];
