'use strict';
const ReponderInterface = require('periodicjs.core.responder');
const pluralize = require('pluralize');
const path = require('path');
const expand_names = require(path.join(__dirname, './expand_names'));

var view_adapter;
var active_model = {
  label: null,
  expanded_names: null
};

/**
 * A convenience method for creating view rendering middleware for a given model
 * @param  {Object} options Configurable options
 * @param {string} [options.fileext] Defines the file extension of the view file being rendered
 * @param {string} [options.viewname] Defines the basename, partial path or full path of a view file
 * @param {string} [options.themename] Specifies a periodicjs theme folder that will be searched for a the view file
 * @param {string} [options.basename] If viewname is not provided basename is used to define a best guess viewname by combining options.model_name and options.basename
 * @param {string} [options.model_name] The name of the model that the middleware is being generated for
 * @param {Object} [options.protocol] A parent protocol adapter that must have a defined responder property
 * @param {Function} options.transform_data A function for pulling data out of a request object and assigning it to an eventual response body
 * @param {Boolean} [options.strict] When falsy defined protocol responder will always be used instead of default HTML adapter. Default HTML adapter will also be ignored if protocol responder is an HTML adapter
 * @return {Function}         Returns an express middleware function that will render a view dependent on options
 */
var composeMiddleware = function (options = {}) {
  let { viewname, basename, model_name } = options;
  let isHTMLAdapter = (options.protocol.responder.constructor === view_adapter.constructor);
  let render = view_adapter.render.bind(view_adapter);
  options.viewname = (typeof viewname === 'string') ? viewname : `${ model_name }/${ basename }`;
  return function (req, res) {
    let data = options.transform_data(req);
    if (isHTMLAdapter || options.strict) return options.protocol.respond(req, res, Object.assign({}, options, { data }));
    else {
      return render(data, options)
        .then(responder_override => {
          return options.protocol.respond(req, res, Object.assign({}, options, { responder_override }));
        })
        .catch(err => {
          options.protocol.error(req, res, { err });
          return options.protocol.exception(req, res, { err });
        });
    }
  };
};

/**
 * Checks to see if active model label matches model name. If there is a match returns active model inflected name values otherwise generates expanded names from model name and sets value to active model
 * @param {string} model_name String value that should be inflected
 * @return {Object} Returns an object containing inflected string values
 */
var setViewModelProperties = function (options) {
  let viewmodel;
  if (active_model.label !== options.model_name || !active_model.expanded_names) {
    viewmodel = expand_names(options);
    active_model.label = options.model_name;
    active_model.expanded_names = viewmodel;
  }
  else viewmodel = active_model.expanded_names;
  return viewmodel;
};

/**
 * Generates middleware that will render the "new" view
 * @param {Object} options Configurable options for "new" view rendering
 * @param {Boolean} [options.use_plural_view_name] If true the plural value of the model name will be used in the view
 * @param {string} options.template_ext Used in specifying a custom file extension for view files
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @return {Function} Returns a middleware function that will render "new" view
 */
const NEW = function (options = {}) {
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: (typeof options.template_ext === 'string') ? `new${ /\./.test(options.template_ext) ? options.template_ext : '.' + options.template_ext }` : 'new.ejs',
    transform_data: function (req) {
      return {
        pagedata: {
          title: `New ${ options.model_name }`
        },
        user: req.user
      };
    },
    model_name
  });
  return composeMiddleware(middleware_options);
};

/**
 * Generates middleware that will render the "show" view
 * @param {Object} options Configurable options for "show" view rendering
 * @param {Boolean} [options.use_plural_view_name] If true the plural value of the model name will be used in the view
 * @param {string} options.template_ext Used in specifying a custom file extension for view files
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @return {Function} Returns a middleware function that will render "show" view
 */
