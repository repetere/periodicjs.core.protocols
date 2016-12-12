'use strict';
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const UTILITY = require(path.join(__dirname, '../../utility/index'));

describe('getViewModelProperties', function () {
	it('Should return an object containing inflected versions of model name', function () {
		let inflected = UTILITY.expand_names({ model_name: 'customer' });
		expect(inflected).to.be.an('object');
		expect(inflected).to.have.property('name');
		expect(inflected).to.have.property('name_plural');
		expect(inflected).to.have.property('capital_name');
		expect(inflected).to.have.property('page_plural_title');
		expect(inflected).to.have.property('page_plural_count');
		expect(inflected).to.have.property('page_plural_query');
		expect(inflected).to.have.property('page_single_count');
		expect(inflected).to.have.property('page_pages');
		expect(inflected.name_plural).to.equal('customers');
		expect(inflected.capital_name).to.equal('Customer');
		expect(inflected.page_plural_title).to.equal('Customers');
	});
});