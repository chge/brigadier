/**
 * Operating system helpers.
 */

module.exports = {
	exec: exec
};

var internal = require('./internal'),
	log = require('./log'),
	trace = log.trace;

var child = require('child_process'),
	fibers = internal.optional('fibers');

/**
 * Executes shell command and returns its output.
 * @param {String} command
 * @param {Object} [options]
 * @return {String}
 */
function exec(command, options) {
	if (!fibers) {
		return fail('no fibers - no exec, sorry');
	}

	trace(command);
	var current = fibers.current,
		proc;

	proc = child.exec(command, function(err, stdout, stderr) { 
		if (err) {
			current.throwInto(err);
		}
	/*
		stdout &&
			trace(stdout);
	*/
		stderr &&
			log(stderr);
		current.run();
	});

	// TODO trace with indent
	proc.stdout.pipe(process.stdout);

	return fibers.yield();
}