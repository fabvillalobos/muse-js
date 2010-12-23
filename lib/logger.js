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
 
 
/**
 * Logging constants
 *
 * NOTE : should change this to LOG_200, LOG_400, LOG_500, etc... ??
 */
global.LOG_NOTHING = 0;
global.LOG_DEBUG = 1;
global.LOG_INFO = 2;
global.LOG_WARN = 4;
global.LOG_ERROR = 8;
global.LOG_ALL = LOG_DEBUG | LOG_INFO | LOG_WARN | LOG_ERROR;


var events = require('events');

// default, do not log anything...
var log_level = LOG_NOTHING;
var Emitter = new events.EventEmitter();

/**
 * Get/Set the logging level for the logger
 *
 * logger.logLevel();                    returns the log level
 * logger.logLevel(globals.LOG_DEBUG);   sets the log level
 *
 * The loggin level can be a combinaison of many levels, for
 * example : var LOG_LEVEL = globals.LOG_WARN + globals.LOG_ERROR;
 *      or : var LOG_LEVEL = globals.LOG_WARN | globals.LOG_ERROR;
 */
this.logLevel = function(level) {
	if (level != undefined) {
		log_level = level;
	}
	
	return log_level;
};

/**
 * Log something. If the level matches the specified logging level,
 * all listeners will be notified. Otherwise, the function will
 * return silently.
 *
 *    logger.log(null, LOG_DEBUG,"Hello","world");
 *
 * Will emit an event with message : "Hello world"
 *
 * @param req           the ServerRequest object, or null if not known
 * @param level         the log error level (see LOG_xxxx in conf/app.js
 * @param ...           arguments
 */
this.log = function(req, level) {
	if (log_level & level) {
		var args = Array.prototype.slice.call(arguments, 2);
		var e = {
			level: level,
			msg: args.join(" "),
			date: new Date(),
			request: req,
			arguments: args    // save arguments in case we need 'em
		};
	
		Emitter.emit("log", e);
	}
};

/**
 * Add a logging listener. The callback function should expect
 * to receive an object :
 *
 *    {
 *       level: int,           the logging level
 *       msg: string,          the logged message
 *       date: Date            the log Date object of the event
 *    }
 */
this.addListener = function(callback) {
	Emitter.addListener("log", callback);
};

/**
 * Remove a logging listener.
 */
this.removeListener = function(callback) {
	Emitter.removeListener("log", callback);
};
