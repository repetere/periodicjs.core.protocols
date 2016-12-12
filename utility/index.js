'use strict';
const path = require('path');
const API_UTILITIES = require(path.join(__dirname, './api_utilities'));
const GET_EXPANDED_NAMES = require(path.join(__dirname, './expand_names'));

module.exports = { 
	api: API_UTILITIES,
	expand_names: GET_EXPANDED_NAMES
};