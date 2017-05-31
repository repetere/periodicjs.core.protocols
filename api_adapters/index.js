'use strict';
const JSONRPC = require('./jsonrpc');
const REST = require('./rest');
const XML = require('./xml');

module.exports = {
  jsonrpc: JSONRPC,
  rest: REST,
  xml: XML,
};