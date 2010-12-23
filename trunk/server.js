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
 * @version 0.1 
 */


var path = require('path');
var http = require('http');


var Router = require("./lib/router");
var Application = require("./lib/application");
var HttpRequest = require("./lib/http/request");
var HttpResponse = require("./lib/http/response");

global.DateUtils = require("./lib/util/date");

var host = Config.listen.host;
var port = Config.listen.port;


// setup logger
Logger.addListener(function(e) {
	var levelStr;
	switch (e.level) {
		case LOG_ERROR:
			levelStr = "ERRO";
			break;
		case LOG_INFO:
			levelStr = "INFO";
			break;
		case LOG_DEBUG:
			levelStr = "DEBG";
			break;
		case LOG_WARN:
			levelStr = "WARN";
			break;
		default:
			levelStr = "UNKN";
			break;
	}
	console.log(DateUtils.getISODateString(e.date) 
		+ (e.request ? " [" + e.request.getRequestId() + "]" : "") 
		+ ": (" + levelStr + ") " 
		+ e.msg);
});


http.createServer(function(req, res) {
	HttpRequest.extendServerRequest(req);
	HttpResponse.extendServerResponse(res, req);

	Logger.log(req, LOG_INFO, "Request received:", req.url);

	try {
		var route = Router.route(req);
	
		if (route == null || route.isContent() == true) {
			var pubfile = DOCUMENT_ROOT + req.path;
			// first check if file exists in ./pub
			path.exists(pubfile, function(exists) {
				if (exists) {
					Application.render(res, pubfile);
				} else {
					Application.handle(req, res);
				}	
			});
		} else {
			Application.handle(req, res);
		}
	} catch (e) {
		res.sendError(500, e.message);
		Logger.log(req, LOG_ERROR, e.stack);
	}
}).listen(port, host);

Logger.log(null, LOG_INFO,'Server running at http://'+(host ? host : "128.0.0.1")+':'+port +'/');

