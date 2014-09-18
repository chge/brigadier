/**
 * Templating helpers.
 */

module.exports = {
	markdown: markdown,
	mustache: mustache
};

var internal = require('./internal');

var Markdown = internal.optional('markdown').markdown,
	Mustache = internal.optional('mustache');

/**
 */
function markdown(text) {
	if (!Markdown) {
		return internal.fail('no markdown, sorry');
	}

	return Markdown.toHTML(text);
}

/**
 */
function mustache(name, values) {
	if (!Mustache) {
		return internal.fail('no mustache, sorry');
	}

	return Mustache.render(name, values);
}