/**
 * Copyright (c) 2010, yanick.rochon@mind2soft.com
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * - Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * - Neither the name of the <ORGANIZATION> nor the names of its contributors
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * @package lib
 * @version 0.1 
 */


var hotreload = require('./hotreload');


// monitor routes...
var routes;
hotreload.watch('../conf/routes', 3000, function(path, r) {
	routes = r.routes;
});


var activeRoute = null;

/**
 * Route the given request by transforming req.path variable
 * from the given routes. Return the active route, or null
 * if no route was found for the given request
 */
this.route = function(req) {
	activeRoute = null;

	var info = {
		path: req.path,
		parts: req.path.split("/"),
		query: req.query,
	};

	var len = routes.length;
	var i = 0, count = 0;
	var routesFound = [];
	var routedPath, routing = true;
	
	while ((count++ < len) && (routing)) {
		routedPath = routes[i].recognize(info);
		
		if (routedPath) {
			if (routesFound.indexOf(i) != -1) {
				throw new Error("Cyclic route configuration detected");
			} else {
				routesFound.push(i);
			}
		
			Logger.log(req, LOG_DEBUG, "Routing to:", routedPath);
		
			activeRoute = routes[i];
			info.path = routedPath;
			
			if (activeRoute.allowChain()) {
				// update info with your path
				info.parts = routedPath.split("/");
				
				count = 0;  // restart counting from here
			} else {
				routing = false;   // stop routing now
			}
		}
		
		i = (i + 1) % len;  // cyclic index
	}
	
	// update request
	req.path = info.path;
	req.query = info.query;
	
	return activeRoute;
};

/**
 * Return the active route
 *
 * @return Route  (see lib/router/route.js)
 */
this.getActiveRoute = function() {
	return activeRoute;
};

/**
 * Return all the routes. This function copies the routes
 * into an independant array prior, thus modifying the
 * returned value will not affect the router's configuration.
 *
 * @return array
 */
this.getRoutes = function() {
	return routes.slice();
};
