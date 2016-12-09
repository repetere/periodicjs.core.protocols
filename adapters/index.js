'use strict';
const HTTP = require('./http');
const SOCKET = require('./websocket');
const STREAM = require('./stream');

module.exports = {
	http: HTTP,
	websocket: SOCKET,
	stream: STREAM
};