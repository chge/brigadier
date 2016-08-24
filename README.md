Brigadier
=========

Simplistic JavaScript automation tool.

Syntax
------

Project file for Brigadier is a simple [Node.js](https://nodejs.org/) module with some instrumentation in global context.

You could use built-in Brigadier commands or just write any JavaScript code.

Tasks
-----

Project should declare at least one task. Default one is `default`.

```sh
$ brigadier path/to/project
```
```js
task('default', function() {
	// Let's do something awesome by default!
});
```

Of course, tasks could run each other, with optional configuration.

```sh
$ brigadier path/to/project work
```
```js
task('work', function() {
	run('talk', {blah: 'blah'});
});

task('talk', function(config) {
	log(config);
});
```

Configuration
-------------

Top-level task takes `project.config` configuration from command line.

```sh
$ brigadier path/to/project task --option=value --flag
```
```js
task('task', function(config) {
	// project.config.option === config.option === 'value'
	// project.config.flag === config.flag === true
});
```

There is default configuration flag — `verbose`. It simply enables `trace` output.

```sh
$ brigadier path/to/project task --verbose
```

Commands
--------

All built-in commands are synchronous.
Unfortunately, there are no complete list with explanation yet.

`task`
`run`
`ran`
`fail`

`log`
`trace`

`copy`
`read`
`write`
`files`
`dirs`
`exists`
`mkdir`
`rmdir`
`symlink`

`exec`

`concat`
`each`
`inspect`
`map`

Examples
--------

Check `example/project.js` for inspiration.

Using as a module
-----------------

```js
var brigadier = require('brigadier');
brigadier.parse('path/to/project');
brigadier.build('task');
```