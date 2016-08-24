/**
 * Brigadier. Simplistic JavaScript automation tool.
 * API reference is in JSDuck syntax.
 */

var fs = require('./fs'),
	log = require('./log'),
	os = require('./os'),
	util = require('./util');

var project = {config: {}};

module.exports = {
	build: build,
	concat: util.concat,
	copy: fs.copy,
	dirs: fs.dirs,
	each: util.each,
	exec: os.exec,
	exists: fs.exists,
	fail: util.fail,
	globals: globals,
	inspect: util.inspect,
	files: fs.files,
	log: log.log,
	map: util.map,
	mkdir: fs.mkdir,
	parse: parse,
	project: project,
	ran: ran,
	read: fs.read,
	rmdir: fs.rmdir,
	run: run,
	symlink: fs.symlink,
	task: task,
	trace: log.trace,
	write: fs.write
};

var DEFAULT = 'default';

var path = require('path');

/**
 */
function parse(module) {
	module = path.resolve(process.cwd(), module);
	globals();
	process.chdir(path.dirname(module));
	require(module);
}

/**
 */
function build(name) {
	if (!name) {
		task[DEFAULT] ?
			(name = DEFAULT) :
			usage('No default task');
	}

	var main = function() {
		run(name, project.config);
		trace('gut!');
	};

	main();
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
		log.info(name);
		config &&
			log.trace(util.inspect(config));

		log.indent++;
		var result = body.call(project, config || {});
		log.indent--;

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