const SHOW = function (options = {}) {
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: (typeof options.template_ext === 'string') ? `show${ /\./.test(options.template_ext) ? options.template_ext : '.' + options.template_ext }` : 'show.ejs',
    transform_data: function (req) {
      return {
        pagedata: {
          title: req.controllerData[options.model_name].title
        },
        user: req.user
      };
    },
    model_name
  });
  let composed = composeMiddleware(middleware_options);
  return function (req, res) {
    if (req.query && req.query.format && /^json$/i.test(req.query.format)) return options.protocol.respond(req, res, Object.assign({}, options, { data: req.controllerData[options.model_name] }));
    return composed(req, res);
  };
};

/**
 * Generates middleware that will render the "edit" view
 * @param {Object} options Configurable options for "edit" view rendering
 * @param {Boolean} [options.use_plural_view_name] If true the plural value of the model name will be used in the view
 * @param {string} options.template_ext Used in specifying a custom file extension for view files
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @return {Function} Returns a middleware function that will render "edit" view
 */
const EDIT = function (options = {}) {
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: (typeof options.template_ext === 'string') ? `edit${ /\./.test(options.template_ext) ? options.template_ext : '.' + options.template_ext }` : 'edit.ejs',
    transform_data: function (req) {
      return {
        pagedata: {
          title: req.controllerData[options.model_name].title
        },
        user: req.user
      };
    },
    model_name
  });
  return composeMiddleware(middleware_options);
};

/**
 * Generates middleware that will render the "index" view
 * @param {Object} options Configurable options for "index" view rendering
 * @param {Boolean} [options.use_plural_view_name] If true the plural value of the model name will be used in the view
 * @param {string} options.template_ext Used in specifying a custom file extension for view files
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @return {Function} Returns a middleware function that will render "index" view
 */
const INDEX = function (options = {}) {
  let viewmodel = setViewModelProperties(options);
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: (typeof options.template_ext === 'string') ? `index${ /\./.test(options.template_ext) ? options.template_ext : '.' + options.template_ext }` : 'index.ejs',
    transform_data: function (req) {
      return {
        pagedata: {
          title: viewmodel.page_plural_title
        },
        user: req.user,
        [viewmodel.name_plural]: req.controllerData[viewmodel.name_plural],
        [viewmodel.page_plural_count]: req.controllerData[viewmodel.page_plural_count],
        [viewmodel.page_pages]: (req.query.limit && !isNaN(Number(req.query.limit))) ? Math.ceil(req.controllerData[viewmodel.page_plural_count] / req.query.limit) : undefined
      };
    },
    model_name
  });
  let composed = composeMiddleware(middleware_options);
  return function (req, res) {
    if (req.query && req.query.format && /^json$/i.test(req.query.format)) return options.protocol.respond(req, res, Object.assign({}, options, { data: req.controllerData[options.model_name] }));
    return composed(req, res);
  };
};

/**
 * Generates middleware that handles deleting items from a database
 * @param {Object} options Configurable options for delete middleware
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns middleware that handles deleting items
 */
const REMOVE = function (options = {}) {
  let viewmodel = setViewModelProperties(options);
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db[viewmodel.name_plural];
  return function (req, res) {
    try {
      let removeDocument = req.controllerData[viewmodel.name];
      return dbAdapter.delete({ deleteid: removeDocument._id.toString() || removeDocument[dbAdapter.docid] })
        .then(options.protocol.redirect.bind(options.protocol, req, res, { model_name }), err => {
          options.protocol.error(req, res, { err });
          return options.protocol.exception(req, res, { err });
        });
    }
    catch (err) {
      options.protocol.error(req, res, { err });
      return options.protocol.exception(req, res, { err });
    }
  };
};

/**
 * Generates middleware that handles rendering a view from paginated data
 * @param {Object} options Configurable options for querying middleware
 * @param {Boolean} [options.use_plural_view_name] If true the plural value of the model name will be used in the view
 * @param {string} options.template_ext Used in specifying a custom file extension for view files
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @return {Function} Returns middleware that handles rendering a view from paginated data
 */
