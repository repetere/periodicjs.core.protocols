'use strict';
const path = require('path');
const moment = require('moment');
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const express = require('express');
const ResponderAdapterInterface = require('periodicjs.core.responder');
const DBAdapterInterface = require('periodicjs.core.data');
const REST_Adapter = require(path.join(__dirname, '../../api_adapters/index')).rest;
const mongoose = require('mongoose');
const ExampleSchema = require(path.join(__dirname, '../example/mongoose_model'));
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-spies'));

var Example;
var connectDB = function () {
	return new Promisie((resolve, reject) => {
		if (mongoose.connection.readyState) resolve();
		else {
			mongoose.connect('mongodb://localhost/test_core_protocols');
			let db = mongoose.connection;
			db.on('error', reject)
				.once('open', resolve);
		}
	});
};

describe('REST_Adapter', function () {
	let db;
	let responder;
	let protocol;
	let Adapter;
	let middleware;
	let person = {
		contact: {
			first_name: 'Hello',
			last_name: 'World',
			dob: moment('12/12/1990', 'MM/DD/YYYY').format()
		}
	};
	before(done => {
		connectDB()
			.then(() => {
				Example = mongoose.model('Example', ExampleSchema);
				db = {
					example: DBAdapterInterface.create({ adapter: 'mongo', model: Example })
				};
				responder = ResponderAdapterInterface.create({ adapter: 'json' });
				protocol = { 
					responder, 
					db,
					redirect: function (req, res, options) {
						return Promisie.resolve(options);
					},
					error: () => true,
					exception: function (req, res, options) {
						return Promisie.reject(options.err);
					},
					respond: function (req, res, options) {
						return Promisie.resolve(options);
					},
					express,
					resources: {
						core: {
							controller: {
								save_revision: function (req, res, next) {
									next();
								}
							}
						}
					}
				};
				done();
			}, done);
	});
	describe('basic assertions', function () {
		before(done => {
			Adapter = new REST_Adapter(protocol);
			done();
		});
		it('Should have a .routing and .implement method and have a .initialize property', () => {
			expect(Adapter.routing).to.be.a('function');
			expect(Adapter.implement).to.be.a('function');
			expect(Adapter.initialize).to.be.an('object');
			expect(Adapter.initialize.hasOwnProperty('LOAD')).to.be.false;
			expect(Adapter.initialize.LOAD).to.be.a('function');
		});
	});
	describe('.implement method', function () {
		it('Should return a default configured router and controller methods if no options are passed', () => {
			let controller = Adapter.implement({ model_name: 'example' });
			expect(controller).to.have.property('new');
			expect(controller).to.have.property('show');
			expect(controller).to.have.property('edit');
			expect(controller).to.have.property('index');
			expect(controller).to.have.property('remove');
			expect(controller).to.have.property('search');
			expect(controller).to.have.property('create');
			expect(controller).to.have.property('update');
			expect(controller).to.have.property('load');
			expect(controller).to.have.property('load_with_count');
			expect(controller).to.have.property('load_with_limit');
			expect(controller).to.have.property('paginate');
			expect(controller).to.have.property('router');
			middleware = controller;
		});
		it('Should mount routes to an already instantiated router', () => {
			let router = express.Router();
			let getSpy = chai.spy(router.get.bind(router));
			let	routeSpy = chai.spy(router.route.bind(router));
			router.get = getSpy;
			router.route = routeSpy;
			let controller = Adapter.implement({ model_name: 'example', router });
			expect(getSpy).to.have.been.called();
			expect(routeSpy).to.have.been.called();
		});
		it('Should not mount routes if options.router is false', () => {
			let controller = Adapter.implement({ model_name: 'example', router: false });
			expect(controller).to.not.have.property('router');
		});
		it('Should respect overrides for controller methods', () => {
			let test_middleware = function test_middleware (req, res, next) {
				next();
			};
			let controller = Adapter.implement({
				model_name: 'example',
				router: false,
				override: {
					new: test_middleware,
					show: test_middleware,
					edit: test_middleware,
					index: test_middleware,
					remove: test_middleware,
					search: test_middleware,
					create: test_middleware,
					update: test_middleware,
					load: test_middleware,
					paginate: test_middleware
				}
			});
			expect(controller.new).to.deep.equal(test_middleware);
			expect(controller.show).to.deep.equal(test_middleware);
			expect(controller.edit).to.deep.equal(test_middleware);
			expect(controller.index).to.deep.equal(test_middleware);
			expect(controller.remove).to.deep.equal(test_middleware);
			expect(controller.search).to.deep.equal(test_middleware);
			expect(controller.create).to.deep.equal(test_middleware);
			expect(controller.update).to.deep.equal(test_middleware);
			expect(controller.load).to.deep.equal(test_middleware);
			expect(controller.paginate).to.deep.equal(test_middleware);
		});
	});
	describe('.routing method', function () {
		it('Should return a router with default routes registered if no options are passed', () => {
			let router = Adapter.routing({
				model_name: 'example',
				middleware
			});
			let registeredRoutes = router.stack.reduce((result, layer) => {
				result[layer.route.path] = layer.route.methods;
				return result;
			}, {});
			expect(registeredRoutes).to.have.property('/examples/new');
			expect(registeredRoutes).to.have.property('/examples/edit');
			expect(registeredRoutes).to.have.property('/examples/:id');
			expect(registeredRoutes).to.have.property('/examples');
		});
		it('Should return a router with overridden routes if options are passed', () => {
			let test_middleware = function test_middleware (req, res, next) {
				next();
			};
			let router = Adapter.routing({
				model_name: 'example',
				middleware,
				override: {
					create_index: [test_middleware]
				}
			});
			let registeredRoutes = router.stack.reduce((result, layer) => {
				result[layer.route.path] = layer.route.stack;
				return result;
			}, {});
			expect(registeredRoutes['/examples/new'][0].name).to.equal('test_middleware');
		});
	});
});