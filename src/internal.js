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
 * @param {String/String[]} [names]
 * @param {Boolean} [globally] True for --global, false to search and install near project, don't pass to search near project and install into Brigadier home.
 * @return {Mixed/Mixed[]}
 */
function install(names, globally) {
	if (Array.isArray(names)) {
		return names.map(function(name) {
			return install(name, globally);
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
			return require('requireg')(names);
		} else if (globally === false) {
			locally = true;
			return require(caller + names);
		} else {
			try {
				locally = true;
				return require(caller + names);
			} catch (e) {
				locally = false;
				return require(home + names);
			}
		}
	} catch (thrown) {
		if (!installing) {
			installing = true;
			log.info('install');
		}
		log.trace('install', names, globally ? 'global' : locally ? 'local' : 'auto');
		exec(
			'npm',
			['install', names, globally ? '--global' : ''],
			{cwd: path.resolve(locally ? caller : home, '..')}
		);

		return globally ?
			require('requireg')(names) :
			locally ?
				require(caller + names) :
				require(home + names);
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
