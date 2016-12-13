'use strict';
const path = require('path');
const moment = require('moment');
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const ResponderAdapterInterface = require('periodicjs.core.responder');
const DBAdapterInterface = require('periodicjs.core.data');
const mongoose = require('mongoose');
const ExampleSchema = require(path.join(__dirname, '../example/mongoose_model'));
const chai = require('chai');
const expect = chai.expect;
const UTILITY = require(path.join(__dirname, '../../utility/index'));
const API_UTILITY = UTILITY.api;

var Example;
var connectDB = function () {
	return new Promisie((resolve, reject) => {
		mongoose.connect('mongodb://localhost/test_core_protocols');
		let db = mongoose.connection;
		db.on('error', reject)
			.once('open', resolve);
	});
};

describe('API Utilities', function () {
	describe('setViewModelProperties', function () {
		let model_name = 'customer';
		let inflectTime;
		beforeEach(API_UTILITY.setViewModelProperties.bind(null, { model_name }));
		it('Should be able to return a set of inflected model name values', () => {
			let start = moment();
			let inflected;
			for (let i = 0; i < 10000; i++) {
				let value = (i % 2 === 0) ? 'application' : 'customer';
				inflected = API_UTILITY.setViewModelProperties({ model_name: value });
			}
			let end = moment();
			inflectTime = end.diff(start, 'milliseconds') / 10000;
			expect(inflected).to.have.property('name');
			expect(inflected).to.have.property('name_plural');
			expect(inflected).to.have.property('capital_name');
			expect(inflected).to.have.property('page_plural_title');
			expect(inflected).to.have.property('page_plural_count');
			expect(inflected).to.have.property('page_plural_query');
			expect(inflected).to.have.property('page_single_count');
			expect(inflected).to.have.property('page_pages');
		});
		it('Should be able to return pre-set inflected values if model name has not changed', () => {
			let start = moment();
			let inflected;
			for (let i = 0; i < 10000; i++) inflected = API_UTILITY.setViewModelProperties({ model_name: 'customer' });
			let end = moment();
			expect(end.diff(start, 'milliseconds') / 10000).to.be.below(inflectTime);
		});
	});
	describe('Render View', function () {
		describe('API_Adapter NEW utility method', function () {
			let responder;
			let protocol;
			let templatePath;
			describe('non-html adapter', () => {
				before(done => {
					responder = ResponderAdapterInterface.create({ adapter: 'json' });
					protocol = function () {
						return {
							responder,
							respond: (req, res, options) => {
								if (options.responder_override) return Promisie.resolve(options.responder_override);
								return responder.render(options.data, options);
							}
						};
					};
					let text = 'Page Title: <%- pagedata.title %>';
					fs.ensureDirAsync(path.join(__dirname, '../example'))
						.then(fs.writeFileAsync.bind(fs, path.join(__dirname, '../example/new.ejs'), text))
						.then(() => {
							templatePath = path.join(__dirname, '../example/new.ejs');
							done();
						}, done);
				});
				it('Should return a function that renders a "new" view', done => {
					let respondNew = API_UTILITY.NEW({ protocol: protocol(), model_name: path.dirname(templatePath) });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({})
						.try(result => {
							expect(result).to.be.a('string');
							expect(/example/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
				it('Should render json data if options.strict is true', done => {
					let respondNew = API_UTILITY.NEW({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({})
						.try(result => {
							expect(result).to.be.an('object');
							expect(result).to.have.property('result');
							expect(result).to.have.property('status');
							expect(result).to.have.property('data');
							expect(result.data).to.not.have.property('responder_override');
							done();
						})
						.catch(done);
				});
				it('Should pass options down to the responder', () => {
					let respondNew = API_UTILITY.NEW({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true, sync: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					let result = respondNew({});
					expect(result).to.be.an('object');
					expect(result).to.have.property('result');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.not.have.property('responder_override');
				});
			});
			describe('custom html adapter', () => {
				after(done => {
					if (templatePath) {
						fs.removeAsync(templatePath)
							.then(() => {
								done();
							}, done);
					}
					else done();
				});
				it('Should respect custom HTML adapter', done => {
					let responder = ResponderAdapterInterface.create({
						adapter: 'html',
						extname: '.ejs',
						viewname: templatePath
					});
					let respondNew = API_UTILITY.NEW({
						model_name: path.dirname(templatePath),
						protocol: {
							responder,
							respond: (req, res, options) => {
								return responder.render(options.data, options);
							}
						}
					});
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({})
						.try(result => {
							expect(result).to.be.a('string');
							expect(/example/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
			});
		});
		describe('API_Adapter SHOW utility method', function () {
			let responder;
			let protocol;
			let templatePath;
			let controllerData;
			describe('non-html adapter', () => {
				before(done => {
					responder = ResponderAdapterInterface.create({ adapter: 'json' });
					protocol = function () {
						return {
							responder,
							respond: (req, res, options) => {
								if (options.responder_override) return Promisie.resolve(options.responder_override);
								return responder.render(options.data, options);
							}
						};
					};
					let text = 'Page Title: <%- pagedata.title %>';
					fs.ensureDirAsync(path.join(__dirname, '../example'))
						.then(fs.writeFileAsync.bind(fs, path.join(__dirname, '../example/show.ejs'), text))
						.then(() => {
							templatePath = path.join(__dirname, '../example/show.ejs');
							controllerData = { 
								[path.dirname(templatePath)]: {
									title: 'SHOW'
								}
							};
							done();
						}, done);
				});
				it('Should return a function that renders a "show" view', done => {
					let respondNew = API_UTILITY.SHOW({ protocol: protocol(), model_name: path.dirname(templatePath) });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/SHOW/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
				it('Should render json data if options.strict is true', done => {
					let respondNew = API_UTILITY.SHOW({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData })
						.try(result => {
							expect(result).to.be.an('object');
							expect(result).to.have.property('result');
							expect(result).to.have.property('status');
							expect(result).to.have.property('data');
							expect(result.data).to.not.have.property('responder_override');
							done();
						})
						.catch(done);
				});
				it('Should pass options down to the responder', () => {
					let respondNew = API_UTILITY.SHOW({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true, sync: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					let result = respondNew({ controllerData });
					expect(result).to.be.an('object');
					expect(result).to.have.property('result');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.not.have.property('responder_override');
				});
			});
			describe('custom html adapter', () => {
				after(done => {
					if (templatePath) {
						fs.removeAsync(templatePath)
							.then(() => {
								done();
							}, done);
					}
					else done();
				});
				it('Should respect custom HTML adapter', done => {
					let responder = ResponderAdapterInterface.create({
						adapter: 'html',
						extname: '.ejs',
						viewname: templatePath
					});
					let respondNew = API_UTILITY.SHOW({
						model_name: path.dirname(templatePath),
						protocol: {
							responder,
							respond: (req, res, options) => {
								return responder.render(options.data, options);
							}
						}
					});
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/SHOW/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
			});
		});
		describe('API_Adapter EDIT utility method', function () {
			let responder;
			let protocol;
			let templatePath;
			let controllerData;
			describe('non-html adapter', () => {
				before(done => {
					responder = ResponderAdapterInterface.create({ adapter: 'json' });
					protocol = function () {
						return {
							responder,
							respond: (req, res, options) => {
								if (options.responder_override) return Promisie.resolve(options.responder_override);
								return responder.render(options.data, options);
							}
						};
					};
					let text = 'Page Title: <%- pagedata.title %>';
					fs.ensureDirAsync(path.join(__dirname, '../example'))
						.then(fs.writeFileAsync.bind(fs, path.join(__dirname, '../example/edit.ejs'), text))
						.then(() => {
							templatePath = path.join(__dirname, '../example/edit.ejs');
							controllerData = { 
								[path.dirname(templatePath)]: {
									title: 'EDIT'
								}
							};
							done();
						}, done);
				});
				it('Should return a function that renders a "edit" view', done => {
					let respondNew = API_UTILITY.EDIT({ protocol: protocol(), model_name: path.dirname(templatePath) });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/EDIT/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
				it('Should render json data if options.strict is true', done => {
					let respondNew = API_UTILITY.EDIT({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData })
						.try(result => {
							expect(result).to.be.an('object');
							expect(result).to.have.property('result');
							expect(result).to.have.property('status');
							expect(result).to.have.property('data');
							expect(result.data).to.not.have.property('responder_override');
							done();
						})
						.catch(done);
				});
				it('Should pass options down to the responder', () => {
					let respondNew = API_UTILITY.EDIT({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true, sync: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					let result = respondNew({ controllerData });
					expect(result).to.be.an('object');
					expect(result).to.have.property('result');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.not.have.property('responder_override');
				});
			});
			describe('custom html adapter', () => {
				after(done => {
					if (templatePath) {
						fs.removeAsync(templatePath)
							.then(() => {
								done();
							}, done);
					}
					else done();
				});
				it('Should respect custom HTML adapter', done => {
					let responder = ResponderAdapterInterface.create({
						adapter: 'html',
						extname: '.ejs',
						viewname: templatePath
					});
					let respondNew = API_UTILITY.EDIT({
						model_name: path.dirname(templatePath),
						protocol: {
							responder,
							respond: (req, res, options) => {
								return responder.render(options.data, options);
							}
						}
					});
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/EDIT/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
			});
		});
		describe('API_Adapter INDEX utility method', function () {
			let responder;
			let protocol;
			let templatePath;
			let controllerData;
			describe('non-html adapter', () => {
				before(done => {
					responder = ResponderAdapterInterface.create({ adapter: 'json' });
					protocol = function () {
						return {
							responder,
							respond: (req, res, options) => {
								if (options.responder_override) return Promisie.resolve(options.responder_override);
								return responder.render(options.data, options);
							}
						};
					};
					let text = 'Page Title: <%- pagedata.title %>';
					fs.ensureDirAsync(path.join(__dirname, '../example'))
						.then(fs.writeFileAsync.bind(fs, path.join(__dirname, '../example/index.ejs'), text))
						.then(() => {
							templatePath = path.join(__dirname, '../example/index.ejs');
							controllerData = { 
								[path.dirname(templatePath) + 's']: 'INDEX',
								[path.dirname(templatePath) + 'scount']: 10
							};
							done();
						}, done);
				});
				it('Should return a function that renders a "index" view', done => {
					let respondNew = API_UTILITY.INDEX({ protocol: protocol(), model_name: path.dirname(templatePath) });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData, query: {} })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/examples/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
				it('Should render json data if options.strict is true', done => {
					let respondNew = API_UTILITY.INDEX({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData, query: {} })
						.try(result => {
							expect(result).to.be.an('object');
							expect(result).to.have.property('result');
							expect(result).to.have.property('status');
							expect(result).to.have.property('data');
							expect(result.data).to.not.have.property('responder_override');
							done();
						})
						.catch(done);
				});
				it('Should pass options down to the responder', () => {
					let respondNew = API_UTILITY.INDEX({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true, sync: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					let result = respondNew({ controllerData, query: {} });
					expect(result).to.be.an('object');
					expect(result).to.have.property('result');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.not.have.property('responder_override');
				});
			});
			describe('custom html adapter', () => {
				after(done => {
					if (templatePath) {
						fs.removeAsync(templatePath)
							.then(() => {
								done();
							}, done);
					}
					else done();
				});
				it('Should respect custom HTML adapter', done => {
					let responder = ResponderAdapterInterface.create({
						adapter: 'html',
						extname: '.ejs',
						viewname: templatePath
					});
					let respondNew = API_UTILITY.INDEX({
						model_name: path.dirname(templatePath),
						protocol: {
							responder,
							respond: (req, res, options) => {
								return responder.render(options.data, options);
							}
						}
					});
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData, query: {} })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/examples/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
			});
		});
		describe('API_Adapter SEARCH utility method', function () {
			let responder;
			let protocol;
			let templatePath;
			let controllerData;
			describe('non-html adapter', () => {
				before(done => {
					responder = ResponderAdapterInterface.create({ adapter: 'json' });
					protocol = function () {
						return {
							responder,
							respond: (req, res, options) => {
								if (options.responder_override) return Promisie.resolve(options.responder_override);
								return responder.render(options.data, options);
							}
						};
					};
					let text = 'Page Title: <%- pagedata.title %>';
					fs.ensureDirAsync(path.join(__dirname, '../example'))
						.then(fs.writeFileAsync.bind(fs, path.join(__dirname, '../example/search.ejs'), text))
						.then(() => {
							templatePath = path.join(__dirname, '../example/search.ejs');
							controllerData = { 
								[path.dirname(templatePath) + 's']: 'INDEX',
								[path.dirname(templatePath) + 'scount']: 10
							};
							done();
						}, done);
				});
				it('Should return a function that renders a "search" view', done => {
					let respondNew = API_UTILITY.SEARCH({ protocol: protocol(), model_name: path.dirname(templatePath) });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData, query: {} })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/search\s+results/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
				it('Should render json data if options.strict is true', done => {
					let respondNew = API_UTILITY.SEARCH({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData, query: {} })
						.try(result => {
							expect(result).to.be.an('object');
							expect(result).to.have.property('result');
							expect(result).to.have.property('status');
							expect(result).to.have.property('data');
							expect(result.data).to.not.have.property('responder_override');
							done();
						})
						.catch(done);
				});
				it('Should pass options down to the responder', () => {
					let respondNew = API_UTILITY.SEARCH({ protocol: protocol(), model_name: path.dirname(templatePath), strict: true, sync: true });
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					let result = respondNew({ controllerData, query: {} });
					expect(result).to.be.an('object');
					expect(result).to.have.property('result');
					expect(result).to.have.property('status');
					expect(result).to.have.property('data');
					expect(result.data).to.not.have.property('responder_override');
				});
			});
			describe('custom html adapter', () => {
				after(done => {
					if (templatePath) {
						fs.removeAsync(templatePath)
							.then(() => {
								done();
							}, done);
					}
					else done();
				});
				it('Should respect custom HTML adapter', done => {
					let responder = ResponderAdapterInterface.create({
						adapter: 'html',
						extname: '.ejs',
						viewname: templatePath
					});
					let respondNew = API_UTILITY.SEARCH({
						model_name: path.dirname(templatePath),
						protocol: {
							responder,
							respond: (req, res, options) => {
								return responder.render(options.data, options);
							}
						}
					});
					expect(respondNew).to.be.a('function');
					expect(respondNew.length).to.equal(2);
					respondNew({ controllerData, query: {} })
						.try(result => {
							expect(result).to.be.a('string');
							expect(/search\s+results/.test(result)).to.be.true;
							done();
						})
						.catch(done);
				});
			});
		});
	});
	describe('Deliver Data', function () {
		let originalrevision;
		let db;
		let responder;
		let protocol;
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
						}
					};
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
		describe('API_Adapter CREATE utility method', function () {
			it('Should be able to create documents and return a redirect path', done => {
				let createDocument = API_UTILITY.CREATE({ protocol, model_name: 'example' });
				expect(createDocument).to.be.a('function');
				expect(createDocument.length).to.equal(2);
				createDocument({ body: person })
					.try(result => {
						expect(result).to.be.an('object');
						expect(result).to.have.property('model_name');
						expect(result.model_name).to.equal('p-admin/content/example/')
						done();
					})
					.catch(done);
			});
			it('Should handle an error', done => {
				let createDocument = API_UTILITY.CREATE({ protocol, model_name: 'example' });
				expect(createDocument).to.be.a('function');
				expect(createDocument.length).to.equal(2);
				createDocument()
					.then(result => {
						done(new Error('Should not execute'));
					}, err => {
						expect(err).to.be.ok;
						done();
					});
			});
		});
		describe('API_Adapter PAGINATE utility method', function () {
			before(done => {
				let createDocument = API_UTILITY.CREATE({ protocol, model_name: 'example' });
				let times = 0;
				Promisie.doWhilst(() => {
					let body = {
						contact: Object.assign({}, person.contact)
					};
					let yearModifier = Math.ceil(Math.random() * 20);
					body.contact.dob = moment(body.contact.dob).subtract(yearModifier, 'years').format();
					return createDocument({ body })
						.then(() => {
							return times++;
						}, e => Promise.reject(e));
				}, t => t < 5)
					.then(() => done())
					.catch(done);
			});
			it('Should be able to retrieve paginated data with pre-set options', done => {
				let paginate = API_UTILITY.PAGINATE({ protocol, model_name: 'example', fields: {contact: 0 }, query: {} });
				let query = {
					pagelength: 2,
					limit: 5
				};
				paginate({ query })
					.try(result => {
						expect(result).to.have.property('data');
						expect(result.data).to.have.property('examples');
						expect(Object.keys(result.data.examples)).to.deep.equal(['0','1','2']);
						expect(result.data.examplescount).to.equal(5);
						expect(result.data.examplepage_current.documents[0].toObject().contact).to.not.be.ok;
						done();
					})
					.catch(done);
			});
			it('Should be able to retrieve paginated data with dynamic data from request', done => {
				let paginate = API_UTILITY.PAGINATE({ protocol, model_name: 'example', fields: { _id: 1, createdat: 1 }, query: { 'contact.first_name': 'Hello' } });
				let query = {
					pagelength: 2,
					pagenum: 1,
					limit: 6
				};
				paginate({ query, controllerData: { model_fields: { contact: 1 } } })
					.try(result => {
						expect(result).to.have.property('data');
						expect(result.data).to.have.property('examples');
						expect(Object.keys(result.data.examples)).to.deep.equal(['0','1','2']);
						expect(result.data.examplepage_next).to.be.ok;
						expect(result.data.examplepage_prev).to.be.ok;
						expect(result.data.examplepage_current.documents[0].toObject()).to.have.property('contact');
						done();
					})
					.catch(done);
			});
			it('Should be handle an error', done => {
				let paginate = API_UTILITY.PAGINATE({ protocol, model_name: 'example', fields: { _id: 1, createdat: 1, contact: 0 }, query: { 'contact.first_name': 'Hello' } });
				paginate({})
					.then(() => {
						done(new Error('Should not execute'));
					}, e => {
						expect(e instanceof Error).to.be.true;
						done();
					});
			});
		});
		describe('API_Adapter LOAD utility method', function () {
			let exampleDocument;
			before(done => {
				Example.find({})
					.limit(1)
					.exec((err, doc) => {
						if (err) done(err);
						else {
							exampleDocument = doc[0].toObject();
							done();
						}
					});
			});
			after(done => {
				originalrevision = exampleDocument;
				done();
			});
			it('Should be able to query for a document given an id', done => {
				let loadDocument = API_UTILITY.LOAD({ protocol, model_name: 'example' });
				let params = { id: exampleDocument._id.toString() };
				let req = { params, query: {} };
				loadDocument(req, {}, () => {
					expect(req.controllerData).to.have.property('example');
					expect(req.controllerData.example._id.toString()).to.equal(exampleDocument._id.toString());
					done();
				});
			});
			it('Should be able to query for a document given a docid', done => {
				let loadDocument = API_UTILITY.LOAD({ protocol, model_name: 'example', docid: 'contact.first_name' });
				let params = { id: 'Hello' };
				let req = { params, query: {} };
				loadDocument(req, {}, () => {
					expect(req.controllerData).to.have.property('example');
					expect(req.controllerData.example.toObject().contact.first_name).to.equal('Hello');
					done();
				});
			});
			it('Should handle an error', done => {
				let loadDocument = API_UTILITY.LOAD({ protocol, model_name: 'example' });
				let params = { id: 'Hello' };
				let req = { params };
				loadDocument(req, {}, (err) => {
					expect(err instanceof Error).to.be.true;
					done();
				});
			});
		});
		
	});
});