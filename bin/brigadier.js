#!/usr/bin/env node --harmony

/**
 * CLI for Brigadier.
	$ brigadier path/to/project [task] [--name[=value]]
 */

process.title = 'Brigadier';

var main = require('../lib/main');

// TODO use minimist.
var argv = [];
process.argv.forEach(function(arg) {
	var flag = arg.split('--')[1];
	if (flag) {
		flag = flag.split('=');
		main.project.config[flag[0]] = flag[1] || true;
	} else {
		argv.push(arg);
	}
});

var project = argv[2],
	task = argv[3];
argv[4] &&
	usage('invalid argument', argv[4]);

project ||
	usage('no project');

main.log.verbose = !!main.project.config.verbose;
main.parse(project);
main.build(task);

/**
 * @ignore
 */
function usage() {
	console.log('\nUsage: brigadier path/to/project [task] [--name[=value]]\n');
	main.fail.apply(null, arguments);
}
