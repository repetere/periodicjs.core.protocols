'use strict';
const path = require('path');
const os = require('os');
const API_ADAPTERS = require(path.join(__dirname, '../api_adapters/index'));

var generateErrorDetails = function (req, data = {}) {
	data.ipinfo = {
		'x-forwarded-for': req.headers['x-forwarded-for'],
		remoteAddress: req.connection.remoteAddress,
		referer: req.headers.referer,
		originalUrl: req.originalUrl,
		headerHost: req.headers.host,
		osHostname: os.hostname()
	};
	let user = req.user || req.body;
	if (user && (user.email || user.username)) data.ipinfo.user = user.email || user.username;
	return data;
};

var _generateSuccessDetails = function (req, data = {}) {
	data.periodic = data.periodic || {};
	data.periodic = {
		version: this.settings.version,
		name: this.settings.name
	};
	return Object.assign(data, {
		request: {
			query: req.query,
			params: req.params,
			baseurl: req.baseUrl,
			originalurl: req.originalUrl,
			parsed: req._parsedUrl,
			'x-forwarded-for': req.headers['x-forwarded-for'],
			remoteAddress: req.connection.remoteAddress,
			referer: req.headers.referer,
			headerHost: req.headers.host
		}
	});
};

const HTTP_ADAPTER = class HTTP_Adapter {
	constructor (options = {}) {
		this.db = options.db;
		this.express = options.express;
		this.responder = options.responder;
		this.config = options.config || {};
		this.settings = options.settings || {};
		this.api = new API_ADAPTERS[options.api](this, options);
		this.logger = options.logger;
	}
	error (req, res, options = {}) {
		let err = options.err;
		let data = (err) ? { err } : {};
		if (req) data = generateErrorDetails.call(this, req, data);
		logger.error((err instanceof Error || err.message) ? err.message : 'ERROR\r\n', (err instanceof Error || err.stack) ? err.stack : {}, data);
	}
	warn (req, res, options = {}) {
		let err = options.err;
		let data = (err) ? { err } : {};
		if (req) data = generateErrorDetails.call(this, req, data);
		logger.warn((err instanceof Error || err.message) ? err.message : 'WARNING\r\n', (err instanceof Error || err.stack) ? err.stack : {}, data);
	}
	exception (req, res, options = {}) {
		let err = (typeof this.config.exception_message === 'string') ? { message: this.config.exception_message } : options.err;
		if (req.xhr) {
			res.status(500).send({
				result: 'error',
				data: {
					error: (err) ? err.message : 'something blew up!'
				}
			});
		}
		else {
			res.status(500).render('home/error500', {
				message: err.message,
				error: err
			});
		}
	}
	respond (req, res, options = {}) {
		let { err, data } = options;
		if (err && !options.ignore_error) this.error(req, res, options);
		let responder = (err) ? this.responder.error.bind(this.responder) : this.responder.render.bind(this.responder);
		let responder_override = (options.responder_override) ? options.responder_override : false;
		if (responder_override) {
			if (req.query.callback) res.status(200).jsonp(responder_override);
			else res.status(200).send(responder_override);
		}
		else {
			responder((err) ? err : ((options.skip_default_props) ? _generateSuccessDetails.call(this, req, data) : data), options)
				.try(result => {
					if (req.query.callback) res.status((err) ? 500 : 200).jsonp(result);
					else res.status((err) ? 500 : 200).send(result);
				})
				.catch(err => {
					this.exception(req, res, Object.assign({}, options, { err }));
				});
		}
	}
	redirect (req, res, options = {}) {
		res.redirect(req.redirectpath || `/${ options.model_name }`);
	}
};

module.exports = HTTP_ADAPTER;
