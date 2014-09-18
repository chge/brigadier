/**
 * File system helpers.
 */

module.exports = {
	copy: copy,
	read: read,
	write: write,
	files: files,
	exists: exists,
	mkdir: mkdir,
	rmdir: rmdir
};

var fail = require('./internal').fail,
	log = require('./log'),
	trace = log.trace,
	strip = require('./util').strip;

var fs = require('fs'),
	path = require('path');

/**
 * Copies one or more files.
 * @param {String} name
 * @param {String} to
 * @param {Object} [options]
 */
function copy(from, to, options) {
	from = path.resolve(from);
	to = path.resolve(to);
	trace('copy', from, to, options ? inspect(options) : '');
	options = options || {};

	log.indent++;
	from = read(from);
	options.strip &&
		(from = strip(from));
	write(to, from);
	log.indent--;
}

/**
 * Reads the entire contents of a file.
 * @param {String} name
 * @param {Object} [options]
 * @return {String}
 */
function read(name, options) {
	name = path.resolve(name);
	trace('read', name);

	return fs.readFileSync(name, 'utf8');
}

/**
 * Rewrites the entire contents of a file.
 * @param {String} name
 * @param {String} [content]
 * @param {Object} [options]
 */
function write(name, content, options) {
	content = content || '';

	name = path.resolve(name);
	trace('write', name, content.length);

	return fs.writeFileSync(name, content, {encoding: 'utf8', flag: 'w'});
}

/**
 * Returns array of normalized file paths.
 * @param {String} path
 * @param {Object} [options]
 * @return {String[]}
 */
function files(path, options) {
	return fail('files is not implemented yet, sorry');
}

/**
 * Returns true if file or directory exists.
 * @param {String} name
 * @param {Object} [options]
 * @return {Boolean}
 */
function exists(name, options) {
	name = path.resolve(name);
	trace('stat', name);
	return fs.existsSync(name);
}

/**
 * Creates directory.
 * @param {String} name
 * @param {Number} [mode]
 * @param {Object} [options]
 */
function mkdir(name, mode) {
	name = path.resolve(name);
	trace('mkdir', name);

	try {
		fs.mkdirSync(name, mode);
	} catch (e) {
		if (e.code === 'EEXIST') {
			trace('  already exists');
		} else {
			throw e;
		}
	}
}

/**
 * Removes directory.
 * @param {String} name
 * @param {Object} [options]
 */
function rmdir(name, options) {
	name = path.resolve(name);
	trace('rmdir', name);

	try {
		fs.rmdirSync(name);
	} catch (e) {
		if (e.code === 'ENOENT') {
			trace('  no such directory');
		} else if (e.code === 'ENOTEMPTY') {
			log('  directory is not empty');
		} else {
			throw e;
		}
	}
}