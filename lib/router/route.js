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
 * @package lib/router
 * @version 0.1 
 */


/**
 * Constructor: DynamicRoute
 *
 * This route should be used when a callback function is required to detect
 * whether the path needs to be routed or not.
 *
 * The callback function receives an object info containing the "path" (a string),
 * the "parts" (an array equals to path.split("/")) and the "query" arguments (an
 * object whose key-value pair is the parsed URL parameters) for the current request.
 * The function should return the new path for this route, or should evaluate to 
 * false if not recognized. The function can modify "args". Modifying "parts"
 * has no effect, and "path" is not needed as the router will take care of that.
 *
 * @param callback  (function)  the callback executed to test the route
 * @param chain     (bool)      if matches, follow to next route (true)
 *                              or should this route be final (false)
 * @param options   (object)    specify more options :
 *                                - init     (callback) called when the route is initialized,
 *                                                      the function is executed with the route
 *                                                      in context (this) and receives no argument
 */
this.DynamicRoute = function(callback, chain, options) {
	var content = undefined;

	if (options) {
		if (options.content) {
			content = !!options.content;
		}
		if (options.init && typeof initFn == 'function') {
			options.init().apply(this);
		}
	}	
	
	this.allowChain = function() {
		return chain;
	};

	this.isContent = function() {
		return content;
	};
	
	this.recognize = function(info) {
		return callback(info);
	};

};

/**
 * Constructor: StaticRoute
 *
 * This route should be used when a path should be matched against a
 * static string, where it is associated with a speific alias.
 *
 * @param path          (string)  the path to recognize
 * @param alias         (string)  if path matches, return this alias
 * @param chain         (bool)    if matches, follow to next route (true)
 *                                or should this route be final (false)
 * @param options       (object)  define some options for this route :
 *                                  - caseSensitive (bool)     Should the path be chacked
 *                                                             with case sensitive? (default=false)
 *                                  - content       (bool)     If matched, should the alias be
 *                                                             a static content? (may cause error 404)
 *                                                             (default=false)
 */
this.StaticRoute = function(path, alias, chain, options) {
	var caseSensitive = false;
	var content = undefined;

	if (options) {
		if (options.caseSensitive) {
			caseSensitive = !!options.caseSensitive;
		}
		if (options.content) {
			content = !!options.content;
		}
	}
	
	if (!caseSensitive) {
		path = path.toUpperCase();
	}
	
	this.allowChain = function() {
		return chain;
	};
	
	this.getOption = function(name) {
		return options[name];
	};
	
	this.isContent = function() {
		return content;
	};

	this.recognize = function(info) {
		var _path = info.path;
		if (!caseSensitive) {
			_path = _path.toUpperCase();
		}
		
		if (path == _path) {
			return alias;
		} else {
			return false;
		}
	};
	
};
