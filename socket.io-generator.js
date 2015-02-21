"use strict";

const co = require('co');

const isGeneratorFunction = function(obj) {
	return obj && obj.constructor && 'GeneratorFunction' === obj.constructor.name;
};

module.exports = function(socket, next) {
	['addEventListener', 'on', 'once'].forEach(function(name) {
		let emitter = socket[name];
		Object.defineProperty(socket, name, {
			value: function(event, func) {
				let self = this;
				let handler = isGeneratorFunction(func) === false ? func : function() {
					let args = Array.prototype.slice.call(arguments);
					co(function*() {
						yield func.apply(self, args);
					}).catch(function(err) {
						console.error(err.stack || err.toString());
					});
				};
				emitter.call(self, event, handler);
			}
		});
	});
	next();
};
