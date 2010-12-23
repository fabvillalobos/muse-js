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


var path = require('path');
var fs = require("fs");
var vm = require('vm');


var hotreload = require('./hotreload');

// provide configuration options throughout the application

// create application-wide logger
global.Logger = require("./logger");

// Logger needs to be initialized first before loading config!
hotreload.watch('../conf/app', 3000, function(path, config) {
	global.Config = config;
	// setup (refresh) logger from config....
	Logger.logLevel(Config.LOG_LEVEL);
});

// this module requires config to be loaded first!
var directories;
hotreload.watch('../conf/directories', 3000, function(path, dirs) {
	directories = dirs;
});


/**
 * Handle the given request and execute the requested module
 */	
this.handle = function(req, res) {
	// 1. start request timer
	// TODO
	
	// 2. while request is not dispatched
	function dispatch(path) {
		req.setDispatched(true);
		
	//   2.1. try to find the package from the request
		findPackage(res, path, function(err, path) {
	//   2.2. require the specified module from the found package
			var result = null; // vm....	
			
	//   2.3. If still not dispatched, validate that the next iteration
	//        will dispatch to a different package and/or module
			if (!req.isDispatched()) {
				dispatch(res.path);
			} else {
	//   2.4. Render view from req.path
				res.writeHead(200, {'Content-Type': 'text/plain'});

				res.write('Dispatching to : ' + path + "\n");
				res.end();
			}
		});
	};
	//dispatch(req.path);	
	
	/*
	res.writeHead(200, {'Content-Type': 'text/plain'});

	res.write('You requested the file : ' + req.path + "\n");
	for (var p in req.query) {
		res.write("Param : " + p + " = " + req.query[p] + "\n");
	}
	*/

	res.end();
};

/**
 * Render the given path into the given ServerResponse
 */
this.render = function(res, path) {
	resolve(res, path, function(err, path) {
		if (err) {
			res.sendError(404);		
		} else {
			res.sendFile(path);
		}
	});
};


function resolve(res, path, callback) {
	readStat(path);
	function readStat(path) {
		fs.lstat(path, function(err, stats) {
			if (err) {
				res.sendError(404);
			} else if (stats.isSymbolicLink()) {
				fs.readlink(path, function(err, resolvedPath) {
					if (err) {
						callback(true);
					} else {
						readStat(resolvedPath);
					}
				});
			} else {	
				callback(false, path);
			}
		});
	};
};

function findPackage(res, path, callback) {
	var parts = path.replace('\\', '/').split('/');
	var pkg = null;
	
	if (parts.length == 0) {
		callback(false, Config.APP_PATH + "/" + Config.packages.default + "/" + Config.packages.index);
	} else {
		isPackagePath(Config.APP_PATH + path, function(err, path) {
			if (err) {
				isPackagePath(Config.APP_PATH + "/" + Config.packages.default + path, function(err, path) {
					if (err) {
						callback("Path not found", null);
					} else {
						callback(false, path);
					}				
				});
			} else {
				callback(false, path);
			}
		});
	}
	
	function isPackagePath(path, callback) {
		resolve(res, path, function(err, path) {
	  		if (err) {
	  			callback(true);
	  		} else {
	  			callback(null, path);
	  		}
		});
	};
};

