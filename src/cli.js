#!/usr/bin/env node

/**
 * CLI for Brigadier.
	$ brigadier path/to/project [task] [--option[=value]]
 */

var main = require('./main'),
	path = require('path'),
	fiber;

var DEFAULT = 'default';

/**
 * Same as {@link #fail}, but also prints usage string.
 * @private
 */
function usage() {
	console.log('\nUsage: brigadier project [task] [--option[=value]]');
	main.fail.apply(null, arguments);
}

var argv = [];
process.argv.forEach(function(arg) {
	var flag = arg.split('--')[1];
	if (flag) {
		flag = flag.split('=');
		main.project.config[flag[0]] = JSON.parse(flag[1] || 'true');
	} else {
		argv.push(arg);
	}
});

var project = argv[2],
	task = argv[3];
argv[4] &&
	usage('Invalid argument', argv[4]);

project ||
	usage('No project');

main.log.verbose = !!main.project.config.verbose;
project = path.resolve(process.cwd(), project);
main.global();
require(project);

if (!task) {
	main.task[DEFAULT] ?
		(task = DEFAULT) :
		usage('No default task');
}
main.task[task] ||
	usage('No such task', task, 'in', Object.keys(main.task).join('|'));

process.chdir(path.dirname(project));

main.build(task);