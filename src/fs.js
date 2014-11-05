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

var internal = require('./internal'),
	fail = internal.fail,
	log = require('./log'),
	trace = log.trace,
	strip = require('./util').strip;

var fs = require('fs'),
	path = require('path');

var readdir = internal.optional('readdir');

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

	log.indent++;
	options.strip ?
		write(to, strip(read(from))) :
		write(to, read(from, {binary: true}), {binary: true});
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
	name = path.resolve(name);
	trace('write', name, options ? inspect(options) : '');
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
	trace('write', name, content.length, options ? inspect(options) : '');
	options = options || {};

	var flags = {
		encoding: options.encoding,
		flag: 'w'
	};
	options.hasOwnProperty('mode') &&
		(flags.mode = options.mode);

	content = options.binary ?
		new Buffer(content, options.encoding) :
		content + '';
	options.strip &&
		(content = strip(content));

	fs.writeFileSync(name, content, flags);
}

/**
 * Returns array of normalized file paths.
 * @param {String} [root]
 * @param {String} name
 * @return {String[]}
 */
function files(root, name) {
	if (!readdir) {
		return internal.fail('no readdir, sorry');
	}
	if (arguments.length > 1) {
		root = path.resolve(root);
	} else {
		name = root;
		root = process.cwd();
	}
	trace('files', root, name);

	return readdir.readSync(
		root,
		[name],
		readdir.INCLUDE_HIDDEN
	);
}

/**
 * Returns array of normalized directory paths.
 * @param {String} [root]
 * @param {String} name
 * @return {String[]}
 */
function dirs(root, name) {
	if (!readdir) {
		return internal.fail('no readdir, sorry');
	}
	if (arguments.length > 1) {
		root = path.resolve(root);
	} else {
		name = root;
		root = process.cwd();
	}
	trace('dirs', root, name);

	var dirs = readdir.readSync(
		root,
		[name],
		readdir.INCLUDE_HIDDEN + readdir.INCLUDE_DIRECTORIES
	);

	var output = [];
	dirs.forEach(function(dir) {
		var stat = fs.statSync(path.resolve(root, dir));
		stat.isDirectory() &&
			output.push(
				// WORKAROUND
				dir.replace(/\/$/, '')
			);
	});

	return output;
}

/**
 * @ignore
 */
function readdir(name, options) {
	var files = fs.readdirSync(path.resolve(name)),
		output = [];

	files.forEach(function(fname) {
		var file = fs.statSync(path.resolve(name, fname));
		if (options.files && file.isFile() ||
			options.dirs && file.isDirectory()
		) {
			output.push(path.join(name, fname));
		}
	});
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
		if (e.code === 'EEXIST') {
			trace('  already exists');
		} else if (e.code === 'EPERM') {
			fail('permission denied for', src);
		} else {
			throw e;
		}
	}
}