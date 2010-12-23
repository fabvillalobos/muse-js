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
 * @package lib/util
 * @version 0.1 
 */


 // Array check as proposed by Mr. Crockford
function isArray(candidate) {
	return candidate &&
	       typeof candidate==='object' &&
	       typeof candidate.length === 'number' &&
	       typeof candidate.splice === 'function' &&
	       !(candidate.propertyIsEnumerable('length'));
};

function dontIterate(collection) {
	// put some checks chere for stuff that isn't iterable (yet)
	return (!collection || typeof collection==='number' || typeof collection==='boolean');
};

/**
 * Create a new iterator with the given argument. The argument
 * may be an object, an array or a string (if a string, the
 * iterator will iterate over each character of the string).
 * 
 * Note : As of this version, the iterator does not check for 
 * concurrent modification on the given argument.
 *
 * Usage : var iterator = require("lib/util/iterator");
 *         var it = new iterator.Interator(collection);
 *
 * @param collection        some iterable argument
 * @param keyValuePair      if true, return an object {key, value}
 *                          instead of the the current value only
 */
this.Iterator = function(collection, keyValuePair) {
	if (typeof collection==='string') {
		collection = collection.split('');
	}
	
	if (dontIterate(collection)) {
		throw new Error('IllegalArgument('+collection+')!');
	}
	
	var arr = keyValuePair ? false : isArray(collection);
	var idx = -1, top=0;
	var keys = [], prop;
	
	if (arr) {
		top = collection.length;
	} else {
		for (prop in collection) {
			if(collection.hasOwnProperty(prop)) {
				keys.push(prop);
			}
		}
	}
	
   this.next = function() {
		if (!this.hasNext()) {
			throw new Error('StopIterator');
		}
		++idx;

		return this.current();		
	};
	
	this.current = function() {
		if (idx < 0) {
			throw new Error("IteratorState");
		}
		var elem = arr ? collection[idx] : {key:keys[idx], value:collection[keys[idx]]};
		return elem;
	};
	
	this.hasNext = function() {
		return (idx+1) < (arr ? top : keys.length);
	};
};



/**
 * Create a new iterator for the given range of numeric values.
 * The range will be inclusive, meaning that a RangeIterator(0, 10)
 * will return values from 0 to 10 inclusively.
 * 
 * Usage : var iterator = require("lib/util/iterator");
 *         var it = new iterator.RangeInterator(low, high);
 *
 * Note : This iterator will throw an IllegalArgument error if
 *        low > high or step <= 0
 *        The default value for step is 1 (if null or undefined)
 *
 * @param low              the lower bound
 * @param high             the uppoer bound
 * @param step (optional)  the step of this iterator
 */
this.RangeIterator = function(low, high, step) {
	if (low > high || step <= 0) {
		throw new Error("IllegalArgument");
	}
	
	if (step == undefined || step == null) {
		step = 1;
	}
	var cur = low - step;

	this.next = function() {
		if (!this.hasNext()) {
			throw new Error("StopIterator");
		}
		cur += step;
		
		return this.current();
	};
	
	this.current = function() {
		return cur;
	};
	
	this.hasNext = function() {
		return cur + step <= high;
	};

};

