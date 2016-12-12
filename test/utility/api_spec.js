'use strict';
const path = require('path');
const moment = require('moment');
const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const ResponderAdapterInterface = require('periodicjs.core.responder');
const chai = require('chai');
const expect = chai.expect;
const UTILITY = require(path.join(__dirname, '../../utility/index'));
const API_UTILITY = UTILITY.api;

describe('API Utilities', function () {
	describe('setViewModelProperties', function () {
		let model_name = 'customer';
		let inflectTime;
		beforeEach(API_UTILITY.setViewModelProperties.bind(null, { model_name }));
		it('Should be able to return a set of inflected model name values', () => {
			let start = moment();
			let inflected;
			for (let i = 0; i < 1000; i++) {
				let value = (i % 2 === 0) ? 'application' : 'customer';
				inflected = API_UTILITY.setViewModelProperties({ model_name: value });
			}
			let end = moment();
			inflectTime = end.diff(start, 'milliseconds') / 1000;
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
			for (let i = 0; i < 1000; i++) inflected = API_UTILITY.setViewModelProperties({ model_name: 'customer' });
			let end = moment();
			expect(end.diff(start, 'milliseconds') / 1000).to.be.below(inflectTime);
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
		let db;
		let responder;
		before(done => {

		});
		after(done => {

		});
		describe('API_Adapter REMOVE utility method', function () {

		});
	});
});