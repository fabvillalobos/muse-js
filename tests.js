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


/**
 * Array of test modules
 */
var testSuites = [
	


];





var errorPrefix = "Assertion failed!";
function error(msg) {
	try {
		throw new Error(errorPrefix + " " + msg);
	} catch (e) {
		console.log(e.stack);
		endFail();
	}
};

process.on('uncaughtException', function(err) {
  console.log('Uncaught ' + err);
  endFail();
});

function endFail() {
  console.log("Tests failed!");
  process.exit(1);
};

global.Assert = {

	fail: function(msg) {
		if (msg) error(msg); else error("test failed");
	},

	isEqual: function(a, b) {
		if (a != b) error(a + " is not equal to " + b);
	},
	
	isGreaterThan: function(a, b) {
		if (a <= b) error(a + " is less or equal to " + b);
	},
	
	isGreaterOrEqual: function(a, b) {
		if (a < b) error(a + " is less than " + b);
	},

	isLessThan: function(a, b) {
		if (a >= b) error(a + " is greater or equal to " + b);
	},
	
	isLessOrEqual: function(a, b) {
		if (a > b) error(a + " is greater than " + b);
	},
	
	isTrue: function(t) {
		if (!t) error(t + " is false");
	},
	
	isFalse: function(t) {
		if (t) error(t + " is true");
	},
	
	testComplete: function() {
		endTest();
	}
	
};


var arr = [1, 2, 3, 4];

var iterator = require("./lib/util/iterator");
var it = new iterator.Iterator(arr, true);

while (it.hasNext()) {
	console.log(it.next());
}

var rit = new iterator.RangeIterator(0, 3);
while (rit.hasNext()) {
	console.log(rit.next());
}
rit = new iterator.RangeIterator(0, 10, 3);
while (rit.hasNext()) {
	console.log(rit.next());
}


/*
var re = /:\w+/g;

var subjects = [
	"/path/to/foo",
	"/root/:foo/bar",
	"/root/:foo/:bar"
];

var m;
for (var i in subjects) {
	console.log("Matching '" + subjects[i] + " = ");
	m = subjects[i].match(re);

	if (!m) {
		console.log("No match!");
	} else {
		var s = "Match at position " + m.index + " (" + m.length + " matches):\n";
		console.log(m);
    	for (var j = 0; j < m.length; j++) {
      	s = s + m[j] + "\n";
		}
		console.log(s);
	}
}
*/



/*
var path = require("./lib/util/path");


var test = "app/:package/:view";


var res = path.format(test, {
	'package': 'test',
	'view': 'v_test'
});

console.log(test + " = " + res);
*/

var len=testSuites.length;
var testSuite, testname, testCases;
for (var i=0; i<len; i++) {
	testname = testSuites[i];
	testSuite = require(testname);
	testCases = [];
	
	// collect all tests
	for (var fn in testcase) {
		if ((typeof testSuite[fn] == 'function') && (/^test/.test(fn))) {
			testCases.push({   // push test case to the 
				fn: fn,
				time: 0    // in milliseconds
			});
		}
	}

	// replace testSuite[i] with prepared data
	testSuites[i] = {
		t_name: testname,
		t_suite: testSuite,
		t_cases: testCases
	};	
};
//nextTest();  // start first test


function getNextTest() {
	var nextTest = null;
	var s_len=testSuites.length;
	var c_len, tc;
	
	for (var i=0; i<s_len; i++) {
		tc = testSuites[i];
		c_len = tc.t_cases.length;
		for (var j=0; j<c_len; j++) {
					
		}
	}
	
	return nextTest;
};

function nextTest() {
	if (testSuites.length > 0) {
		var t = testSuites[0];
		if (t.t_cases.length > 0) {
			var tc = t.t_cases[0];
			
			console.log("Test started: " + t.t_name + "." + t.tc);
			
			if (t.suite[tc]() != false) {
				endTest();
			} // else, wait for the Assert.testComplete() event to be fired...
		}
	}
};

function endTest() {
	if (testSuites.length > 0) {
		var t = testSuites[0];
		if (t.t_cases.length > 0) {
			var tc = t.t_cases.shift();
			
			console.log("Test ended: " + t.t_name + "." + t.tc);

			if (t.t_cases.length == 0) {
				testSuites.shift();  // remove test suite if no more test case
			}
			
			
			process.nextTick(nextTest);
		}
	}	
};
