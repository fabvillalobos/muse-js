/**
 * https://github.com/raycmorgan/Mu
 * Copyright (c) 2010 Ray Christopher Morgan
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
 
 
var fs = require("fs");
var Path = require('path');
var Mu = exports;
var baseProto = ({}).__proto__;

var PathUtil = require("../util/path");

Mu.Parser       = require('./mu/parser');
Mu.Compiler     = require('./mu/compiler');
Mu.Preprocessor = require('./mu/preprocessor');

var cache = {};

Mu.templateRoot = Config.views.basePath;
Mu.templateExtension = Config.views.suffix;


var getCache = function(pkg, path) {
	var key = "/" + pkg + "/" + path;
	var templateRoot = PathUtil.format(Mu.templateRoot, {'package':pkg});
	var _cached = cache[key];
	if (_cached) {
		// get current stats...
		var stats = fs.lstatSync(extension(templateRoot, path, Mu.templateExtension));
		
		if (stats.mtime == _cached.stats.mtime) {
			return _cached.fn;
		} else {
			 // file modified, need to reparse...	
			delete cache[key];
			
			return null;
		}
	} else {
		return null;
	}	
};

var setCache = function(pkg, path, fn) {
	var key = "/" + pkg + "/" + path;
	var templateRoot = PathUtil.format(Mu.templateRoot, {'package':pkg});
	var stats = fs.lstatSync(extension(templateRoot, path, Mu.templateExtension));
	
	return cache[key] = {
		stats: stats,
		fn: fn
	};
};

/**
 * Compiles a template into a executable function. This performs a parse check
 * to make sure that the template is well formed.
 * 
 * @example
 * 
 * myTemplate.mu
 * 
 *   Hello {{name}}!
 * 
 * run.js
 * 
 *   var sys = require('sys'),
 *        Mu = require('./lib/mu');
 *   Mu.compile('myTemplate', function (compiled) {
 *     compiled({name: 'Jim'}).addListener('data', function (c) { sys.print(c) })
 *   });
 * 
 * Running run.js will produce:
 * 
 *   Hello Jim!
 * 
 * @param {String} pkg The package of the template
 * @param {String} filename The filename of the template to load, parse and
 *        compile. This should not include the templateRoot or extension.
 * @param {Function} callback The callback that will be called on success or error.
 */
Mu.compile = function Mu_compile(pkg, filename, callback) {
  var templateRoot = PathUtil.format(Mu.templateRoot, {'package':pkg});
  Mu.Parser.parse(filename, templateRoot, Mu.templateExtension, 
    function (err, parsed) {
      if (err) {
        return callback(err);
      }
      
      var pp = Mu.Preprocessor;

      try {
        var compiled = Mu.Compiler.compile(pp.check(pp.clean(parsed)));
        setCache(pkg, filename, compiled);
        callback(undefined, compiled);
      } catch (e) {
        callback(e);
      }
    });
}

/**
 * Compiles a template as text instead of a filename. You are responsible for
 * providing your own partials as they will not be expanded via files.
 * 
 * @example
 * 
 * var sys = require('sys');
 * var tmpl = "Hello {{> part}}. What is your {{name}}?";
 * var partials = {part: "World"};
 * var compiled = Mu.compileText(tmpl, partials);
 * compiled({name: 'Jim'}).addListener('data', function (c) { sys.puts(c); });
 * 
 * @param {String} text The main template to compile.
 * @param {Object} partials The partials to expand when encountered. The object
 *        takes the form of {partialName: partialText}
 * @returns {Function} The compiled template.
 */
Mu.compileText = function Mu_compileText(text, partials) {
  var parsed = Mu.Parser.parseText(text, "main");
  var parsedPartials = {};
  
  for (var key in partials) {
    if (partials.hasOwnProperty(key)) {
      parsedPartials[key] = Mu.Parser.parseText(partials[key], key);
    }
  }
  
  var pp = Mu.Preprocessor;
  
  return Mu.Compiler.compile(
    pp.check(
      pp.clean(
        pp.expandPartialsFromMap(parsed, parsedPartials))));
}

/**
 * Shorcut to parse, compile and render a template.
 * 
 * @param {String} pkg The package of the template
 * @param {String} filename The filename of the template to load, parse and
 *        compile. This should not include the templateRoot or extension.
 * @param {Object} context The data that should be used when rendering the template.
 * @param {Function} callback The callback that will be called on success or error.
 */
Mu.render = function Mu_render(pkg, filename, context, options, callback) {
  var cached = getCache(pkg, filename);
  if (cached && options['cached'] !== false) {
    process.nextTick(function () {
      try {
        callback(undefined, cached(context, options));
      } catch (e) {
        callback(e);
      }
    });
  } else {
    Mu.compile(pkg, filename, function (err, compiled) {
      if (err) {
        return callback(err);
      }
      
      try {
        callback(undefined, compiled(context, options));
      } catch (e) {
        callback(e);
      }
    });
  }
}

/**
 * HTML escapes a string.
 * 
 * @param {String} string The string to escape.
 * @returns {String} The escaped string. 
 */
Mu.escape = function Mu_escape(string) {
  return string.replace(/[&<>"]/g, escapeReplace);
}

/**
 * Normalizes the param by calling it if it is a function, calling .toString
 * or simply returning a blank string.
 * 
 * @param {Object} val The value to normalize.
 * @returns {String} The normalized value. 
 */
Mu.normalize = function Mu_normalize(context, name) {
  var val = context[name];
  
  if (typeof val === 'function') {
    val = val.call(context);
  }
  
  return typeof val === 'undefined' ? '' : val.toString();
}

/**
 * Depending on the val passed into this function, different things happen.
 * 
 * If val is a boolean, fn is called if it is true and the return value is
 * returned.
 * If val is an Array, fn is called once for each element in the array and
 * the strings returned from those calls are collected and returned.
 * Else if val is defined fn is called with the val.
 * Otherwise an empty string is returned.
 * 
 * @param {Object} context The context that fn is called with if the val
 *        is a true boolean.
 * @param {Boolean|Array|Object} val The value that decides what happens.
 * @param {Function} fn The callback.
 */
Mu.enumerable = function Mu_enumerable(context, val, fn) {
  if (typeof(val) === 'function') {
    val = val.call(context);
  }
  
  if (typeof val === 'undefined') {
    return '';
  }
  
  if (typeof val === 'boolean') {
    return val ? fn(context) : '';
  }

  if (val instanceof Array) {
    var result = '';
    for (var i = 0, len = val.length; i < len; i++) {
      var oproto = insertProto(val[i], context);
      result += fn(val[i]);
      oproto.__proto__ = baseProto;
    }
    return result;
  }
  
  if (typeof val === 'object') {
    var oproto = insertProto(val, context);
    var ret = fn(val);
    oproto.__proto__ = baseProto;
    
    return ret;
  }

  return '';
}


// Private

function insertProto(obj, newProto, replaceProto) {
  replaceProto = replaceProto || baseProto;
  var proto = obj.__proto__;
  while (proto !== replaceProto) {
    obj = proto;
    proto = proto.__proto__;
  }
  
  obj.__proto__ = newProto;
  return obj;
}


function escapeReplace(c) {
  switch (c) {
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '&': return '&amp;';
    case '"': return '&quot;';
    default: return c;
  }
}


function extension(root, filename, ext) {
  return ext ? Path.join(root, filename + '.' + ext) :
               Path.join(root, filename);
}
