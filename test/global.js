main.globals();

QUnit.module('api');

test('globals', function() {
	var except = {
		platform: 'object',
		project: 'object'
	};

	Object.keys(main).forEach(function(name) {
		except[name] ?
			ok(typeof global[name] === except[name], name + ' must be an ' + except[name]) :
			ok(typeof global[name] === 'function', name + ' must be a function');
	});
});
