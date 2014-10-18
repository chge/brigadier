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
	trace('write', name, content.length, options ? inspect(options) : '');
	options = options || {};
	options.strip &&
		(content = strip(content));

	return fs.writeFileSync(name, content, {encoding: 'utf8', flag: 'w'});
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
	if (!name) {
		name = root;
		root = null;
	}
	root &&
		(root = path.resolve(root));
	var resolved = path.resolve(name);
	root ?
		trace('files', root, resolved) :
		trace('files', resolved);

	var dirs = readdir.readSync(
		root || process.cwd(),
		[resolved],
		readdir.INCLUDE_HIDDEN + readdir.INCLUDE_DIRECTORIES
	);

	var output = [];
	dirs.forEach(function(dir) {
		var stat = fs.statSync(path.resolve(name, dir));
		stat.isDirectory() &&
			output.push(dir);
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