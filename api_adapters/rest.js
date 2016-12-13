'use strict';
const path = require('path');
const UTILITY = require(path.join(__dirname, '../utility/index'));
const API_UTILITIES = UTILITY.api;

/**
 * Generates a set of controller functions indexed by a standard set of properties
 * @param  {Object} options Configurable options for the creation of model specific middleware
 * @param {Object} [options.override] A set of middleware functions that will be used in place of defaults
 * @param {Function} [options.override.new] Override function for standard "new" view rendering function
 * @param {Function} [options.override.show] Override function for standard "show" view rendering function
 * @param {Function} [options.override.edit] Override function for standard "edit" view rendering function
 * @param {Function} [options.override.index] Override function for standard "index" view rendering function
 * @param {Function} [options.override.remove] Override function for standard "remove" middleware
 * @param {Function} [options.override.search] Override function for standard "search" view rendering function
 * @param {Function} [options.override.create] Override function for standard "create" middleware
 * @param {Function} [options.override.update] Override function for standard "update" middleware
 * @param {Function} [options.override.load] Override function for standard "load" middleware
 * @param {Function} [options.override.paginate] Override function for standard "paginate" middleware
 * @param {Object} [options.router] An express router that routes will be appended on. If no router is provided routes will not be registered and only controller functions are returned
 * @return {Object}         A set of controller functions a express router if options.router was provided
 */
const _IMPLEMENT = function (options) {
	let useOverride = (options.override && typeof options.override === 'object');
	let middleware = {
		new: (useOverride && typeof options.override.new === 'function') ? options.override.new : API_UTILITIES.NEW(Object.assign({}, this, options)),
		show: (useOverride && typeof options.override.show === 'function') ? options.override.show : API_UTILITIES.SHOW(Object.assign({}, this, options)),
		edit: (useOverride && typeof options.override.edit === 'function') ? options.override.edit : API_UTILITIES.EDIT(Object.assign({}, this, options)),
		index: (useOverride && typeof options.override.index === 'function') ? options.override.index : API_UTILITIES.INDEX(Object.assign({}, this, options)),
		remove: (useOverride && typeof options.override.remove === 'function') ? options.override.remove : API_UTILITIES.REMOVE(Object.assign({}, this, options)),
		search: (useOverride && typeof options.override.search === 'function') ? options.override.search : API_UTILITIES.SEARCH(Object.assign({}, this, options)),
		create: (useOverride && typeof options.override.create === 'function') ? options.override.create : API_UTILITIES.CREATE(Object.assign({}, this, options)),
		update: (useOverride && typeof options.override.update === 'function') ? options.override.update : API_UTILITIES.UPDATE(Object.assign({}, this, options)),
		load: (useOverride && typeof options.override.load === 'function') ? options.override.load : API_UTILITIES.LOAD(Object.assign({}, this, options)),
		load_with_count: API_UTILITIES.LOAD_WITH_COUNT(Object.assign({}, this, options)),
		load_with_limit: API_UTILITIES.LOAD_WITH_LIMIT(Object.assign({}, this, options)),
		paginate: (useOverride && typeof options.override.paginate === 'function') ? options.override.paginate : API_UTILITIES.PAGINATE(Object.assign({}, this, options))
	};
	if (options.router) middleware.router = this.routing(Object.assign({}, options, { middleware }));
	return middleware;
};

/**
 * An API adapter for RESTful API's. REST_Adapter handles standing up a standard set of RESTful routes and middleware
 * @type {REST_Adapter}
 */
const REST_ADAPTER = class REST_Adapter {
	/**
	 * Constructor for REST_Adapter
	 * @param  {Object} protocol_adapter A protocol adapters that exposes database adapters, response adapters, and an express server
	 */
	constructor (protocol_adapter) {
		this.protocol = protocol_adapter;
	}
	/**
	 * Appends RESTful routes to an express router
	 * @param  {Object} options Configurable options for routing
	 * @param {Object} options.router An express router. If this value is not defined a new express router will be created
	 * @param {Object} options.middleware Middleware functions that are used in generating routes
	 * @param {Object} options.override Full route overrides
	 * @param {Function[]} options.override.create_index An array of middleware to use in place of normal GET /model/new route
	 * @param {Function[]} options.override.update_index An array of middleware to use in place of normal GET /model/edit route
	 * @param {Function[]} options.override.get_index An array of middleware to use in place of normal GET /model route
	 * @param {Function[]} options.override.create_item An array of middleware to use in place of normal POST /model route
	 * @param {Function[]} options.override.get_item An array of middleware to use in place of normal GET /model/:id
	 * @param {Function[]} options.override.update_item An array of middleware to use in place of PUT /model/:id
	 * @param {Function[]} options.override.delete_item An array of middleware to use in place of DELETE /model/:id
	 * @param {string} options.model_name The name of the model the routes are being created for
	 * @param {Object} options.viewmodel Inflected model name values
	 * @return {Object}         Returns an express router that has RESTful routes registered to it
	 */
	routing (options = {}) {
		let { router, middleware, override, model_name, viewmodel } = options;
		if (!viewmodel) viewmodel = API_UTILITIES.setViewModelProperties({ model_name });
		router = (router) ? router : this.protocol.express.Router();
		router.get(`/${ viewmodel.name_plural }/new`, (override && override.create_index && Array.isArray(override.create_index)) ? override.create_index : middleware.new);
		router.get(`/${ viewmodel.name_plural }/edit`, (override && override.update_index && Array.isArray(override.update_index)) ? override.update_index : middleware.edit);
		router.route(`/${ viewmodel.name_plural }`)
			.get((override && override.get_index && Array.isArray(override.get_index)) ? override.get_index : [middleware.load_with_count, middleware.load_with_limit, middleware.paginate, middleware.index])
			.post((override && override.create_item && Array.isArray(override.create_item)) ? override.create_item : [this.protocol.resources.core.controller.save_revision, middleware.create]);
		router.route(`/${ viewmodel.name_plural }/:id`)
			.get((override && override.get_item && Array.isArray(override.get_item)) ? override.get_item : [middleware.load, middleware.show])
			.put((override && override.update_item && Array.isArray(override.update_item)) ? override.update_item : [this.protocol.resources.core.controller.save_revision, middleware.update])
			.delete((override && override.delete_item && Array.isArray(override.delete_item)) ? override.delete_item : [middleware.load, middleware.remove]);
		return router;
	}
	/**
	 * Convenience method for generting controller functions and routes for a given model. See _IMPLEMENT for more details
	 * @param  {Object} options Configurable options for implementing controller functions and routes for a model
	 * @param {string} options.model_name The name of the model that the controller functions are being generated for
	 * @param {Object} options.router An express router that routes should be mounted on
	 * @return {Object}         Returns an object that has an express router and controller functions
	 */
	implement (options = {}) {
		let viewmodel = API_UTILITIES.setViewModelProperties(options);
	  let router;
	  if ((this.protocol.express || options.router) && options.router !== false) {
	  	if (options.router) router = options.router;
	  	else {
	  		if (typeof this.protocol.express.Router === 'function') router = this.protocol.express.Router();
	  		else router = this.protocol.express;
	  	}
	  }
	 	return _IMPLEMENT.call(this, Object.assign({}, options, { viewmodel, router }));
	}
};

module.exports = REST_ADAPTER;
