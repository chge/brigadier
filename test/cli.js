var child = require('child_process');

QUnit.module('cli');

test('default task', function() {
	stop();

	child.exec('node bin/brigadier test/project', function(error) {
		error &&
			console.error(error);

		ok(!error, 'no error should occur');
		start();
	});
});

test('explicit task', function() {
	stop();

	child.exec('node bin/brigadier test/project default', function(error) {
		error &&
			console.error(error);

		ok(!error, 'no error should occur');
		start();
	});
});

test('unknown task', function() {
	stop();

	child.exec('node bin/brigadier test/project unknown', function(error) {
		ok(error, 'error should occur');
		start();
	});
});
