task('default', function(config) {
	run('first');
	run('second');
});

task('first', function(config) {
});

task('second', function(config) {
	run('third');
});

task('third', function(config) {
});