/**
 * Brigadier. Simplistic JavaScript automation tool.
 * API reference is in JSDuck syntax.
 */

var project = {config: {}};

module.exports = {
	build: build,

	task: task,
	run: run,
	ran: ran,

	copy: copy,
	read: read,
	write: write,
	files: files,
	exists: exists,
	mkdir: mkdir,
	rmdir: rmdir,

	each: each,
	exec: exec,

	ssi: ssi,

	log: log,
	trace: trace,
	fail: fail,
	inspect: inspect,

	project: project,
	global: globals
};

var util = require('util'),
	path = require('path'),
	child = require('child_process'),
	fs = require('fs'),
	fiber = requireOptional('fibers'),
	SSI = requireOptional('ssi');

// infrastructure

/**
 */
function parse(module) {
	globals();
	require(module);
}

/**
 */
function build(task) {
	var body = function() {
		run(task, project.config);
		trace('gut!');
	};

	fiber ?
		fiber(body).run() :
		body();
}

/**
 * Registers globals.
 */
function globals() {
	for (var key in module.exports) {
		if (module.exports.hasOwnProperty(key)) {
			global[key] = module.exports[key];
		}
	}
}

/**
 * Declares a task.
 * @param {String} name
 * @param {Function} body
 * @param {Object} [options]
 */
function task(name, body, options) {
	task[name] = function(config) {
		info(name);
		config &&
			trace(inspect(config));
		log.level++;
		var result = body.call(project, config || {});
		log.level--;
		return result;
	};
}

/**
 * Runs previously declared task.
 * @param {String} name
 * @param {Object} [config]
 * @return {Mixed}
 */
function run(name, config) {
	if (!task[name]) {
		return fail('No such task', name, 'in', Object.keys(task).join('|'));
	}

	var result = task[name](config);
	ran[name] = true;

	return result;
}

/**
 * Return true if task has been runned.
 * @param {String} name
 * @return {Boolean}
 */
function ran(name) {
	return !!ran[name];
}

// FS

/**
 * Copies one or more files.
 * @param {String} name
 * @param {String} to
 * @param {Object} [options]
 */
function copy(from, to, options) {
	from = path.resolve(from);
	to = path.resolve(to);
	trace('fcopy', from, to, options ? inspect(options) : '');
	options = options || {};

	log.level++;
	from = read(from);
	options.strip &&
		(from = strip(from));
	write(to, from);
	log.level--;
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
	// TODO
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
			log('  TODO');
		} else {
			throw e;
		}
	}
}

/**
 * Executes shell command and returns its output
 * @param {String} command
 * @param {Object} [options]
 * @return {String}
 */
function exec(command, options) {
	if (!fiber) {
		return fail('no fibers - no exec, sorry');
	}

	trace(command);
	var current = fiber.current,
		proc;

	proc = child.exec(command, function(err, stdout, stderr) { 
		if (err) {
			current.throwInto(err);
		}
		//stdout &&
		//	trace(stdout);
		stderr &&
			log(stderr);
		current.run();
	});

	// TODO trace with padding
	proc.stdout.pipe(process.stdout);

	return fiber.yield();
}

// utils

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

// templates

function ssi(name, values) {
	var parser = new SSI(),
		result = parser.parse(name, read(name), values);

	return result.contents;
}

// logging

/**
 * Logs all arguments on base logging level.
 */
function log() {
	console.log('\u001b[37m' + padding() + join(arguments, ' ') + '\u001b[39m');
}

log.level = 0;

/**
 * Logs all arguments on upper logging level.
 */
function info() {
	console.log('\u001b[1m' + padding() + join(arguments, ' ') + '\u001b[22m');
}

/**
 * Logs all arguments on lower logging level.
 */
function trace() {
	log.verbose &&
		console.log('\u001b[90m' + padding() + join(arguments, ' ') + '\u001b[39m');
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
 * @private
 */
function error(error) {
	throw error;
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

// internals

/**
 * @ignore
 */
function requireOptional(name, title) {
	try {
		return require(name);
	} catch(e) {
		trace('no ' + name + ' module');
	}
}

/**
 * @ignore
 */
function padding() {
	var prefix = '';
	for (var i = 0; i < log.level; i++) {
		prefix += '  ';
	}

	return prefix;
}