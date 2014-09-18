/**
 * Templating helpers.
 */

module.exports = {
	mustache: mustache
};

var internal = require('./internal');

var Mustache = internal.optional('mustache');

/**
 */
function mustache(name, values) {
	if (!Mustache) {
		return internal.fail('no mustache, sorry');
	}

	return Mustache.render(name, values);
}