const SEARCH = function (options = {}) {
  let viewmodel = setViewModelProperties(options);
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: (typeof options.template_ext === 'string') ? `search${ /\./.test(options.template_ext) ? options.template_ext : '.' + options.template_ext }` : 'search.ejs',
    transform_data: function (req) {
      return {
        pagedata: {
          title: `${ viewmodel.page_plural_title } search results`
        },
        user: req.user,
        [viewmodel.name_plural]: req.controllerData[viewmodel.name_plural],
        [viewmodel.page_plural_count]: req.controllerData[viewmodel.page_plural_count],
        [viewmodel.page_pages]: (req.query.limit && !isNaN(Number(req.query.limit))) ? Math.ceil(req.controllerData[viewmodel.page_plural_count] / req.query.limit) : undefined
      };
    },
    model_name
  });
  return composeMiddleware(middleware_options);
};

/**
 * Generates middleware that handles creating items in a database
 * @param {Object} options Configurable options for create middleware
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns middleware that handles creating items
 */
const CREATE = function (options = {}) {
  let dbAdapter = options.protocol.db[options.model_name];
  return function (req, res) {
    try {
      return dbAdapter.create({ newdoc: req.body })
        .then(options.protocol.redirect.bind(options.protocol, req, res, {
          model_name: `p-admin/content/${ options.model_name }/`
        }), err => {
          options.protocol.error(req, res, { err });
          return options.protocol.exception(req, res, { err });
        });
    }
    catch (err) {
      options.protocol.error(req, res, { err });
      return options.protocol.exception(req, res, { err });
    }
  };
};

/**
 * Generates middleware that handles updating an item in a database
 * @param {Object} options Configurable options for delete middleware
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns middleware that handles updating items
 */
const UPDATE = function (options = {}) {
  let dbAdapter = options.protocol.db[options.model_name];
  return function (req, res) {
    try {
      let updateOptions = Object.assign(options, req.body, {
        id: req.params.id || req.body.updatedoc[dbAdapter.docid || '_id'],
        track_changes: (req.saverevision === true) ? true : undefined
      });
      return dbAdapter.update(updateOptions)
        .then(options.protocol.redirect.bind(options.protocol, req, res, {
          model_name: `p-admin/${ options.model_name }/edit/`
        }), err => {
          options.protocol.error(req, res, { err });
          return options.protocol.exception(req, res, { err });
        });
    }
    catch (err) {
      options.protocol.error(req, res, { err });
      return options.protocol.exception(req, res, { err });
    }
  };
};

/**
 * Generates middleware that sets a property on req.headers that specifies that query results should be paginated
 * @param {Object} options Configurable options for generating middleware
 * @param {string} options.model_name Name of the model being queried
 * @return {Function} Returns a middleware that ensures that query results are paginated
 */
const LOAD_WITH_COUNT = function (options = {}) {
  let viewmodel = setViewModelProperties(options);
  return function (req, res, next) {
    req.headers[`load${ viewmodel.page_single_count }`] = true;
    next();
  };
};

/**
 * Generates middleware that sets a default limit and starting page for paginated queries
 * @param {Object} options Configurable options for generating middleware
 * @return {Function} Returns a middleware that set default limit and starting page number params on req.query for paginated queries
 */
const LOAD_WITH_LIMIT = function (options = {}) {
  let viewmodel = setViewModelProperties(options);
  return function (req, res, next) {
    req.query.limit = req.query[`${ viewmodel.name_plural }perpage`] || req.query.docsperpage || req.query.limit || req.body[`${ viewmodel.name_plural }perpage`] || req.body.docsperpage || req.body.limit || 15;
    req.query.pagenum = ((req.query.pagenum && req.query.pagenum > 0) || (req.body.pagenum && req.body.pagenum > 0)) ? req.query.pagenum || req.body.pagenum : 1;
    next();
  };
};

/**
 * Generates middleware that handles querying a database and returning paginated data
 * @param {Object} options Configurable options for generating middleware for making queries that will return paginated data
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @param {Object} [options.query={}] Sets a default query that should be used. This value is ignored if req.controllerData.model_query is set
 * @param {Object} [options.fields] A default set of fields to pull when middleware is called this value is ignored if req.controllerData.model_fields is set
 * @param {string|Object} [options.population=""]  Population settings for model
 * @return {Function}   Returns a middleware function that will query the database and return paginated data
 */
