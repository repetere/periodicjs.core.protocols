'use strict';
const path = require('path');
const API_ADAPTERS = require(path.join(__dirname, '../api_adapters/index'));

const HTTP_ADAPTER = class HTTP_Adapter {
	constructor (options = {}) {
		this.db = options.db;
		this.responder = options.responder;
		this.config = options.config || {};
		this.api = new API_ADAPTERS[options.api](this, options);
	}
	error (req, res, options = {}) {

	}
	warn (req, res, options = {}) {

	}
	respond (req, res, options = {}) {
		let { err, data } = options;
		if (err && !options.ignore_error) this.error(req, res, options);
		else {
			this.responder.render(data, options)
				.try(result => {
					if (req.query.callback) res.status(200).jsonp(result);
					else res.status(200).send(result);
				})
				.catch(err => {
					this.exception(req, res, Object.assign({}, options, { err }));
				});
		}
	}
	exception (req, res, options) {

	}
};

module.exports = HTTP_ADAPTER;
