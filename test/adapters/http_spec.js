'use strict';
const path = require('path');
const moment = require('moment');
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const request = require('request');
const express = require('express');
const ResponderAdapterInterface = require('periodicjs.core.responder');
const bodyParser = require('body-parser');
const DBAdapterInterface = require('periodicjs.core.data');
const REST_Adapter = require(path.join(__dirname, '../../api_adapters/rest'));
const ProtocolAdapterInterface = require(path.join(__dirname, '../../index'));
const mongoose = require('mongoose');
const ExampleSchema = require(path.join(__dirname, '../example/mongoose_model'));
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-spies'));

var Example;
var Server;
var Adapter;
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

var startServer = function () {
	Server = express();
	return Promisie.promisify(Server.listen, Server)(3000);
};

describe('HTTP_Adapter', function () {
	let person = {
		contact: {
			first_name: 'Distinct',
			last_name: 'Name',
			dob: moment('12/12/1990', 'MM/DD/YYYY').format()
		}
	};
	before(done => {
		Promisie.parallel({
			db_connect: connectDB,
			server_connect: startServer
		})
			.then(() => {
				Example = mongoose.model('Example', ExampleSchema);
				let db = {
					example: DBAdapterInterface.create({ adapter: 'mongo', model: Example })
				};
				let responder = ResponderAdapterInterface.create({ adapter: 'json' });
				Adapter = ProtocolAdapterInterface.create({
					db, responder,
					express: Server,
					resources: {
						core: {
							controller: { save_revision: (req, res, next) => next() }
						}
					},
					api: 'rest',
					adapter: 'http'
				});
				done();
			}, done);
	});
	after(done => {
		if (Example) {
			let ChangeSet = mongoose.model('Changeset');
			Promisie.promisify(ChangeSet.remove, ChangeSet)({})
				.then(() => Promisie.promisify(Example.remove, Example)({}))
				.then(() => done())
				.catch(done);
		}
		else done();
	});
	describe('basic assumptions', function () {
		it('Should have a .error method', () => {
			expect(Adapter.error).to.be.a('function');
		});
		it('Should have a .warn method', () => {
			expect(Adapter.error).to.be.a('function');
		});
		it('Should have a .exception method', () => {
			expect(Adapter.error).to.be.a('function');
		});
		it('Should have a .respond method', () => {
			expect(Adapter.error).to.be.a('function');
		});
		it('Should have a .redirect method', () => {
			expect(Adapter.error).to.be.a('function');
		});
		it('Should have a .implement method', () => {
			expect(Adapter.error).to.be.a('function');
		});
		it('Should have a .api property that is an instance of a REST adapter', () => {
			expect(Adapter.api instanceof REST_Adapter).to.be.true;
		});
	});
	describe('implementing routes', function () {
		it('Should be able to implement all routes', () => {
			Adapter.implement();
			expect(Adapter.router).to.be.ok;
			let registeredRoutes = Adapter.router.stack.reduce((result, layer) => {
				if (layer && layer.route) result[layer.route.path] = layer.route.methods;
				return result;
			}, {});
			expect(registeredRoutes).to.have.property('/examples/new');
			expect(registeredRoutes).to.have.property('/examples/edit');
			expect(registeredRoutes).to.have.property('/examples/:id');
			expect(registeredRoutes).to.have.property('/examples');
		});
		it('Should be able to implement routes for a specific model', done => {
			Server = express();
			Promisie.promisify(Server.listen, Server)(3001)
				.then(() => {
					Server.use(bodyParser.json({}));
					Server.use(bodyParser.urlencoded({ extended: true }));
					Adapter.express = Server;
					Adapter.router = null
					return Adapter.implement({ model_name: 'example' });	
				})
				.try(() => {
					expect(Adapter.router).to.be.ok;
					let registeredRoutes = Adapter.router.stack.reduce((result, layer) => {
						if (layer && layer.route) result[layer.route.path] = layer.route.methods;
						return result;
					}, {});
					expect(registeredRoutes).to.have.property('/examples/new');
					expect(registeredRoutes).to.have.property('/examples/edit');
					expect(registeredRoutes).to.have.property('/examples/:id');
					expect(registeredRoutes).to.have.property('/examples');
					done();
				})
				.catch(done);
		});
	});
	describe('.respond method with options.return_response_data true', function () {
		it('Should return back response data and not send response', done => {
			let req = {
				query: {},
				params: {},
				baseUrl: 'test',
				headers: {},
				connection: {}
			};
			let res = {};
			res.status = chai.spy(function (num) {
				return res;
			});
			Adapter.respond(req, res, {
				data: { foo: 'bar' },
				return_response_data: true
			})
				.try(result => {
					expect(result).to.have.property('result')
					expect(result.result).to.equal('success');
					expect(res.status).to.not.have.been.called();
					done();
				})
				.catch(done);
		});
	});
	describe('making requests to implemented routes', function () {
		let exampleDocument;
		it('Should be able to create a document with a POST request', done => {
			Promisie.promisify(request.post, request)({
				url: 'http://localhost:3001/examples',
				form: Object.assign({}, person),
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})
				.then(() => Promisie.promisify(Example.findOne, Example)({ 'contact.first_name': 'Distinct' }))
				.try(result => {
					expect(result).to.be.ok;
					result = result.toObject();
					expect(result.contact.first_name).to.equal('Distinct');
					exampleDocument = result;
					done();
				})
				.catch(done);
		});
		it('Should be able to load a document with a GET request', done => {
			Promisie.promisify(request.get, request)({
				url: `http://localhost:3001/examples/${ exampleDocument._id }?format=json`
			})
				.try(result => {
					let body = JSON.parse(result.body);
					expect(body.result).to.equal('success');
					expect(body.data.contact.first_name).to.equal('Distinct');
					done();
				})
				.catch(done);
		});
		it('Should be able to update a document with a PUT request', done => {
			Promisie.promisify(request.put, request)({
				url: `http://localhost:3001/examples/${ exampleDocument._id }`,
				form: {
					updatedoc: { contact: { first_name: 'Distinctly' } },
					isPatch: true
				}
			})
				.then(() => Promisie.promisify(Example.findOne, Example)({ _id: exampleDocument._id }))
				.try(result => {
					expect(result).to.be.ok;
					result = result.toObject();
					expect(result.contact.first_name).to.equal('Distinctly');
					expect(result.contact.last_name).to.equal('Name');
					done();
				})
				.catch(done);
		});
		it('Should be able to multiple documents with a GET request', done => {
			Promisie.promisify(request.get, request)({
				url: 'http://localhost:3001/examples?format=json'
			})
				.try(result => {
					let body = JSON.parse(result.body);
					expect(body.result).to.equal('success');
					expect(body.data).to.have.property('examplescount');
					expect(body.data).to.have.property('examplelimit');
					expect(body.data).to.have.property('examplepages');
					expect(body.data).to.have.property('examplepage_current');
					expect(body.data).to.have.property('examples');
					expect(body.data).to.have.property('request');
					done();
				})
				.catch(done);
		});
		it('Should not append on request details if .skip_default_props option is true', done => {
			let result = Adapter.api.implement({
				router: express.Router(),
				model_name: 'example',
				skip_default_props: true
			});
			Adapter.express.use('/v1', result.router);
			Promisie.promisify(request.get, request)({
				url: 'http://localhost:3001/v1/examples?format=json'
			})
				.try(result => {
					let body = JSON.parse(result.body);
					expect(body.result).to.equal('success');
					expect(body.data).to.not.have.property('request');
					done();
				})
				.catch(done);
		});
		it('Should be able to load an index view', done => {
			let ejsTemplate = 'Title: <%- pagedata.title %>\r\nExample Count: <%- JSON.stringify(examples) %>';
			fs.ensureDirAsync(path.join(__dirname, '../example'))
				.then(fs.writeFileAsync.bind(fs, path.join(__dirname, '../example/index.ejs'), ejsTemplate))
				.then(() => {
					let result = Adapter.api.implement({
						router: express.Router(),
						model_name: 'example',
						dirname: [path.join(__dirname, '../')]
					});
					Adapter.express.use('/v2', result.router);
					return Promisie.promisify(request.get, request)({ url: 'http://localhost:3001/v2/examples' });
				})
				.try(result => {
					let body = result.body;
					expect(body).to.be.a('string');
					expect(/Title\:\sExamples/.test(body)).to.be.true;
					done();
				})
				.catch(done);
		});
		it('Should be able to remove a document with a DELETE request', done => {
			Promisie.promisify(request.delete, request)({
				url: `http://localhost:3001/examples/${ exampleDocument._id }`
			})
				.then(() => Promisie.promisify(Example.findOne, Example)({ _id: exampleDocument._id }))
				.try(result => {
					expect(result).to.not.be.ok;
					done();
				})
				.catch(done);
		});
	});
	describe('error handling methods', function () {
		it('Should have an error logger', () => {
			let original = console.error.bind(console)
			let spy = chai.spy(original);
			let testError = new Error('Test Error');
			console.error = spy;
			Adapter.error(null, null, { err: testError });
			expect(spy).to.have.been.called();
			expect(spy).to.have.been.called.with({ err: testError });
			console.error = original;
		});
		it('Should have a warn logger', () => {
			let original = console.warn.bind(console)
			let spy = chai.spy(original);
			let testError = new Error('Test Error');
			console.warn = spy;
			Adapter.warn(null, null, { err: testError });
			expect(spy).to.have.been.called();
			expect(spy).to.have.been.called.with({ err: testError });
			console.warn = original;
		});
		describe('exception handling', function () {
			it('Should respect custom exception messages', () => {
				Adapter.config = Object.assign(Adapter.config, { exception_message: 'Hello World' });
				let req = {};
				let res = {};
				let holder = {};
				res.status = function (code) {
					return this;
				}.bind(res);
				res.render = function (viewpath, data) {
					holder = arguments;
					return this;
				}.bind(res);
				Adapter.exception(req, res);
				expect(holder['1'].message).to.equal('Hello World');
			});
			it('Should use error message if error is provided and render view', () => {
				Adapter.config = Object.assign(Adapter.config, { exception_message: null });
				let req = {};
				let res = {};
				let holder = {};
				res.status = function (code) {
					return this;
				}.bind(res);
				let render = function (viewpath, data) {
					holder = arguments;
					return this;
				}.bind(res);
				let spy = chai.spy(render);
				res.render = spy;
				Adapter.exception(req, res, { err: new Error('Test Error') });
				expect(spy).to.have.been.called.with('home/error500');
				expect(holder).to.have.property('1');
				expect(holder['1'].message).to.equal('Test Error');
			});
			it('Should send JSON response if req.xhr is true', () => {
				let req = { xhr: true };
				let res = {};
				let holder = {};
				res.status = function (code) {
					return this;
				}.bind(res);
				let send = function (viewpath, data) {
					holder = arguments;
					return this;
				}.bind(res);
				let spy = chai.spy(send);
				res.send = spy;
				Adapter.exception(req, res);
				expect(spy).to.have.been.called();
				expect(holder).to.have.property('0');
				expect(holder['0'].data.error).to.equal('something blew up!');
			});
		});
	});
});
