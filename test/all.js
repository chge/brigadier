var qunit = require('qunit');

qunit.setup({
	log: {
		errors: true,
		tests: true
	}
});

qunit.run({
	deps: {
		path: 'src/main',
		namespace: 'main'
	},
	code: 'src/main',
	tests: 'test/global.js'
}, function(error) {
	error &&
		console.error(error);
});