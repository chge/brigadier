/**
 * File system helpers.
 */

module.exports = {
	copy: copy,
	read: read,
	write: write,
	files: files,
	dirs: dirs,
	exists: exists,
	mkdir: mkdir,
	rmdir: rmdir,
	symlink: symlink
};

var util = require('./util'),
	fail = util.fail,
	log = require('./log'),
	strip = util.strip,
	trace = log.trace;

var glob = require('glob'),
	fs = require('fs'),
	path = require('path'),
	rmdirr = require('rmdir-recursive').sync;

/**
 * Copies one or more files.
 * @param {String} name
 * @param {String} to
 * @param {Object} [options]
 * @param {Boolean} [options.strip]
 */
function copy(from, to, options) {
	from = path.resolve(from);
	to = path.resolve(to);
	trace('copy', from, to, options ? inspect(options) : '');
	options = options || {};
	options.trace = options.trace === true;
	var dirname = path.dirname(to);

	log.indent++;
	fs.existsSync(dirname) ||
		mkdir(dirname);
	options.strip ?
		write(to, strip(read(from)), options) :
		write(to, read(from, {binary: true, trace: options.trace}), {binary: true, trace: options.trace});
	log.indent--;
}

/**
 * Reads the entire contents of a file.
 * @param {String} name
 * @param {Object} [options]
 * @param {Boolean} [options.binary]
 * @param {String} [options.encoding]
 * @return {String/Buffer}
 */
function read(name, options) {
	if (Array.isArray(name)) {
		return name.map(function(n) {
			return read(n, options);
		});
	}
	name = path.resolve(name);
	(!options || options.trace !== false) &&
		trace('read', name, options ? inspect(options) : '');
	options = options || {};

	var flags = {
		encoding: options.encoding,
		flag: 'r'
	};

	var content = fs.readFileSync(name, flags);

	return options.binary ?
		new Buffer(content, options.encoding) :
		content + '';
}

/**
 * Rewrites the entire contents of a file.
 * @param {String} name
 * @param {String/Buffer} [content]
 * @param {Object} [options]
 * @param {Boolean} [options.strip]
 * @param {Boolean} [options.binary]
 * @param {String} [options.encoding]
 * @param {Number} [options.mode]
 */
function write(name, content, options) {
	content = content || '';
	name = path.resolve(name);
	(!options || options.trace !== false) &&
		trace('write', name, content.length, options ? inspect(options) : '');
	options = options || {};

	var flags = {
			encoding: options.encoding,
			flag: 'w'
		},
		dirname = path.dirname(name);
	options.hasOwnProperty('mode') &&
		(flags.mode = options.mode);

	content = options.binary ?
		new Buffer(content, options.encoding) :
		content + '';
	options.strip &&
		(content = strip(content));

	log.indent++;
	fs.existsSync(dirname) ||
		mkdir(dirname);
	fs.writeFileSync(name, content, flags);
	log.indent--;
}

/**
 * Returns array of normalized file paths.
 * @param {String} [root]
 * @param {String/String[]} name
 * @return {String[]}
 * @param {Object} [options]
 */
function files(root, name, options) {
	if (arguments.length > 1) {
		root = path.resolve(root);
	} else {
		name = root;
		root = process.cwd();
	}
	if (Array.isArray(name)) {
		return Array.prototype.concat.apply([],
			name.map(function(n) {
				return files(n, options);
			})
		);
	}
	trace('files', root, name, options ? inspect(options) : '');
	options = options || {};
	options.nodir = true;
	options.cwd = options.cwd || root;

	return glob.sync(name, options);
}

/**
 * Returns array of normalized directory paths.
 * @param {String} [root]
 * @param {String/String[]} name
 * @return {String[]}
 * @param {Object} [options]
 */
function dirs(root, name, options) {
	if (arguments.length > 1) {
		root = path.resolve(root);
	} else {
		name = root;
		root = process.cwd();
	}
	if (Array.isArray(name)) {
		return Array.prototype.concat.apply([],
			name.map(function(n) {
				return files(n, options);
			})
		);
	}
	trace('dirs', root, name, options ? inspect(options) : '');
	options = options || {};
	options.cwd = options.cwd || root;
	// TODO trailing slash.

	return glob.sync(name, options);
}

/**
 * Returns true if file or directory exists.
 * @param {String} name
 * @param {Object} [options]
 * @return {Boolean}
 */
function exists(name, options) {
	name = path.resolve(name);
	var output = fs.existsSync(name);
	trace('exists', name, output);

	return output;
}

/**
 * Creates directory with parents if missing.
 * @param {String} name
 * @param {Number} [mode]
 * @param {Object} [options]
 */
function mkdir(name, mode) {
	name = path.resolve(name);
	trace('mkdir', name);

	var dirname = path.dirname(name);
	fs.existsSync(dirname) ||
		mkdir(dirname, mode);
	try {
		fs.mkdirSync(name, mode);
	} catch (e) {
		switch (e.code) {
			case 'EEXIST':
				trace('  already exists');
				break;
			case 'EPERM':
				fail('permission denied for', name);
				break;
			default:
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
		rmdirr(name);
	} catch (e) {
		switch (e.code) {
			case 'ENOENT':
				trace('  no such directory');
				break;
			default:
				throw e;
		}
	}
}

/**
 * Creates symbolic link.
 * @param {String} src
 * @param {String} dst
 * @param {Object} [options]
 */
function symlink(src, dst, options) {
	src = path.resolve(src);
	dst = path.resolve(dst);
	trace('symlink', src, dst);

	try {
		fs.symlinkSync(src, dst);
	} catch (e) {
		switch (e.code) {
			case 'EEXIST':
				trace('  already exists');
				break;
			case 'EPERM':
				fail('permission denied for', src);
				break;
			default:
				throw e;
		}
	}
}
