/**
 * Templating helpers.
 */

module.exports = {
	tpl: tpl,
	markdown: markdown,
	mustache: mustache
};

var internal = require('./internal');

var util = require('util'),
	marked = internal.optional('marked'),
	Mustache = internal.optional('mustache');

/**
 */
function tpl() {
	var all = '';
	Array.prototype.forEach.call(arguments, function(chunk) {
		all += util.isArray(chunk) ?
			chunk.length ?
				tpl.apply(null, chunk) :
				'' :
			typeof chunk === 'undefined' ?
				'' :
				chunk === null ?
					'' :
					chunk.toString ?
						chunk.toString() :
						chunk;
	});

	return all;
}

/**
 */
function markdown(text, options) {
	if (!marked) {
		return internal.fail('no marked, sorry');
	}
	options = options || {};

	var renderer = new marked.Renderer();
	[
		'code',
		'blockquote',
		'html',
		'heading',
		'hr',
		'list',
		'listitem',
		'paragraph',
		'table',
		'tablerow',
		'tablecell'
	].forEach(function(name) {
		options[name] &&
			(renderer[name] = options[name]);
	});
	options.renderer = renderer;

	return marked(text, options);
}

/**
 */
function mustache(name, values) {
	if (!Mustache) {
		return internal.fail('no mustache, sorry');
	}

	return Mustache.render(name, values);
}