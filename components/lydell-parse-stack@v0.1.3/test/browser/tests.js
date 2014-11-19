;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],2:[function(require,module,exports){

var type = require('type')

/**
 * assert all values are equal
 *
 * @param {Any} [...]
 * @return {Boolean}
 */

module.exports = function(){
	var i = arguments.length - 1
	while (i > 0) {
		if (!compare(arguments[i], arguments[--i])) return false
	}
	return true
}

// (any, any, [array]) -> boolean
function compare(a, b, memos){
	// All identical values are equivalent
	if (a === b) return true
	var fnA = types[type(a)]
	if (fnA !== types[type(b)]) return false
	return fnA ? fnA(a, b, memos) : false
}

var types = {}

// (Number) -> boolean
types.number = function(a){
	// NaN check
	return a !== a
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
	return a.toString() === b.toString()
		// Functions can act as objects
	  && types.object(a, b, memos) 
		&& compare(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
	return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
	return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
	return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
	return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
	return function(a, b, memos){
		if (!memos) return fn(a, b, [])
		var i = memos.length, memo
		while (memo = memos[--i]) {
			if (memo[0] === a && memo[1] === b) return true
		}
		return fn(a, b, memos)
	}
}

types['arguments'] =
types.array = memoGaurd(compareArrays)

// (array, array, array) -> boolean
function compareArrays(a, b, memos){
	var i = a.length
	if (i !== b.length) return false
	memos.push([a, b])
	while (i--) {
		if (!compare(a[i], b[i], memos)) return false
	}
	return true
}

types.object = memoGaurd(compareObjects)

// (object, object, array) -> boolean
function compareObjects(a, b, memos) {
	var ka = getEnumerableProperties(a)
	var kb = getEnumerableProperties(b)
	var i = ka.length

	// same number of properties
	if (i !== kb.length) return false

	// although not necessarily the same order
	ka.sort()
	kb.sort()

	// cheap key test
	while (i--) if (ka[i] !== kb[i]) return false

	// remember
	memos.push([a, b])

	// iterate again this time doing a thorough check
	i = ka.length
	while (i--) {
		var key = ka[i]
		if (!compare(a[key], b[key], memos)) return false
	}

	return true
}

// (object) -> array
function getEnumerableProperties (object) {
	var result = []
	for (var k in object) if (k !== 'constructor') {
		result.push(k)
	}
	return result
}

// expose compare
module.exports.compare = compare

},{"type":3}],3:[function(require,module,exports){

/**
 * refs
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(v){
  // .toString() is slow so try avoid it
  return typeof v === 'object'
    ? types[toString.call(v)]
    : typeof v
};

var types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Text]': 'textnode',
  '[object Uint8Array]': '8bit-array',
  '[object Uint16Array]': '16bit-array',
  '[object Uint32Array]': '32bit-array',
  '[object Uint8ClampedArray]': '8bit-array',
  '[object Error]': 'error'
}

if (typeof window != 'undefined') {
  for (var el in window) if (/^HTML\w+Element$/.test(el)) {
    types['[object '+el+']'] = 'element'
  }
}

module.exports.types = types

},{}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of throws.

throws is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

throws is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with throws. If not,
see <http://www.gnu.org/licenses/>.
*/

var compare;

compare = function(error, errorConstructor, arg, messageHolder) {
  var array, exactString, item, message, messageLowerCase, regex, subString, valid, _i, _len;
  if (arg == null) {
    arg = null;
  }
  if (messageHolder == null) {
    messageHolder = {};
  }
  messageHolder.message = "Expected error to be an instance of `" + errorConstructor.name + "`";
  if (!(error instanceof errorConstructor)) {
    return false;
  }
  if (arg === null) {
    return true;
  }
  message = error.message;
  if (typeof arg === "string") {
    exactString = arg;
    messageHolder.message = "Expected `" + message + "` to exactly equal `" + exactString + "`";
    if (message !== exactString) {
      return false;
    }
  } else {
    array = arg;
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      valid = typeof item === "string" ? (subString = item.toLowerCase(), messageLowerCase = message.toLowerCase(), messageHolder.message = "Expected `" + subString + "` to be present in `" + messageLowerCase + "`", messageLowerCase.indexOf(subString.toLowerCase()) >= 0) : (regex = item, messageHolder.message = "Expected " + regex + " to match `" + message + "`", regex.test(message));
      if (!valid) {
        return false;
      }
    }
  }
  return true;
};

module.exports = compare;

},{}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of throws.

throws is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

throws is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with throws. If not,
see <http://www.gnu.org/licenses/>.
*/

var parse, regexRegex;

regexRegex = /^\/((?:\\[\s\S]|[^\\\/])+)\//;

parse = function(string, splitChar) {
  var exactString, isRegex, match, modifiers, reachedEnd, regex, splitCharPos, subString, wholeMatch, _results;
  if (typeof string !== "string") {
    throw new TypeError("`string` must be a string.");
  }
  if (!(typeof splitChar === "string" && splitChar.length === 1)) {
    throw new Error("`splitChar` must be a single character.");
  }
  if (string === splitChar) {
    throw new Error("`string` must not contain only `splitChar`.");
  }
  if (string[0] === splitChar && string[string.length - 1] === splitChar) {
    exactString = string.slice(1, -1);
    return exactString;
  }
  reachedEnd = false;
  _results = [];
  while (!reachedEnd) {
    isRegex = string[0] === "/" && string[1] !== "/";
    if (isRegex) {
      match = string.match(regexRegex);
      if (!match) {
        throw new SyntaxError("Unterminated regular expression: " + string);
      }
      wholeMatch = match[0], regex = match[1];
      string = string.slice(wholeMatch.length);
    }
    splitCharPos = string.indexOf(splitChar);
    if (splitCharPos === -1) {
      splitCharPos = string.length;
      reachedEnd = true;
    }
    subString = string.slice(0, splitCharPos);
    string = string.slice(splitCharPos + 1);
    if (isRegex) {
      modifiers = subString;
      _results.push(RegExp(regex, modifiers));
    } else {
      _results.push(subString.replace(/^\/{2,}/, function(slashes) {
        return slashes.slice(1);
      }));
    }
  }
  return _results;
};

module.exports = parse;

},{}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of throws.

