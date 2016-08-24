/**
 * Operating system helpers.
 */

module.exports = {
	background: background,
	exec: exec
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
 * @return {String}
 */
function exec(command, args, options) {
	if (args && typeof args === 'object' && !Array.isArray(args)) {
		return exec(command, [], args);
	}
	if (!args && command.indexOf(' ') !== -1) {
		// TODO support quotes.
		command = command.split(' ');
		return exec(command[0], command.slice(1));
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

	options.stdio = options.stdio ||
		[null, 'inherit', 'inherit'];
	options.shell = options.hasOwnProperty('shell') ?
		options.shell :
		true;

	var result = child.spawnSync(command, args, options);
	process.title = 'Brigadier';
	if (result.error) {
		throw result.error;
	}
	result.status === 0 ||
		fail(command, 'exit code', result.status);

	return result.stdout ?
		result.stdout.toString() :
		'';
}

/**
 * Spawns background process.
 * @param {String} command
 * @param {String/String[]} [args]
 * @param {Object} [options]
 * @return {String}
 */
function background(command, args, options) {
	if (args && typeof args === 'object' && !Array.isArray(args)) {
		return background(command, [], args);
	}
	if (!args && command.indexOf(' ') !== -1) {
		// TODO support quotes.
		command = command.split(' ');
		return exec(command[0], command.slice(1));
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

	options.stdio = options.stdio ||
		[null, 'inherit', 'inherit'];
	options.shell = options.hasOwnProperty('shell') ?
		options.shell :
		true;

	var proc = child.spawn(command, args, options);
	process.on('exit', function() {
		proc.kill();
	});

	return proc;
}
