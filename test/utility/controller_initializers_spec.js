'use strict';
const path = require('path');
const UTILITY = require(path.join(__dirname, '../../utility/index'));
const chai = require('chai');
const expect = chai.expect;

describe('getInitializers', function () {
	let proxy;
	before(() => {
		proxy = UTILITY.controller_initializers({ hello: 'world' }, {
			test: function (options) {
				return options.hello;
			},
			fizz: 'boom'
		});
	});
	it('Should create a Proxy which allows access to some target object methods', () => {
		let fn = proxy.test;
		expect(fn).to.be.a('function');
		expect(fn()).to.equal('world');
	});
	it('Should not allow properties to be added to Proxy object', () => {
		proxy.foo = 'bar';
		expect(proxy).to.not.have.property('foo');
	});
	it('Should wrap functions but return other data types normally', () => {
		expect(proxy.fizz).to.equal('boom');
	});
});