throws is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

throws is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with throws. If not,
see <http://www.gnu.org/licenses/>.
*/

var compare, parse, throws,
  __slice = [].slice;

parse = require("./parse");

compare = require("./compare");

throws = function() {
  var arg, args, error, errorConstructor, fn, test, _ref;
  test = arguments[0], fn = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
  switch (false) {
    case !(test instanceof Error):
      errorConstructor = test.constructor;
      break;
    case !((test != null ? test.prototype : void 0) instanceof Error || test === Error):
      errorConstructor = test;
      break;
    case typeof test !== "function":
      args.unshift(fn);
      fn = test;
      test = null;
      break;
    default:
      throw new TypeError("`test` must be an error instance (`test instanceof Error`),\nor an error constructor (a subclass of `Error` or `Error` itself).");
  }
  if (typeof fn !== "function") {
    throw new TypeError("`fn` must be a function.");
  }
  try {
    fn.apply(null, args);
    throws.messageHolder.message = "Expected function to throw";
    return false;
  } catch (_error) {
    error = _error;
    if (!test) {
      return true;
    }
  }
  arg = throws.parse((_ref = test.message) != null ? _ref : "", throws.splitChar);
  return throws.compare(error, errorConstructor, arg, throws.messageHolder);
};

throws.parse = parse;

throws.compare = compare;

throws.splitChar = "|";

throws.messageHolder = {};

module.exports = throws;

},{"./compare":4,"./parse":5}],7:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of yaba.

yaba is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

yaba is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with yaba. If not,
see <http://www.gnu.org/licenses/>.
*/

var getExpression, readFileSync, validate;

readFileSync = require("./readFileSync");

