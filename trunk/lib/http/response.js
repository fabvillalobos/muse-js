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
 * @package lib/http
 * @version 0.1 
 */



var fs = require('fs');
var sys = require('sys');

var hotreload = require('../hotreload');
var Mu = require("../view/mu");


// monitor all known Mime Types
var MimeTypes;
hotreload.watch("../conf/mimetypes", 3000, function(path, r) {
	MimeTypes = r.MimeTypes;
});
// monitor http errors
var HttpErrors;
hotreload.watch("../conf/httperrors", 3000, function(path, r) {
	HttpErrors = r;
});


var MAX_READ = 1024 * 1024; // 1MB - max bytes to request at a time


this.extendServerResponse = function(res, req) {
	var _forward = null;
	
	res.forward = function(moduleName, controllerName, actionName) {
		_forward = {
			'module': moduleName,
			'controller': controllerName,
			'action': actionName
		};
	};
	
	/**
	 * Return a shared Mu instance
	 *
	 * Same has : var Mu = require("lib/view/mu");
	 */
	res.getRenderer = function() {
		return Mu;
	};
	
	res.isForwarded = function() {
		return _forward != null;
	};

	res.redirect = function(url) {
		// TODO : send http redirect
	};
	
	res.sendFile = function(file,contentType) {
		streamFile.call(res, req, file, contentType);
	};

	/**
	 * Send an error code into the response and terminate request
	 */
	res.sendError = function(code, msg) {
		// TODO : allow error views ?
		var code_info = HttpErrors.Codes[code];
		var view = HttpErrors.DEFAULT_VIEW;
		var data = {
			foo:"Error " + code,
			encoding:"utf-8",
			error: "Error " + code,
		};
		
		if (!msg && code_info) {
			// TODO : if error views, code_info will hold some valuable info here...
			data.content = code_info;
		} else {
			data.content = msg ? msg : HttpErrors.DEFAULT_MESSAGE;
		}
		
		res.writeHead(code,{"Content-Type":data.encoding});
		// render error...
		//res.write(renderer.renderFile(view, data));
		Mu.render("sys", view, data, {}, function (err, output) {
			if (err) {
				Logger.log(req, LOG_ERROR, "sendError: error! " + err.message);
				if (code != 500) {
					res.sendError(500);
				} else {
					res.write("Internal error, request aborted!");
					res.end();
				}
		  } else {
			  var buffer = '';
			  		  
			  output.addListener('data', function (c) {buffer += c; })
					  .addListener('end', function () { 
					  		res.write(buffer);
					  		res.end();
					  });
			}
		});		
	};

};

/**
 * Send the given file. The context of this function
 * is the ServerResponse object 
 */
function streamFile(req, file, contentType) {
	var res = this;
	
	if (!contentType) {
		// try to find the best content type from known mimetype per file extension
		contentType = getMimeType(file);
	}

	var die = setTimeout(finish,Config.REQUEST_TIMEOUT);
	var offset = 0;  // for debug purpose...
	
	fs.open(file, "r", 0666, function(err, fd) {		
		if(!err) {
			Logger.log(req, LOG_DEBUG,"opened",fd);
			res.writeHead(200,{"Content-Type":contentType || "text/plain"});
			
			read();
			function read() {
				var buffer = new Buffer(MAX_READ);
				fs.read(fd, buffer, 0, MAX_READ, null, function(err, bytesRead) {
					Logger.log(req, LOG_DEBUG,"read",bytesRead,"bytes of",file);
					offset += bytesRead;

					if (err) {
						Logger.log(req, LOG_ERROR,"Error reading from",file,"at offset",offset,">",err);
						finish(fd);
					} else if(bytesRead > 0) {
						if (bytesRead < MAX_READ) {
							res.write(buffer.slice(0, bytesRead));
						} else {
							res.write(buffer);
						}
						read(); // read more
					} else {				
						finish(fd);
					}					
				});
			}
		} else {
			Logger.log(req, LOG_WARN,"404 opening",file,">",err);
			res.sendError(404);
		}
	});
	
	function finish(fd) {	
		res.end();
		Logger.log(req, LOG_DEBUG,"finished",fd);
		clearTimeout(die);			
		if(fd) {
			fs.close(fd);
		}
	}
};

/**
 * Return the best mime type for the given file
 */
function getMimeType(file) {
	var ext = getFileExtension(file);
	
	if (MimeTypes[ext]) {
		return MimeTypes[ext];
	} else {
		return null;  // unknown...
	}
};

/**
 * Return the extension for the given path. If the path does not contain
 * an extension, the function returns null
 */
function getFileExtension(path) {
	var start = path.lastIndexOf(".")                    //find the last period character in the string
	if (start == -1) {
		return null;
	}
	
	return path.substring(start, path.length);
};

