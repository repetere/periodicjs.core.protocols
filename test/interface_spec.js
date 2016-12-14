'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const AdapterInterface = require(path.join(__dirname, '../index'));
const HTTPAdapter = require(path.join(__dirname, '../adapters/http'));

describe('Protocol Adapter Interface', function () {
	describe('basic assumptions and methods', function () {
		it('Should be an object with specified required properties and types', () => {
			let interfaceFields = ['error','warn','respond','exception','redirect'];
			interfaceFields.forEach(field => {
				expect(AdapterInterface.interface[field]).to.equal('function');
			});
		});
		it('Should have a create method', () => {
			expect(AdapterInterface.create).to.be.a('function');
		});
	});
	describe('generating a pre-loaded adapter by adapter name', function () {
		it('Should throw an error if adapter name does not exist in list', done => {
			try {
				let adapter = AdapterInterface.create({ adapter: 'some-non-existant-adapter' });
				done(new Error('Should not evaluate this line'));
			}
			catch (e) {
				expect(e instanceof Error).to.be.true;
				done();
			}
		});
		it('Should return a constructed adapter given a valid adapter name and api type', () => {
			let adapter = AdapterInterface.create({ adapter: 'http', api: 'rest' });
			expect(adapter instanceof HTTPAdapter).to.be.true;
		});
		it('Should return a constructed adapter if only .protocol is defined and api type is provided', () => {
			let adapter = AdapterInterface.create({ protocol: 'http', api: 'rest' });
			expect(adapter instanceof HTTPAdapter).to.be.true;
		});
	});
	describe('generating an adapter from a provided constructor', function () {
		it('Should throw an error if custom adapter class is missing required methods', done => {
			try {
				let Invalid_Adapter = class Invalid_Adapter {
					constructor () {
						this.method = false;
					}
				};
				let adapter = AdapterInterface.create({ adapter: Invalid_Adapter });
			}
			catch (e) {
				expect(e instanceof Error).to.be.true;
				done();
			}
		});
		it('Should return a constructed adapter given a valid custom class', () => {
			let Valid_Adapter = class Valid_Adapter {
				constructor () {
					this.error = () => true;
					this.warn = () => true;
					this.respond = () => true;
					this.exception = () => true;
					this.redirect = () => true;
				}
			};
			let adapter = AdapterInterface.create({ adapter: Valid_Adapter });
			expect(adapter instanceof Valid_Adapter).to.be.true;
		});
	});
});