getExpression = function(_arg) {
  var additionalLinesRegex, columnNumber, emptyLine, expression, file, filepath, indentation, lastLine, lastMatchWasLastLine, line, lineNumber, match, moreIndentedLine, _base, _i, _len, _ref, _ref1, _ref2, _ref3;
  filepath = _arg.filepath, lineNumber = _arg.lineNumber, columnNumber = _arg.columnNumber;
  if (typeof filepath !== "string") {
    throw new TypeError("The file path (`" + filepath + "`) must be a string.");
  }
  file = (_base = getExpression.fileCache)[filepath] != null ? (_base = getExpression.fileCache)[filepath] : _base[filepath] = getExpression.readFileSync(filepath, "utf-8").split(/\r\n|\r|\n/);
  validate(lineNumber, "line number", file.length, "file");
  lineNumber -= 1;
  line = file[lineNumber];
  indentation = line.match(/^\s*/)[0];
  if (columnNumber != null) {
    validate(columnNumber, "column number", line.length, "line");
    columnNumber -= 1;
  } else {
    columnNumber = indentation.length;
  }
  expression = [];
  expression.push(line.slice(columnNumber));
  additionalLinesRegex = RegExp("^(?:(\\s*)|" + indentation + "(?:(\\s+.*)|(['\"\\s]*[)}\\]].*)))$");
  lastMatchWasLastLine = false;
  _ref = file.slice(lineNumber + 1);
  for (_i = 0, _len = _ref.length; _i < _len; _i += 1) {
    line = _ref[_i];
    _ref2 = (_ref1 = line.match(additionalLinesRegex)) != null ? _ref1 : [], match = _ref2[0], emptyLine = _ref2[1], moreIndentedLine = _ref2[2], lastLine = _ref2[3];
    if (match == null) {
      break;
    }
    if (lastMatchWasLastLine && lastLine) {
      break;
    }
    expression.push((_ref3 = emptyLine != null ? emptyLine : moreIndentedLine) != null ? _ref3 : lastLine);
    lastMatchWasLastLine = lastLine != null;
  }
  return expression.join("\n").replace(/\s+$/, "");
};

getExpression.fileCache = {};

getExpression.readFileSync = readFileSync;

validate = function(number, numberName, limit, limitName) {
  if (!(typeof number === "number" && Math.floor(number) === number)) {
    throw new TypeError("The " + numberName + " (`" + number + "`) must be a whole number.");
  }
  if (!((1 <= number && number <= limit))) {
    throw new RangeError("The " + numberName + " (`" + number + "`) must be within the " + limitName + " (max " + limit + ").");
  }
};

module.exports = getExpression;

},{"./readFileSync":8}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of yaba.

yaba is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

yaba is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with yaba. If not,
see <http://www.gnu.org/licenses/>.
*/

var readFileSync;

if (typeof XMLHttpRequest === "function") {
  readFileSync = function(path) {
    var request;
    request = new XMLHttpRequest;
    request.open("GET", path, false);
    request.send(null);
    if (request.status < 400) {
      return request.responseText;
    } else {
      throw new Error("Could not fetch " + path + ":\n" + request.responseText);
    }
  };
} else {
  readFileSync = require("fs").readFileSync;
}

module.exports = readFileSync;

},{"fs":1}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of yaba.

yaba is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

yaba is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with yaba. If not,
see <http://www.gnu.org/licenses/>.
*/

var clean, getExpression, parseStack, yaba;

parseStack = require("parse-stack");

getExpression = require("./getExpression");

yaba = function(value) {
  var assertionError, error, expression, message, stack;
  yaba.runs += 1;
  if (value) {
    clean();
    return;
  }
  try {
    throw new Error;
  } catch (_error) {
    error = _error;
  }
  try {
    stack = parseStack(error);
    if (stack) {
      expression = getExpression(stack[1]);
    }
  } catch (_error) {
    error = _error;
    if (typeof console !== "undefined" && console !== null) {
      console.log("yaba: " + error);
    }
  }
  message = expression || ("Assertion " + yaba.runs + " failed");
  if (yaba.message) {
    message += " -- " + yaba.message;
  }
  assertionError = new Error(message);
  assertionError.yaba = yaba.error;
  assertionError.actual = yaba.actual;
  assertionError.expected = yaba.expected;
  clean();
  throw assertionError;
};

yaba.runs = 0;

yaba.error = {};

clean = function() {
  return yaba.actual = yaba.expected = yaba.message = void 0;
};