const PAGINATE = function (options = {}) {
  let dbAdapter = options.protocol.db[options.model_name];
  let viewmodel = setViewModelProperties(options);
  return function (req, res, next) {
    try {
      req.controllerData = (req.controllerData && typeof req.controllerData === 'object') ? req.controllerData : {};
      let query = (req.controllerData && req.controllerData.model_query) ? req.controllerData.model_query : options.query || {};
      let population = options.load_multiple_model_population || '';
      let fields = (options.fields && typeof options.fields === 'object') ? options.fields : undefined;
      fields = (req.controllerData && req.controllerData.model_fields) ? req.controllerData.model_fields : fields;
      return dbAdapter.search(Object.assign(req.query, { fields, population, query, paginate: (req.query.paginate === 'false' || req.query.paginate === false || req.controllerData.paginate === 'false' || req.controllerData.paginate === false) ? false : true }))
        .then(result => {
          let currentpage;
          let next_page;
          let prev_page;
          if (req.query.pagenum) {
            let hasPage = result[req.query.pagenum.toString()];
            currentpage = (hasPage) ? hasPage : result['0'];
            next_page = (hasPage) ? result[Number(req.query.pagenum) + 1] : undefined;
            prev_page = (hasPage) ? result[Number(req.query.pagenum) - 1] : undefined;
          }
          else {
            currentpage = result['0'];
            next_page = result['1'];
          }
          let data = {
            [viewmodel.page_plural_count]: result.total,
            [`${ viewmodel.name }limit`]: req.query.limit,
            [`${ viewmodel.name }offset`]: req.query.offset,
            [`${ viewmodel.name }pages`]: result.total_pages,
            [`${ viewmodel.name }page_current`]: currentpage,
            [`${ viewmodel.name }page_next`]: next_page,
            [`${ viewmodel.name }page_prev`]: prev_page,
            [viewmodel.name_plural]: Object.keys(result).reduce((pages, key) => {
              if (/^\d+$/.test(key)) pages[key] = result[key];
              return pages;
            }, {})
          };
          if (req.query && req.query.format && /^json$/i.test(req.query.format)) return options.protocol.respond(req, res, Object.assign({}, options, { data }));
          else {
            req.controllerData[viewmodel.name_plural] = data;
            next();
          }
        }, err => {
          options.protocol.error(req, res, { err });
          return options.protocol.exception(req, res, { err });
        });
    }
    catch (err) {
      options.protocol.error(req, res, { err });
      return options.protocol.exception(req, res, { err });
    }
  };
};

/**
 * Generates middleware that handles querying for a single populated item
 * @param {Object} options Configurable options for load middleware
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns a middleware function that will query the database for a single item which is populated by default
 */
const LOAD = function (options = {}) {
  let dbAdapter = options.protocol.db[options.model_name];
  return function (req, res, next) {
    try {
      req.controllerData = (req.controllerData && typeof req.controllerData === 'object') ? req.controllerData : {};
      let fields = (req.controllerData && req.controllerData.model_fields) ? req.controllerData.model_fields : undefined;
      let docid;
      if (options.docid && (!req.controllerData.docid && !req.query.docid)) docid = options.docid;
      else if (req.controllerData.docid) docid = req.controllerData.docid;
      else if (req.query.docid) docid = req.query.docid; 
      dbAdapter.load({
        query: req.params.id,
        fields,
        docid,
        population: (req.controllerData && (req.controllerData.skip_population === true || req.controllerData.skip_population === 'true')) ? '' : undefined
      })
        .then(result => {
          req.controllerData[options.model_name] = result;
          next();
        }, err => {
          options.protocol.error(req, res, { err });
          next(err);
        });
    }
    catch (err) {
      options.protocol.error(req, res, { err });
      next(err);
    }
  };
};

module.exports = (function () {
  view_adapter = ReponderInterface.create({ adapter: 'html', extname: '.ejs' });
  return { NEW, SHOW, EDIT, INDEX, REMOVE, SEARCH, CREATE, UPDATE, LOAD, PAGINATE, LOAD_WITH_COUNT, LOAD_WITH_LIMIT, setViewModelProperties, view_adapter };
})();
