/**
 * Operating system helpers.
 */

var platform = {};
platform[process.platform] = true;

module.exports = {
	background: background,
	exec: exec,
	platform: platform
};

var log = require('./log'),
	fail = require('./util').fail,
	trace = log.trace;

var child = require('child_process');

/**
 * Executes shell command and returns its output.
 * @param {String} command
 * @param {String/String[]} [args]
 * @param {Object} [options]
 * @param {Boolean} [options.shell=true]
 * @param {Boolean} [options.stdio=false] Pipe all stdio to Brigadier.
 * @return {String}
 */
function exec(command, args, options) {
	if (args && typeof args === 'object' && !Array.isArray(args)) {
		return exec(command, [], args);
	}
	if (typeof args === 'string') {
		args = [args];
	}
	args = args ?
		Array.isArray(args) ?
			args :
			[args] :
		[];
	trace(command, args.join(' '), options ? inspect(options) : '');
	options = options || {};

	options.shell = options.hasOwnProperty('shell') ?
		options.shell :
		true;
	options.stdio = options.stdio ||
		options.stdio ?
			'inherit' :
			null;

	var result = child.spawnSync(command, args, options);
	process.title = 'Brigadier';
	if (result.error && options.fail !== false) {
		throw result.error;
	}
	if (result.status !== 0 && options.fail !== false) {
		fail(command, 'exit code', result.status);
	}

	return result.stdout ?
		result.stdout.toString() :
		'';
}

/**
 * Executes shell command in background.
 * @param {String} command
 * @param {String/String[]} [args]
 * @param {Object} [options]
 * @param {Boolean} [options.shell=true]
 * @param {Boolean} [options.stdio=false] Pipe all stdio to Brigadier.
 * @return {String}
 */
function background(command, args, options) {
	if (args && typeof args === 'object' && !Array.isArray(args)) {
		return background(command, [], args);
	}
	if (typeof args === 'string') {
		args = [args];
	}
	args = args ?
		Array.isArray(args) ?
			args :
			[args] :
		[];
	trace('background', command, args.join(' '), options ? inspect(options) : '');
	options = options || {};

	options.shell = options.hasOwnProperty('shell') ?
		options.shell :
		true;
	options.stdio = options.stdio ||
		options.stdio ?
			'inherit' :
			null;

	var proc = child.spawn(command, args, options);
	process.on('exit', function() {
		proc.kill();
	});

	return proc;
}
