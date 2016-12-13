'use strict';
const path = require('path');
const os = require('os');
const API_ADAPTERS = require(path.join(__dirname, '../api_adapters/index'));

/**
 * Appends a standard set of request data to an error response
 * @param  {Object} req  An express request object
 * @param  {Object} data Error data that should be included in response
 * @return {Object}      The original error data with request information added
 */
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

/**
 * Appends a standard set of request data to a success response
 * @param  {Object} req  An express request object
 * @param  {Object} data Data to be included in response
 * @return {Object}      The original data with request information added
 */
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

/**
 * A protocol adapter for HTTP requests and responses
 * @type {HTTP_Adapter}
 */
const HTTP_ADAPTER = class HTTP_Adapter {
	/**
	 * Constructor for HTTP_Adapter
	 * @param  {Object} options Options for the HTTP adapter
	 * @param {Object} options.db Database adapters indexed by model name (periodicjs.core.data)
	 * @param {Object} options.express Express module
	 * @param {Object} options.responder A response adapter (periodicjs.core.responder)
	 * @param {Object} options.config Periodic configuration object
	 * @param {Object} options.settings Periodic application settings
	 * @param {Object} options.resources Periodic resources
	 * @param {string} options.api Name of the api adapter that should be used
	 * @param {Object} [options.logger=console] A logger module
	 */
	constructor (options = {}) {
		this.db = options.db;
		this.express = options.express;
		this.responder = options.responder;
		this.config = options.config || {};
		this.settings = options.settings || {};
		this.resources = options.resources || {};
		this.api = new API_ADAPTERS[options.api](this, options);
		this.logger = options.logger || console;
	}
	/**
	 * Handles logging errors
	 * @param  {Object} req     Express request object
	 * @param  {Object} res     Express response object
	 * @param  {Object} [options={}] Configurable options for error logging
	 * @param {Object} options.err An error to log
	 * @return {Object}         this
	 */
	error (req, res, options = {}) {
		let err = options.err;
		let data = (err) ? { err } : {};
		if (req) data = generateErrorDetails.call(this, req, data);
		this.logger.error((err instanceof Error || err.message) ? err.message : 'ERROR\r\n', (err instanceof Error || err.stack) ? err.stack : {}, data);
		return this;
	}
	/**
	 * Handles logging warns
	 * @param  {Object} req     Express request object
	 * @param  {Object} res     Express response object
	 * @param  {Object} [options={}] Configurable options for warning logging
	 * @param {Object} options.err An error to log
	 * @return {Object}         this
	 */
	warn (req, res, options = {}) {
		let err = options.err;
		let data = (err) ? { err } : {};
		if (req) data = generateErrorDetails.call(this, req, data);
		this.logger.warn((err instanceof Error || err.message) ? err.message : 'WARNING\r\n', (err instanceof Error || err.stack) ? err.stack : {}, data);
		return this;
	}
	/**
	 * Handles sending an error response
	 * @param  {Object} req     Express request object
	 * @param  {Object} res     Express response object
	 * @param  {Object} [options={}] Configurable options for error logging
	 * @param {Object} options.err An error to log. If this.config.exception_message is set error param is ignored
	 * @return {Object}         this
	 */
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
		return this;
	}
	/**
	 * Handles sending the response to a request by rendering data according to this.responder configuration
	 * @param  {Object} req     Express request object
	 * @param  {Object} res     Express response object
	 * @param  {Object} [options={}] Configurable options for response
	 * @param {Boolean} options.ignore_error If true error will be treated like a normal response
	 * @param {*} options.responder_override Data to send in response. If this value is defined A success response will always be set and all formatting rules will be ignored
	 * @param {Boolean} options.skip_default_props If true request details will not be appended to success response
	 * @param {Object} options.err An error to send in response. If this value is set an error response will be generated unless options.ignore_error is true
	 * @param {Object} options.data Data to send in success response. If options.err is defined this value will be ignored
	 * @return {Object}         this
	 */
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
		return this;
	}
	/**
	 * Handles redirects
	 * @param  {Object} req     Express request object
	 * @param  {Object} res     Express response object
	 * @param  {Object} [options={}] Configurable options for redirect
	 * @param {string} options.model_name A path to attempt for redirect if req.redirect is not provided
	 * @return {Object}         this
	 */
	redirect (req, res, options = {}) {
		res.redirect(req.redirectpath || `/${ options.model_name }`);
		return this;
	}
	/**
	 * Convenience method for accessing .implement method on API adapter. Also handles implementing controllers and routers for multiple models
	 * @param  {Object} options Configurable options for implementing controllers and routers. See API adapter .implement method for more details
	 * @param {string|string[]} options.model_name An array of model names or a single model name that should have controllers and routes implemented
	 * @return {Object}         this
	 */
	implement (options = {}) {
		let router = this.router;
		this.controller = (this.controller && typeof this.controller === 'object') ? this.controller : {};
		if (typeof options.model_name === 'string') {
			let implemented = this.api.implement(Object.assign(options, { router }));
			this.router = (implemented.router && implemented.router._router) ? implemented.router._router : implemented.router;
			router = this.router;
			delete implemented.router;
			this.controller[options.model_name] = implemented;
		}
		else {
			Object.keys(this.db).forEach(key => {
				let implemented = this.api.implement(Object.assign(options, { router, model_name: key }));
				this.router = (implemented.router && implemented.router._router) ? implemented.router._router : implemented.router;
				router = this.router;
				delete implemented.router;
				this.controller[key] = implemented;
			});
		}
		return this;
	}
};

module.exports = HTTP_ADAPTER;
