var qunit = require('qunit');

qunit.setup({
	log: {
		errors: true,
		tests: true
	}
});

qunit.run({
	deps: {
		path: 'lib/main',
		namespace: 'main'
	},
	code: 'lib/main',
	tests: [
		'test/cli.js',
		'test/global.js'
	]
}, function(error) {
	error &&
		console.error(error);
});
