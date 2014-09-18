/**
 * Brigadier. Simplistic JavaScript automation tool.
 * API reference is in JSDuck syntax.
 */

var internal = require('./internal'),
	log = require('./log'),
	fs = require('./fs'),
	os = require('./os'),
	tpl = require('./tpl'),
	util = require('./util');

var project = {config: {}};

module.exports = {
	parse: parse,
	build: build,
	globals: globals,

	task: task,
	run: run,
	ran: ran,

	project: project,

	fail: internal.fail,

	log: log.log,
	trace: log.trace,

	copy: fs.copy,
	read: fs.read,
	write: fs.write,
	files: fs.files,
	exists: fs.exists,
	mkdir: fs.mkdir,
	rmdir: fs.rmdir,

	exec: os.exec,

	mustache: tpl.mustache,

	each: util.each,
	inspect: util.inspect
};

var DEFAULT = 'default';

var path = require('path'),
	fibers = internal.optional('fibers');

/**
 */
function parse(module) {
	module = path.resolve(process.cwd(), module);
	globals();
	process.chdir(path.dirname(project));
	require(module);
}

/**
 */
function build(tsk) {
	if (!tsk) {
		task[DEFAULT] ?
			(tsk = DEFAULT) :
			usage('No default task');
	}

	var body = function() {
		run(tsk, project.config);
		trace('gut!');
	};

	fibers ?
		fibers(body).run() :
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
		return internal.fail('No such task', name, 'in', Object.keys(task).join('|'));
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