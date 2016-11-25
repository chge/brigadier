/**
 * Utilities.
 */

module.exports = {
	concat: concat,
	each: each,
	exit: exit,
	fail: fail,
	inspect: inspect,
	join: join,
	map: map,
	strip: strip,
	trim: trim
};

var util = require('util');

/**
 * Iterates over given collection.
 * @param {Array/Object} collection
 * @param {Function} visitor
 * @param {Mixed} visitor.value
 * @param {Number/String} visitor.key
 * @param {Array/Object} visitor.collection
 * @param {Mixed} [scope]
 */
function each(collection, visitor, scope) {
	if (typeof collection.forEach === 'function') {
		return collection.forEach(visitor, scope);
	}

	for (var key in collection) {
		if (collection.hasOwnProperty(key)) {
			visitor.call(scope, collection[key], key, collection);
		}
	}
}

/**
 * Trims given string from both sides.
 * @param {String} input
 * @return {String}
 */
function trim(input) {
	return (input ? input + '' : '').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/**
 * Removes all spaces, tabs and newlines from given string.
 * @param {String} input
 * @return {String}
 */
function strip(input) {
	input = trim(input ? input + '' : '');
	return input.replace(/(\r|\n|\t)/g, '');
}

/**
 * Returns verbose representation of given value.
 * @param {Mixed} value
 * @return {String}
 */
function inspect(value) {
	return util.inspect(value);
}

/**
 * Joins array into string using separator.
 */
function join(array, sep) {
	var out = '';
	Array.prototype.forEach.call(
		array,
		function(item) {
			out += typeof item === 'string' ?
				item + sep :
				inspect(item) + sep;
		}
	);

	return out;
}

/**
 */
function map(collection, visitor, scope) {
	if (typeof collection.map === 'function') {
		return collection.map(visitor, scope);
	}

	return Object.keys(collection).map(function(key) {
		return visitor.call(scope, collection[key], key, collection);
	});
}

/**
 */
function concat() {
	var result = '';

	each(arguments, function(chunk) {
		result += Array.isArray(chunk) ?
			chunk.length ?
				concat.apply(null, chunk) :
				'' :
			typeof chunk === 'undefined' ?
				'' :
				chunk === null ?
					'' :
					chunk.toString ?
						chunk.toString() :
						chunk;
	});

	return result;
}

/**
 */
function flatten() {
	// TODO
}

/**
 */
function filter() {
	// TODO
}

/**
 * Fails entire execution using all arguments as a message.
 */
function fail() {
	error(new Error(join(arguments, ' ')));
}

/**
 * Throws an error.
 * @param {Mixed} error
 * @ignore
 */
function error(error) {
	throw error;
}

/**
 * Exits with zero code.
 */
function exit() {
	process.exit();
}
