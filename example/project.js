/**
 * Example project for Brigadier.
	$ brigadier project
	$ brigadier project debug
 */

task('default', function(config) {
	run('clean');
	run('setup');
	run('compile');
	run('test');
	run('package');
	run('deploy', {
		username: config.username,
		password: config.password
	});
});

task('debug', function(config) {
	run('clean');
	run('setup');
	run('compile', {debug: true});
	run('test', {all: true});
});

task('clean', function() {
	rmdir('tmp');
});

task('setup', function() {
	mkdir('tmp');
});

task('compile', function(config) {
	ran('setup') ||
		run('setup');

	each([
		'path/to/file1',
		'path/to/file2'
	], function(path) {
		project.config.debug || config.debug ?
			exec('compiler --debug ' + path + ' tmp') :
			exec('compiler ' + path + ' tmp');
	});
});

task('test', function(config) {
	ran('compile') ||
		run('compile');

	exec('tester tests/common');
	config.all &&
		exec('tester tests/special');
});

task('package', function() {
	exec('packager tmp package.pkg');
});

task('deploy', function(config) {
});