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
 * @param {Boolean} [options.fail=true] Fail when command fails.
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
	options.stdio = 'stdio' in options ?
		options.stdio === true ?
			'inherit' :
			options.stdio :
		'inherit';

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
 * @param {Boolean} [options.fail=true] Fail when command fails.
 * @param {Boolean} [options.shell=true]
 * @param {Boolean} [options.stdio=true] Pipe all stdio to Brigadier.
 * @param {Boolean} [options.watch=false] Close Brigadier when process will close.
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

	options.shell = 'shell' in options ?
		options.shell :
		true;
	options.stdio = 'stdio' in options ?
		options.stdio === true ?
			'inherit' :
			options.stdio :
		'inherit';

	var proc = child.spawn(command, args, options),
		indent = log.indent;

	proc.on('exit', function(code) {
		code = code | 0;
		log.indent = indent;

		process.removeListener('exit', proc.exitHandler);

		code && options.fail !== false &&
			fail('background', command, 'exit code', code);

		trace('background', command, 'exit code', code);
		options.watch &&
			process.exit(code);
	});

	proc.exitHandler = function() {
		kill(proc);
	};
	process.prependListener('exit', proc.exitHandler);

	return proc;
}

function kill(proc) {
	switch (process.platform) {
		case 'win32':
			exec('taskkill /pid ' + proc.pid + ' /T /F', {fail: false, stdio: false});
		default:
			// TODO kill tree.
			proc.kill();
	}
}
