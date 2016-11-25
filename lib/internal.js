/**
 * Internals.
 */

module.exports = {
	install: install,
	fail: fail,
	error: error
};

var log = require('./log').log,
	join = require('./util').join;
	exec = require('./os').exec;

var path = require('path');

var installing = false;

/**
 * Installs module(s).
 * @param {String/String[]} name
 * @param {Boolean} [globally] True for --global, false to search and install near project, don't pass to search near project and install into Brigadier home.
 * @return {Mixed/Mixed[]}
 */
function install(name, globally) {
	if (Array.isArray(name)) {
		return name.map(function(n) {
			return install(n, globally);
		});
	}

	var home = path.resolve(__dirname, '../node_modules') + path.sep,
		// TODO determine caller dir from stack?
		caller = path.resolve(
			path.dirname(
				path.resolve(process.cwd(), process.argv[2])
			),
			'node_modules'
		) + path.sep,
		locally = false;
	try {
		if (globally) {
			return require('requireg')(name);
		} else if (globally === false) {
			locally = true;
			return require(caller + name);
		} else {
			try {
				locally = true;
				return require(caller + name);
			} catch (e) {
				locally = false;
				return require(home + name);
			}
		}
	} catch (thrown) {
		if (!installing) {
			installing = true;
			log.info('install');
		}
		log.indent++;
		log.trace('install', name, globally ? 'global' : locally ? 'local' : 'auto');

		log.indent++;
		exec(
			'npm',
			['install', name, globally ? '--global' : ''],
			{
				cwd: path.resolve(locally ? caller : home, '..')
			}
		);

		log.indent--;
		log.indent--;

		return globally ?
			require('requireg')(name) :
			locally ?
				require(caller + name) :
				require(home + name);
	}
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
 * @ignore
 */
function error(error) {
	throw error;
}
