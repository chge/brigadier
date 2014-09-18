/**
 * Utilities.
 */

module.exports = {
	each: each,
	trim: trim,
	strip: strip,
	inspect: inspect,
	join: join
};

var util = require('util');

/**
 * Iterates over given collection.
 * @param {Array/Object} collection
 * @param {Function} iterator
 * @param {Mixed} iterator.value
 * @param {Number/String} iterator.key
 * @param {Array/Object} iterator.collection
 * @param {Mixed} [scope]
 */
function each(collection, iterator, scope) {
	if (collection.forEach) {
		collection.forEach(iterator, scope);
	} else {
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				iterator.call(scope, collection[key], key, collection);
			}
		}
	}
}

/**
 * Trims given string from both sides.
 * @param {String} input
 * @return {String}
 */
function trim(input) {
	return input.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/**
 * Removes all spaces, tabs and newlines from given string.
 * @param {String} input
 * @return {String}
 */
function strip(input) {
	input = trim(input || '');
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