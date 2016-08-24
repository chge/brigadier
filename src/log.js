/**
 * Logger.
 */

module.exports = log;

log.info = info;
log.log = log;
log.trace = trace;
log.indent = 0;

var join = require('./util').join;

/**
 * Logs all arguments on base logging level.
 */
function log() {
	console.log('\u001b[37m' + indent() + join(arguments, ' ') + '\u001b[39m');
}

/**
 * Logs all arguments on upper logging level.
 */
function info() {
	console.log('\u001b[1m' + indent() + join(arguments, ' ') + '\u001b[22m');
}

/**
 * Logs all arguments on lower logging level.
 */
function trace() {
	log.verbose &&
		console.log('\u001b[90m' + indent() + join(arguments, ' ') + '\u001b[39m');
}

/**
 * @ignore
 */
function indent() {
	var prefix = '';
	for (var i = 0; i < log.indent; i++) {
		prefix += '  ';
	}

	return prefix;
}
