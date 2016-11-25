/**
 * Example project for Brigadier.
	$ brigadier project
	$ brigadier project debug
 */

task('default', (config) => {
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

task('debug', () => {
	run('clean');
	run('setup');
	run('compile', {debug: true});
	run('test', {all: true});
});

task('clean', () => {
	rmdir('tmp');
});

task('setup', () => {
	mkdir('tmp');
});

task('compile', (config) => {
	ran('setup') ||
		run('setup');

	each([
		'path/to/file1',
		'path/to/file2'
	], (path) => {
		project.config.debug || config.debug ?
			exec('compiler --debug ' + path + ' tmp') :
			exec('compiler ' + path + ' tmp');
	});
});

task('test', (config) => {
	ran('compile') ||
		run('compile');

	exec('tester tests/common');
	config.all &&
		exec('tester tests/special');
});

task('package', () => {
	exec('packager tmp package.pkg');
});

task('deploy', (config) => {
	// config.username, config.password
});
