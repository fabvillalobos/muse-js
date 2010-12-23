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


var fs = require("fs");


/**
 * Initialize a new hot reload schedule for the specified module.
 * The function throws an exception if the module cannot be resolved.
 *
 * Note that when calling this function, if the module has not yet
 * been required, will be required and the callback function will
 * be executed.
 *
 * @param string   module      the module to register for watching
 * @param mixed    options     may be null. if options is a number,
 *                             specify the interval. If an object, or null
 *                             it will be passed unto the fs.watchFile()
 * @param function callback    will be called when a module will have
 *                             been reloaded. The function will receive
 *                             the module resolved file name, and the
 *                             require()'s return value
 */
this.watch = function(module, options, callback) {
	var path = require.resolve(module);

	if (typeof options == 'number') {
		options = {persistent:true, interval:options};
	} else {
		options = options || undefined;
	}
	
	fs.watchFile(path, options, function(curr, prev) {
		Logger.log(null, LOG_INFO, "File '" + path + "' has changed, reloading module '" + module + "'...");
		
		// make sure the config data is not cached
		delete require.cache[path];
		callback(path, require(module));
	});
	
	if (!require.cache[path]) {
		callback(path, require(module));
	}
};

/**
 * Stop watching the specified module.
 * The function throws an exception if the module cannot be resolved.
 */
this.unwatch = function(module) {
	var path = require.resolve(module);
	fs.unwatchFile(path);
};

