/**
 * Operating system helpers.
 */

module.exports = {
	exec: exec
};

var log = require('./log'),
	fail = require('./util').fail,
	trace = log.trace;

var child = require('child_process'),
	stream = require('stream');

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
	options = options || {};
	trace(command, args.join(' '));

	options.stdio = options.stdio ||
		[null, 'inherit', 'inherit'];
	options.shell = options.hasOwnProperty('shell') ?
		options.shell :
		true;

	var result = child.spawnSync(command, args, options);
	if (result.error) {
		throw result.error;
	}
	result.status === 0 ||
		fail(command, 'exit code', result.status);

	return result.stdout ?
		result.stdout.toString() :
		'';
}
