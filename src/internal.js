/**
 * Internals.
 */

module.exports = {
	optional: optional,
	fail: fail,
	error: error
};

var trace = require('./log').trace,
	join = require('./util').join;

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
 * @ignore
 */
function optional(name, title) {
	try {
		return require(name);
	} catch(e) {
		trace('no ' + name + ' module');
	}
}