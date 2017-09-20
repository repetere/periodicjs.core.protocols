'use strict';
const ReponderInterface = require('periodicjs.core.responder');
const PeriodicCoreUtilities = require('periodicjs.core.utilities');
const pluralize = require('pluralize');
const capitalize = require('capitalize');
const path = require('path');
const querystring = require('querystring');
const expand_names = require(path.join(__dirname, './expand_names'));
const CoreUtilities = new PeriodicCoreUtilities({});
var view_adapter;
var active_model = {
  label: null,
  expanded_names: null,
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
var composeMiddleware = function(options = {}) {
  let { viewname, basename, model_name, } = options;
  let isHTMLAdapter = (options.protocol.responder.constructor === view_adapter.constructor);
  let render = view_adapter.render.bind(view_adapter);
  options.viewname = (typeof viewname === 'string') ? viewname : `${ model_name }/${ basename }`;
  return function(req, res) {
    let data = Object.assign({}, req.controllerData, getRespondInKindData({ req, res, options, }), options.transform_data(req));
    if (isHTMLAdapter || options.strict) return options.protocol.respond(req, res, Object.assign({}, options, { data, }));
    else {
      return render(data, options)
        .then(responder_override => {
          return options.protocol.respond(req, res, Object.assign({}, options, { responder_override, }));
        })
        .catch(err => {
          options.protocol.error(req, res, { err, });
          return options.protocol.exception(req, res, { err, });
        });
    }
  };
};

/**
 * Checks to see if active model label matches model name. If there is a match returns active model inflected name values otherwise generates expanded names from model name and sets value to active model
 * @param {string} model_name String value that should be inflected
 * @return {Object} Returns an object containing inflected string values
 */
var setViewModelProperties = function(options) {
  let viewmodel;
  if (active_model.label !== options.model_name || !active_model.expanded_names) {
    viewmodel = expand_names(options);
    active_model.label = options.model_name;
    active_model.expanded_names = viewmodel;
  } else viewmodel = active_model.expanded_names;
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
const NEW = function(options = {}) {
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'new',
    fileext: (typeof options.template_ext === 'string') ? options.template_ext : undefined,
    transform_data: function(req) {
      return {
        pagedata: {
          title: `New ${ options.model_name }`,
        },
        user: req.user,
      };
    },
    model_name,
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
const SHOW = function(options = {}) {
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'show',
    fileext: (typeof options.template_ext === 'string') ? options.template_ext : undefined,
    transform_data: function(req) {
      return {
        pagedata: {
          title: req.controllerData[options.model_name].title,
        },
        data: req.controllerData[options.model_name],
        user: req.user,
      };
    },
    model_name,
  });
  let composed = composeMiddleware(middleware_options);
  return function(req, res) {
    if (jsonReq(req)) return options.protocol.respond(req, res, Object.assign({}, options, { data: req.controllerData[options.model_name], }));
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
const EDIT = function(options = {}) {
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'edit',
    fileext: (typeof options.template_ext === 'string') ? options.template_ext : undefined,
    transform_data: function(req) {
      return {
        pagedata: {
          title: req.controllerData[options.model_name].title,
        },
        data: req.controllerData[options.model_name],
        user: req.user,
      };
    },
    model_name,
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
const INDEX = function(options = {}) {
  let viewmodel = setViewModelProperties(options);
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'index',
    fileext: (typeof options.template_ext === 'string') ? options.template_ext : undefined,
    transform_data: function(req) {
      return {
        pagedata: {
          title: viewmodel.page_plural_title,
        },
        user: req.user,
        [viewmodel.name_plural]: req.controllerData[viewmodel.name_plural],
        [viewmodel.page_plural_count]: req.controllerData[viewmodel.page_plural_count],
        [viewmodel.page_pages]: (req.query.limit && !isNaN(Number(req.query.limit))) ? Math.ceil(req.controllerData[viewmodel.page_plural_count] / req.query.limit) : undefined,
      };
    },
    model_name,
  });
  let composed = composeMiddleware(middleware_options);
  return function(req, res) {
    if (jsonReq(req)) return options.protocol.respond(req, res, Object.assign({}, options, { data: req.controllerData[viewmodel.name_plural || options.model_name || pluralize(options.model_name)], }));
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
const REMOVE = function(options = {}) {
  let viewmodel = setViewModelProperties(options);
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db.default || options.protocol.db[viewmodel.name_plural];
  let Model;
  if (!options.protocol.db[options.model_name]) {
    if (!options.model) Model = dbAdapter.db_connection.model(capitalize(options.model_name));
    else Model = options.model;
  }
  return function(req, res) {
    try {
      let removeDocument = req.controllerData[viewmodel.name];
      return dbAdapter.delete({ model: Model, deleteid: removeDocument._id.toString() || removeDocument[dbAdapter.docid], })
        .then(deletedDoc => {
          if (jsonReq(req)) {
            return options.protocol.respond(req, res, Object.assign({}, options, { data: deletedDoc, }));
          } else {
            return options.protocol.redirect.call(options.protocol, req, res, { model_name, });
          }
        })
        .catch(err => {
          options.protocol.error(req, res, { err, });
          return options.protocol.exception(req, res, { err, });
        });
    } catch (err) {
      options.protocol.error(req, res, { err, });
      return options.protocol.exception(req, res, { err, });
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
const SEARCH = function(options = {}) {
  let viewmodel = setViewModelProperties(options);
  let model_name = (options.use_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'search',
    fileext: (typeof options.template_ext === 'string') ? options.template_ext : undefined,
    transform_data: function(req) {
      return {
        pagedata: {
          title: `${ viewmodel.page_plural_title } search results`,
        },
        user: req.user,
        [viewmodel.name_plural]: req.controllerData[viewmodel.name_plural],
        [viewmodel.page_plural_count]: req.controllerData[viewmodel.page_plural_count],
        [viewmodel.page_pages]: (req.query.limit && !isNaN(Number(req.query.limit))) ? Math.ceil(req.controllerData[viewmodel.page_plural_count] / req.query.limit) : undefined,
      };
    },
    model_name,
  });
  return composeMiddleware(middleware_options);
};

function getRedirectModelName(options) {
  const { req, newdoc, } = options;
  return (req.headers && req.headers.origin && req.headers.referer && newdoc && newdoc._id)
    ? path.join(req.headers.referer.replace(req.headers.origin + '/', ''), newdoc.name || newdoc._id.toString())
    : `/data/${options.model_name}/`;
}

/**
 * Generates middleware that handles creating items in a database
 * @param {Object} options Configurable options for create middleware
 * @param {string} options.model_name Name of the model that the view middleware is being generated for
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns middleware that handles creating items
 */
const CREATE = function(options = {}) {
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db.default;
  let Model;
  if (!options.protocol.db[options.model_name]) {
    if (!options.model) Model = dbAdapter.db_connection.model(capitalize(options.model_name));
    else Model = options.model;
  }
  return function (req, res) {
    try {
      if (req.body && req.body.title && !req.body.name) {
        req.body.name = CoreUtilities.makeNiceName(req.body.title);
      }
      const newdoc = req.body;
      const createDocOptions = Object.assign({
        newdoc, 
        model: Model,
      },req.controllerData);
      return dbAdapter.create(createDocOptions)
        .then(newdoc => { 
          if (jsonReq(req)) {
            return options.protocol.respond(req, res, Object.assign({}, options, { 
              data: {
                newdoc,
                createresponse: newdoc,
              },  
            }));
          } else {
            return options.protocol.redirect.call(options.protocol, req, res, {
              model_name: getRedirectModelName({ req, newdoc, }),
              
              // (req.headers && req.headers.origin && req.headers.referer && newdoc && newdoc._id)
              //   ? path.join(req.headers.referer.replace(req.headers.origin + '/', ''), newdoc.name || newdoc._id)
              //   : `/data/${options.model_name}/`,
              newdoc,
            });
          }
        })
        .catch(err => {
          options.protocol.error(req, res, { err, });
          return options.protocol.exception(req, res, { err, });
        });
    } catch (err) {
      options.protocol.error(req, res, { err, });
      return options.protocol.exception(req, res, { err, });
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
const UPDATE = function(options = {}) {
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db.default;
  let Model;
  if (!options.protocol.db[options.model_name]) {
    if (!options.model) Model = dbAdapter.db_connection.model(capitalize(options.model_name));
    else Model = options.model;
  }
  return function(req, res) {
    try {
      let updateOptions = Object.assign(options, req.controllerData, req.body, {
        id: req.params.id || req.body.updatedoc[dbAdapter.docid || '_id'],
        track_changes: (req.saverevision === true) ? true : undefined,
        model: Model,
        depopulate: req.depopulate || false,
        updatedoc: req.body.updatedoc || req.body,
      });
      if (!updateOptions.updatedoc.updatedat) {
        updateOptions.updatedoc.updatedat = new Date();
      }
      return dbAdapter.update(updateOptions)
        .then(updatedDoc => {
          if (jsonReq(req)) {
            return options.protocol.respond(req, res, Object.assign({}, options, { 
              data: {
                updatedoc: updateOptions.updatedoc,
                updateresponse: updatedDoc,
              },  
            }));
          } else {
            return options.protocol.redirect.call(options.protocol, req, res, {
              model_name: getRedirectModelName({ req, newdoc:updateOptions.updatedoc, }),
              // `p-admin/${options.model_name}/edit/`,
            });
          }
        })
        .catch(err => {
          options.protocol.error(req, res, { err, });
          return options.protocol.exception(req, res, { err, });
        });
    } catch (err) {
      options.protocol.error(req, res, { err, });
      return options.protocol.exception(req, res, { err, });
    }
  };
};

/**
 * Generates middleware that sets a property on req.headers that specifies that query results should be paginated
 * @param {Object} options Configurable options for generating middleware
 * @param {string} options.model_name Name of the model being queried
 * @return {Function} Returns a middleware that ensures that query results are paginated
 */
const LOAD_WITH_COUNT = function(options = {}) {
  let viewmodel = setViewModelProperties(options);
  return function(req, res, next) {
    req.headers[`load${ viewmodel.page_single_count }`] = true;
    next();
  };
};

/**
 * Generates middleware that sets a default limit and starting page for paginated queries
 * @param {Object} options Configurable options for generating middleware
 * @return {Function} Returns a middleware that set default limit and starting page number params on req.query for paginated queries
 */
const LOAD_WITH_LIMIT = function(options = {}) {
  let viewmodel = setViewModelProperties(options);
  return function(req, res, next) {
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
const PAGINATE = function(options = {}) {
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db.default;
  let Model;
  if (!options.protocol.db[options.model_name]) {
    if (!options.model) Model = dbAdapter.db_connection.model(capitalize(options.model_name));
    else Model = options.model;
  }
  let viewmodel = setViewModelProperties(options);
  return function(req, res, next) {
    try {
      req.controllerData = (req.controllerData && typeof req.controllerData === 'object') ? req.controllerData : {};
      let query = (req.controllerData && req.controllerData.model_query) ? req.controllerData.model_query : req.query.query || {};
      let population = options.load_multiple_model_population || '';
      let fields = (options.fields && typeof options.fields === 'object') ? options.fields : undefined;
      fields = (req.controllerData && req.controllerData.model_fields) ? req.controllerData.model_fields : fields;
      let pagenum = (!isNaN(Number(req.query.pagenum))) ? Number(req.query.pagenum) - 1 : 0;
      let limit = (!isNaN(Number(req.query.limit))) ? Number(req.query.limit) : Number(dbAdapter.limit);
      let pagelength = (!isNaN(Number(req.query.pagelength))) ? Number(req.query.pagelength) : Number(dbAdapter.pagelength);
      let skip = pagelength;
      skip = (!isNaN(Number(req.query.skip))) ? Number(req.query.skip) : skip * pagenum;
      return dbAdapter.search(Object.assign({}, req.query, { skip, limit: (pagelength <= limit) ? pagelength : limit, pagelength, model: Model, fields, population, query, paginate: (req.query.paginate === 'false' || req.query.paginate === false || req.controllerData.paginate === 'false' || req.controllerData.paginate === false) ? false : true, }))
        .then(result => {
          let currentpage = result['0'];
          if (req.query.skip) req.query.pagenum = Math.ceil(skip / pagelength) + 1;
          let data = {
            [viewmodel.page_plural_count]: result.total,
            [`${ viewmodel.name }limit`]: req.query.limit,
            [`${ viewmodel.name }offset`]: req.query.skip || skip,
            [`${ viewmodel.name }pages`]: result.total_pages,
            [`${ viewmodel.name }page_current`]: (req.query.pagenum) ? Number(req.query.pagenum) : 1,
            [`${ viewmodel.name }page_next`]: (req.query.pagenum) ? Number(req.query.pagenum) + 1 : 2,
            [`${ viewmodel.name }page_prev`]: (req.query.pagenum) ? Number(req.query.pagenum) - 1 : undefined,
            [viewmodel.name_plural]: (options.concat_documents) ? currentpage.documents : currentpage,
            [`${ viewmodel.name_plural }total`]: result.collection_count,
            [`${ viewmodel.name_plural }totalpages`]: result.collection_pages,
          };
          res.locals = Object.assign({}, res.locals, data);
          if (jsonReq(req) && options.skip_json_post_transforms) {
            req.controllerData[viewmodel.name_plural] = data;
            return options.protocol.respond(req, res, Object.assign({}, options, { data, }));
          } else {
            req.controllerData[viewmodel.name_plural] = data;
            next();
          }
        }, err => {
          options.protocol.error(req, res, { err, });
          return options.protocol.exception(req, res, { err, });
        });
    } catch (err) {
      options.protocol.error(req, res, { err, });
      return options.protocol.exception(req, res, { err, });
    }
  };
};

function jsonReq(req) {
  if (req && req.headers && req.headers.accept) {
    return req.headers.accept.indexOf('json') > -1 || req.is('json') || req.query.format === 'json' || /^json$/i.test(req.query.format);
  } else if (req && req.headers && req.headers.accepts) {
    return req.headers.accepts.indexOf('json') > -1 || req.is('json') || req.query.format === 'json' || /^json$/i.test(req.query.format);
  } else {
    return req.is('json') || req.query.format === 'json' || /^json$/i.test(req.query.format);
  }
}
/**
 * Generates middleware that handles querying for a single populated item
 * @param {Object} options Configurable options for load middleware
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns a middleware function that will query the database for a single item which is populated by default
 */
const LOAD = function(options = {}) {
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db.default;
  let Model;
  if (!options.protocol.db[options.model_name]) {
    if (!options.model) Model = dbAdapter.db_connection.model(capitalize(options.model_name));
    else Model = options.model;
  }
  return function(req, res, next) {
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
          model: Model,
          population: (req.controllerData && (req.controllerData.skip_population === true || req.controllerData.skip_population === 'true')) ? '' : undefined,
        })
        .then(result => {
          if (result) {
            req.controllerData[options.model_name] = result;
            next();
          } else {
            let err = new Error('Invalid Request');
            options.protocol.error(req, res, { err, });
            next(err);
          }
        }, err => {
          options.protocol.error(req, res, { err, });
          next(err);
        });
    } catch (err) {
      options.protocol.error(req, res, { err, });
      next(err);
    }
  };
};

/**
 * Generates a function that handles CLI inputs for queries
 * @param {Object} options Configurable options for CLI handler
 * @param {Object} options.protocol A protocol adapter with a defined db property containing database adapters indexed by model name
 * @return {Function} Returns a function that handles CLI inputs for queries and writes result to process stdout
 */
const CLI = function(options = {}) {
  let dbAdapter = options.protocol.db[options.model_name] || options.protocol.db.default;
  let Model;
  if (!options.protocol.db[options.model_name]) {
    if (!options.model) Model = dbAdapter.db_connection.model(capitalize(options.model_name));
    else Model = options.model;
  }
  return function(argv) {
    if (typeof argv.search === 'string') {
      let search = (options.protocol.utilities && options.protocol.utilities && typeof options.protocol.utilities.stripTags === 'function') ? new RegExp(options.protocol.utilities.stripTags(argv.search), 'gi') : new RegExp(argv.search.replace(/[^a-z0-9@._]/gi, '-').toLowerCase(), 'gi');
      let query;
      if (argv.search.length < 1) query = {};
      else {
        query = {
          $or: [{
            name: search,
          }, {
            title: search,
          }, ],
        };
      }
      delete argv.search;
      return dbAdapter.query(Object.assign(options, argv, { query, }))
        .then(result => {
          options.protocol.logger['silly' || 'log']('got docs');
          options.protocol.logger.info(result);
          if (options.protocol.settings && options.protocol.settings.application && options.protocol.settings.application.environment !== 'test') process.exit(0);
          return result;
        }, e => {
          options.protocol.logger.error(e);
          if (options.protocol.settings && options.protocol.settings.application && options.protocol.settings.application.environment !== 'test') process.exit(0);
          return Promise.reject(e);
        });
    } else {
      options.protocol.logger['silly' || 'log']('invalid task');
      if (options.protocol.settings && options.protocol.settings.application && options.protocol.settings.application.environment !== 'test') process.exit(0);
      return Promise.reject(new Error('Invalid Task'));
    }
  };
};

function getRespondInKindData(resOptions) {
  let { req, res, } = resOptions;
  let inKindRes = (!res || !res.locals) ? Object.assign({}, { locals: {}, }, res) : res;
  let inKindReq = (!req || !req.app || !req.connection || !req.headers || !req._parsedUrl) ? Object.assign({}, { app: {}, connection: {}, headers: {}, _parsedUrl: {}, },
    req) : req;
  const periodicExpressAppLocals = Object.assign({},
    inKindReq.app.locals //, { settings: true, }
  );

  const responseData = Object.assign({
    periodic: periodicExpressAppLocals,
    request: {},
  }, inKindRes.locals);
  responseData.request = {
    query: querystring.parse(inKindReq._parsedUrl.query),
    params: inKindReq.params,
    baseurl: inKindReq.baseUrl,
    originalurl: inKindReq.originalUrl,
    parsed: inKindReq._parsedUrl,
    'x-forwarded-for': inKindReq.headers['x-forwarded-for'],
    remoteAddress: inKindReq.connection.remoteAddress,
    referer: inKindReq.headers.referer,
    originalUrl: inKindReq.originalUrl,
    headerHost: inKindReq.headers.host,
  };
  return responseData;
}

module.exports = (function() {
  view_adapter = ReponderInterface.create({ adapter: 'html', extname: '.ejs', });
  return {
    NEW, SHOW, EDIT, INDEX, REMOVE, SEARCH, CREATE, UPDATE, LOAD, PAGINATE, LOAD_WITH_COUNT, LOAD_WITH_LIMIT, CLI,
    jsonReq,
    setViewModelProperties,
    getRedirectModelName,
  };
})();