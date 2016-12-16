'use strict';
const path = require('path');
const API_UTILITIES = require(path.join(__dirname, './api_utilities'));
const GET_EXPANDED_NAMES = require(path.join(__dirname, './expand_names'));
const CONTROLLER_INITIALIZERS = require(path.join(__dirname, './controller_initializers'));

module.exports = { 
	api: API_UTILITIES,
	expand_names: GET_EXPANDED_NAMES,
	controller_initializers: CONTROLLER_INITIALIZERS 
};