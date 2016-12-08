'use strict';
const Promisie = require('promisie');
const path = require('path');
const API_UTILITIES = require(path.join(__dirname, '../utility/index')).api;

const _NEW = function (options = {}) {
	return API_UTILITIES.NEW(Object.assign({}, this, options));
};

const REST_ADAPTER = class REST_Adapter {
	constructor (protocol_adapter, options = {}) {
		this.express = options.express;
		this.config = options.config;

	}
	routing (options = {}) {

	}
	implement (options = {}) {

	}

};

module.exports = REST_ADAPTER;