switch (false) {
  case !(typeof define === "function" && define.amd):
    define(yaba);
    break;
  case typeof module !== "object":
    module.exports = yaba;
    break;
  default:
    this.yaba = yaba;
}

},{"./getExpression":7,"parse-stack":10}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of parse-stack.

parse-stack is free software: you can redistribute it and/or modify it under the terms of the GNU
Lesser General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

parse-stack is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with parse-stack. If
not, see <http://www.gnu.org/licenses/>.
*/

var ensureType, formats, newline, parseStack;

formats = [/^\x20+at\x20(?:([^(]+)\x20\()?(\S*):(\d+):(\d+)\)?$/, /^([^@]*)@(\S*):(\d+)$/];

newline = /\r\n|\r|\n/;

parseStack = function(error) {
  var columnNumber, filepath, format, index, lineNumber, match, name, prelude, stack, stackLine, stackLines, _i, _j, _len, _len1, _ref, _ref1, _results;
  if (typeof error.stack !== "string") {
    return null;
  }
  stack = error.stack;
  prelude = error.toString();
  if (stack.slice(0, prelude.length) === prelude) {
    stack = stack.slice(prelude.length);
  }
  stackLines = stack.split(newline).filter(function(stackLine) {
    return stackLine !== "";
  });
  for (_i = 0, _len = formats.length; _i < _len; _i++) {
    format = formats[_i];
    match = stackLines[0].match(format);
    if (match) {
      break;
    }
  }
  if (!match) {
    throw new Error("Unkown stack trace format:\n" + stack);
  }
  _results = [];
  for (index = _j = 0, _len1 = stackLines.length; _j < _len1; index = ++_j) {
    stackLine = stackLines[index];
    _ref1 = (_ref = stackLine.match(format)) != null ? _ref : [], match = _ref1[0], name = _ref1[1], filepath = _ref1[2], lineNumber = _ref1[3], columnNumber = _ref1[4];
    if (!match) {
      throw new Error("Unknown stack trace formatting on stack line " + (index + 1) + ":\n" + stackLine);
    }
    name = ensureType(String, name);
    filepath = ensureType(String, filepath);
    lineNumber = ensureType(Number, lineNumber);
    columnNumber = ensureType(Number, columnNumber);
    _results.push({
      name: name,
      filepath: filepath,
      lineNumber: lineNumber,
      columnNumber: columnNumber
    });
  }
  return _results;
};

ensureType = function(type, value) {
  if (value) {
    return type(value);
  } else {
    return void 0;
  }
};

switch (false) {
  case !(typeof define === "function" && define.amd):
    define(parseStack);
    break;
  case typeof module !== "object":
    module.exports = parseStack;
    break;
  default:
    this.parseStack = parseStack;
}

},{}],11:[function(require,module,exports){
module.exports=require(10)
},{}],12:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of throws.

throws is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

throws is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with throws. If not,
see <http://www.gnu.org/licenses/>.
*/

var assert, equal, equals, throws;

assert = require("yaba");

throws = require("throws");

equals = require("equals");

throws.messageHolder = assert;

equal = function(actual, expected) {
  assert.actual = actual;
  assert.expected = expected;
  return equals(actual, expected);
};

beforeEach(function() {
  return assert.runs = 0;
});

