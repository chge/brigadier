main.global();

test('globals', function() {
	var except = {
		project: 'object'
	};

	Object.keys(main).forEach(function(name) {
		except[name] ?
			assert.ok(typeof global[name] === except[name], name + ' must be an ' + except[name]) :
			assert.ok(typeof global[name] === 'function', name + ' must be a function');
	});
});