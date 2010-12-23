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


var fs = require('fs'),
    Path  = require('path'),
    Mu = require('../mu');

exports.parse = parse;
exports.parseText = parseText;

var otag = '{{';
var ctag = '}}';

function parse(filename, root, ext, callback) {
  fs.readFile(extension(root, filename, ext), function (err, contents) {
    if (err) {
      return callback(err);
    }
    
    Mu.Preprocessor.expandPartials(
      parseText(contents.toString("utf8"), filename),
      root,
      ext,
      function (err, res) {
        callback(err, res, filename);
      }
    );
  });
}

function parseText(text, filename) {
  filename = filename || "<raw text>";
  if (!text.split) {
      // Cast the passed Object back to aa String.
      text = new String(text);
  }
  var parsed = text.split('\n').map(function (val, i) {
      return parseLine(i+1, val, filename);
  });
  otag = '{{';
  ctag = '}}';
  return parsed;
}

function parseLine(lineNumber, lineText, filename) {
  if (lineNumber !== 1) {
    lineText = '\\n' + lineText;
  }
  
  return {
    number: lineNumber,
    source: lineText,
    filename: filename,
    tokens: actuallyParseLine(lineText)
  };
}

/**
 * Responsible for actually parsing lines. Converts them into the following
 * token form:
 * 
 * [
 *   {'type': 'string', 'value': 'Hello '},
 *   {'type': 'variable', 'value': 'name'}
 * ]
 * 
 * @param {String} text The source text of the line.
 * @returns {Array} The parsed tokens.
 */
function actuallyParseLine(text) {
  var r_otag;
  var r_ctag;
  var r_uctag;
  var r_sdctag;
  
  setTags(otag, ctag);
  
  var ret = [];
  var buffer = '';
  var letter;
  var i = 0;
  
  var state = 'normal';
  
  function setTags(o, c) {
    otag = o;
    ctag = c;
    
    r_otag   = new RegExp(escapeRegex(otag) + '$');
    r_ctag   = new RegExp(escapeRegex(ctag) + '$');
    r_uctag  = new RegExp('}' + escapeRegex(ctag) + '$');
    r_sdctag = new RegExp('=' + escapeRegex(ctag) + '$');
  }
  
  var stateTagLookup = {
    '#': 'start_enumerable',
    '^': 'start_inverted_enumerable',
    '/': 'end_enumerable',
    '>': 'partial',
    '{': 'unescaped',
    '!': 'comment',
    '=': 'set_delimiter'
  };
  
  while (letter = text.charAt(i++)) {
    buffer += letter;
    
    switch (state) {
    
    case 'normal':
      if (buffer.match(r_otag)) {
        ret.push({
          type: 'string',
          value: buffer.substring(0, buffer.length - otag.length)
        });

        buffer = '';
        state = 'start_tag';
      }
      break;
      
    case 'start_tag':
      if (buffer === ' ') {
        buffer = '';
      } else if (buffer in stateTagLookup) {
        state = stateTagLookup[buffer];
        buffer = '';
      } else if (buffer.match(/[a-zA-Z\$_]/)) {
        state = 'variable';
      }
      break;
      
    case 'variable':
    case 'comment':
    case 'start_enumerable':
    case 'start_inverted_enumerable':
    case 'end_enumerable':
    case 'partial':
      if (buffer.match(r_ctag)) {
        ret.push({
          type: state,
          value: buffer.substring(0, buffer.length - ctag.length).trim()
        });
        
        buffer = '';
        state = 'normal';
      }
      break;
    
    case 'unescaped':
      if (buffer.match(r_uctag)) {
        ret.push({
          type: 'unescaped',
          value: buffer.substring(0, buffer.length - (ctag.length + 1)).trim()
        });
        
        buffer = '';
        state = 'normal';
      }
      break;
    
    case 'set_delimiter':
      if (buffer.match(r_sdctag)) {
        var data = buffer.substring(0, buffer.length - (ctag.length + 1)).trim();
        data = data.split(/ +/);
        
        if (data.length === 2) {
          setTags(data[0], data[1]);
        }
        
        buffer = '';
        state = 'normal';
      }
    
    }
  }
  
  if (buffer.length) {
    ret.push({type: 'string', value: buffer});
  }
  
  return ret;
}


// Private

function token(type, value) {
  return {type: type, value: value};
}

function escapeRegex(text) {
  // thank you Simon Willison
  if(!arguments.callee.sRE) {
    var specials = [
      '/', '.', '*', '+', '?', '|',
      '(', ')', '[', ']', '{', '}', '\\'
    ];
    arguments.callee.sRE = new RegExp(
      '(\\' + specials.join('|\\') + ')', 'g'
    );
  }
  
  return text.replace(arguments.callee.sRE, '\\$1');
}

function extension(root, filename, ext) {
  return ext ? Path.join(root, filename + '.' + ext) :
               Path.join(root, filename);
}