module.exports = {
  assert: assert,
  throws: throws,
  equal: equal
};

},{"equals":2,"throws":6,"yaba":9}],13:[function(require,module,exports){
// Generated by CoffeeScript 1.6.3
/*
Copyright 2013 Simon Lydell

This file is part of parse-stack.

parse-stack is free software: you can redistribute it and/or modify it under the terms of the GNU
Lesser General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

parse-stack is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with parse-stack. If
not, see <http://www.gnu.org/licenses/>.
*/

var assert, equal, parseStack, throws, toString, _ref;

_ref = require("./common"), assert = _ref.assert, throws = _ref.throws, equal = _ref.equal;

parseStack = require("../src/parse-stack");

toString = function() {
  if (this.message) {
    return "" + this.name + ": " + this.message;
  } else {
    return this.name;
  }
};

describe("parseStack", function() {
  it("is a function", function() {
    return assert(typeof parseStack === "function");
  });
  it("requires an object as argument", function() {
    assert(throws(function() {
      return parseStack();
    }));
    assert(throws(function() {
      return parseStack(null);
    }));
    return assert(!throws(function() {
      return parseStack({
        stack: "@:0"
      });
    }));
  });
  it("returns null unless the passed object has a `stack` property, which is a string", function() {
    assert(parseStack({}) === null);
    assert(parseStack({
      stack: void 0
    }) === null);
    assert(parseStack({
      stack: null
    }) === null);
    assert(parseStack({
      stack: 1
    }) === null);
    assert(parseStack({
      stack: [1, 2]
    }) === null);
    assert(parseStack({
      stack: {}
    }) === null);
    return assert(parseStack({
      stack: "@:0"
    }) !== null);
  });
  it("throws an error for invalid strings", function() {
    return assert(throws(Error("shouldn't parse"), function() {
      return parseStack({
        stack: "shouldn't parse"
      });
    }));
  });
  return it("returns an array of objects with the `name`, `filepath`, `lineNumber` and `columnNumber`\nproperties", function() {
    var stack;
    stack = parseStack({
      stack: "@:0"
    });
    assert(stack.length === 1);
    assert(stack[0].hasOwnProperty("name"));
    assert(stack[0].hasOwnProperty("filepath"));
    assert(stack[0].hasOwnProperty("lineNumber"));
    assert(stack[0].hasOwnProperty("columnNumber"));
    return assert(Object.keys(stack[0]).length === 4);
  });
});

describe("the at format", function() {
  it("starts with some spaces, followed by the word 'at' and contains at least a line number and\ncolumn number", function() {
    var columnNumber, filepath, lineNumber, name, spaces, stack, _i, _len, _ref1, _ref2, _results;
    _ref1 = [" ", "  ", "    "];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      spaces = _ref1[_i];
      stack = parseStack({
        stack: "" + spaces + "at :0:1"
      });
      assert(stack.length === 1);
      _ref2 = stack[0], name = _ref2.name, filepath = _ref2.filepath, lineNumber = _ref2.lineNumber, columnNumber = _ref2.columnNumber;
      assert(name === void 0);
      assert(filepath === void 0);
      assert(lineNumber === 0);
      _results.push(assert(columnNumber === 1));
    }
    return _results;
  });
  it("may also contain a file path", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    stack = parseStack({
      stack: "    at scheme://user:pass@domain:80/path?query=string#fragment_id:0:1"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === void 0);
    assert(filepath === "scheme://user:pass@domain:80/path?query=string#fragment_id");
    assert(lineNumber === 0);
    return assert(columnNumber === 1);
  });
  it("may also contain a function name, if parenthesis surround", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    assert(throws(Error("    at functionName :0:1"), function() {
      return parseStack({
        stack: "    at functionName :0:1"
      });
    }));
    stack = parseStack({
      stack: "    at functionName (:0:1)"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === "functionName");
    assert(filepath === void 0);
    assert(lineNumber === 0);
    return assert(columnNumber === 1);
  });
  it("handles all of the above at once", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    stack = parseStack({
      stack: "    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === "functionName");
    assert(filepath === "scheme://user:pass@domain:80/path?query=string#fragment_id");
    assert(lineNumber === 0);
    return assert(columnNumber === 1);
  });
  return it("parses a nice example", function() {
    var stack;
    stack = parseStack({
      stack: "Error: test\n  at assert (c:\\test.js:22:9)\n  at c:\\test.js:84:6\n  at $ (c:\\test.js:75:3)\n  at Object.<anonymous> (c:\\test.js:84:1)\n  at Object.<anonymous> (c:\\test.js:1:1)\n  at Module._compile (module.js:456:26)",
      name: "Error",
      message: "test",
      toString: toString
    });
    assert(stack.length === 6);
    return assert(equal(stack, [
      {
        name: "assert",
        filepath: "c:\\test.js",
        lineNumber: 22,
        columnNumber: 9
      }, {
        name: void 0,
        filepath: "c:\\test.js",
        lineNumber: 84,
        columnNumber: 6
      }, {
        name: "$",
        filepath: "c:\\test.js",
        lineNumber: 75,
        columnNumber: 3
      }, {
        name: "Object.<anonymous>",
        filepath: "c:\\test.js",
        lineNumber: 84,
        columnNumber: 1
      }, {
        name: "Object.<anonymous>",
        filepath: "c:\\test.js",
        lineNumber: 1,
        columnNumber: 1
      }, {
        name: "Module._compile",
        filepath: "module.js",
        lineNumber: 456,
        columnNumber: 26
      }
    ]));
  });
});

describe("the @ format", function() {
  it("contains the '@' symbol and then at least a line number", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    stack = parseStack({
      stack: "@:0"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === void 0);
    assert(filepath === void 0);
    assert(lineNumber === 0);
    return assert(columnNumber === void 0);
  });
  it("may also contain a file path", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    stack = parseStack({
      stack: "@scheme://user:pass@domain:80/path?query=string#fragment_id:0"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === void 0);
    assert(filepath === "scheme://user:pass@domain:80/path?query=string#fragment_id");
    assert(lineNumber === 0);
    return assert(columnNumber === void 0);
  });
  it("may also contain a function name", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    stack = parseStack({
      stack: "functionName@:0"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === "functionName");
    assert(filepath === void 0);
    assert(lineNumber === 0);
    return assert(columnNumber === void 0);
  });
  it("handles all of the above at once", function() {
    var columnNumber, filepath, lineNumber, name, stack, _ref1;
    stack = parseStack({
      stack: "functionName@scheme://user:pass@domain:80/path?query=string#fragment_id:0"
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === "functionName");
    assert(filepath === "scheme://user:pass@domain:80/path?query=string#fragment_id");
    assert(lineNumber === 0);
    return assert(columnNumber === void 0);
  });
  return it("parses a nice example", function() {
    var stack;
    stack = parseStack({
      stack: "assert@c:\\test.js:22\n@c:\\test.js:84\n$@c:\\test.js:75\nObject.<anonymous>@c:\\test.js:84\nObject.<anonymous>@c:\\test.js:1\nModule._compile@module.js:456"
    });
    assert(stack.length === 6);
    return assert(equal(stack, [
      {
        name: "assert",
        filepath: "c:\\test.js",
        lineNumber: 22,
        columnNumber: void 0
      }, {
        name: void 0,
        filepath: "c:\\test.js",
        lineNumber: 84,
        columnNumber: void 0
      }, {
        name: "$",
        filepath: "c:\\test.js",
        lineNumber: 75,
        columnNumber: void 0
      }, {
        name: "Object.<anonymous>",
        filepath: "c:\\test.js",
        lineNumber: 84,
        columnNumber: void 0
      }, {
        name: "Object.<anonymous>",
        filepath: "c:\\test.js",
        lineNumber: 1,
        columnNumber: void 0
      }, {
        name: "Module._compile",
        filepath: "module.js",
        lineNumber: 456,
        columnNumber: void 0
      }
    ]));
  });
});

describe("any format", function() {
  it("cannot contain invalid lines", function() {
    var stackString;
    stackString = "fn@http://example.com/script/fn.js:29\ninvalid line\n@http://example.com/script/fn.js:34";
    return assert(throws(Error("stack line 2"), function() {
      return parseStack({
        stack: stackString
      });
    }));
  });
  it("cannot mix formats", function() {
    var stackString;
    stackString = "fn@http://example.com/script/fn.js:29\n  at fn (http://example.com/script/fn.js:29:4)";
    return assert(throws(Error("stack line 2|  at fn (http://example.com/script/fn.js:29:4)"), function() {
      return parseStack({
        stack: stackString
      });
    }));
  });
  it("can use either of \\r\\n, \\r and \\n as newline characters", function() {
    var columnNumber, filepath, lineNumber, name, stack, _i, _len, _ref1, _results;
    stack = parseStack({
      stack: "@:0\r\n@:0\r@:0\n@:0"
    });
    assert(stack.length === 4);
    _results = [];
    for (_i = 0, _len = stack.length; _i < _len; _i++) {
      _ref1 = stack[_i], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
      assert(name === void 0);
      assert(filepath === void 0);
      assert(lineNumber === 0);
      _results.push(assert(columnNumber === void 0));
    }
    return _results;
  });
  it("can contain blank lines", function() {
    var columnNumber, filepath, lineNumber, name, stack, _i, _len, _ref1, _results;
    stack = parseStack({
      stack: "\n@:0\n\n\n@:0\n"
    });
    assert(stack.length === 2);
    _results = [];
    for (_i = 0, _len = stack.length; _i < _len; _i++) {
      _ref1 = stack[_i], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
      assert(name === void 0);
      assert(filepath === void 0);
      assert(lineNumber === 0);
      _results.push(assert(columnNumber === void 0));
    }
    return _results;
  });
  return it("may start with 'ErrorType: message'", function() {
    var columnNumber, error, filepath, lineNumber, name, stack, _ref1, _ref2, _ref3, _ref4, _ref5;
    stack = parseStack({
      stack: "AssertionError\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)",
      name: "AssertionError",
      toString: toString
    });
    assert(stack.length === 1);
    _ref1 = stack[0], name = _ref1.name, filepath = _ref1.filepath, lineNumber = _ref1.lineNumber, columnNumber = _ref1.columnNumber;
    assert(name === "functionName");
    assert(filepath === "scheme://user:pass@domain:80/path?query=string#fragment_id");
    assert(lineNumber === 0);
    assert(columnNumber === 1);
    stack = parseStack({
      stack: "AssertionError: assert(false);\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)",
      name: "AssertionError",
      message: "assert(false);",
      toString: toString
    });
    assert(stack.length === 1);
    _ref2 = stack[0], name = _ref2.name, filepath = _ref2.filepath, lineNumber = _ref2.lineNumber, columnNumber = _ref2.columnNumber;
    assert(name === "functionName");
    assert(filepath === "scheme://user:pass@domain:80/path?query=string#fragment_id");
    assert(lineNumber === 0);
    assert(columnNumber === 1);
    stack = parseStack({
      stack: "(Almost) anything is allowed as `name`!: The same is true for messages.\nThe following line shouldn't be confused as a stack line:\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)\n    at realStackLine (filepath:0:1)",
      name: "(Almost) anything is allowed as `name`!",
      message: "The same is true for messages.\nThe following line shouldn't be confused as a stack line:\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)",
      toString: toString
    });
    assert(stack.length === 1);
    _ref3 = stack[0], name = _ref3.name, filepath = _ref3.filepath, lineNumber = _ref3.lineNumber, columnNumber = _ref3.columnNumber;
    assert(name === "realStackLine");
    assert(filepath === "filepath");
    assert(lineNumber === 0);
    assert(columnNumber === 1);
    stack = parseStack({
      stack: "Newlines \r\n works \r without \n trouble: The \r\n same \r is \n true for messages.\nThe following line shouldn't be confused as a stack line:\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)\n    at realStackLine (filepath:0:1)",
      name: "Newlines \r\n works \r without \n trouble",
      message: "The \r\n same \r is \n true for messages.\nThe following line shouldn't be confused as a stack line:\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)",
      toString: toString
    });
    assert(stack.length === 1);
    _ref4 = stack[0], name = _ref4.name, filepath = _ref4.filepath, lineNumber = _ref4.lineNumber, columnNumber = _ref4.columnNumber;
    assert(name === "realStackLine");
    assert(filepath === "filepath");
    assert(lineNumber === 0);
    assert(columnNumber === 1);
    error = new Error("The \r\n same \r is \n true for messages.\nThe following line shouldn't be confused as a stack line:\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)");
    error.stack = "Error: The \r\n same \r is \n true for messages.\nThe following line shouldn't be confused as a stack line:\n    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)\n    at realStackLine (filepath:0:1)";
    stack = parseStack(error);
    assert(stack.length === 1);
    _ref5 = stack[0], name = _ref5.name, filepath = _ref5.filepath, lineNumber = _ref5.lineNumber, columnNumber = _ref5.columnNumber;
    assert(name === "realStackLine");
    assert(filepath === "filepath");
    assert(lineNumber === 0);
    return assert(columnNumber === 1);
  });
});

},{"../src/parse-stack":11,"./common":12}]},{},[12,13])
;