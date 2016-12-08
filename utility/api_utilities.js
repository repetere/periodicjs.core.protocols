'use strict';
const ReponderInterface = require('periodicjs.core.responder');
const pluralize = require('pluralize');
const UTILITY = require(path.join(__dirname, '../utility/index'));
const mongoose = require('mongoose');

var view_adapter;
var active_model = {
  label: null,
  expanded_names: null
};
var composeMiddleware = function (options = {}) {
  let { fileext, viewname, extname, themename, basename, model_name } = options;
  let isHTMLAdapter = (options.protocol.responder.constructor === view_adapter.constructor);
  let render = view_adapter.render.bind(view_adapter);
  viewname = (typeof viewname === 'string') ? viewname : `${ model_name }/${ basename }`;
  return function (req, res) {
    let data = options.transform_data(req);
    if (isHTMLAdapter || options.strict) options.protocol.respond(req, res, Object.assign({}, options, { data }));
    else {
      render(data, options)
        .then(responder_override => {
          options.protocol.respond(req, res, { responder_override });
        }, err => {
          options.protocol.error(req, res, { err });
          options.protocol.exception(req, res, { err });
        });
    }
  };
};

const NEW = function (options) {
  let model_name = (options.user_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'new',
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

const SHOW = function (options) {
  let model_name = (options.user_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'show',
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

const EDIT = function (options) {
  let model_name = (options.user_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'edit',
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

const INDEX = function (options) {
  let viewmodel;
  if (active_model.label !== options.model_name || !active_model.expanded_names) {
    viewmodel = UTILITY.expand_names(options.model_name);
    active_model.label = options.model_name;
    active_model.expanded_names = viewmodel;
  }
  else viewmodel = active_model.expanded_names;
  let model_name = (options.user_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'index',
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
  return composeMiddleware(middleware_options);
};

const REMOVE = function (options) {
  let viewmodel;
  if (active_model.label !== options.model_name || !active_model.expanded_names) {
    viewmodel = UTILITY.expand_names(options.model_name);
    active_model.label = options.model_name;
    active_model.expanded_names = viewmodel;
  }
  else viewmodel = active_model.expanded_names;
  let model_name = (options.user_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let User = mongoose.model('User');

};

const SEARCH = function (options) {
  let viewmodel;
  if (active_model.label !== options.model_name || !active_model.expanded_names) {
    viewmodel = UTILITY.expand_names(options.model_name);
    active_model.label = options.model_name;
    active_model.expanded_names = viewmodel;
  }
  else viewmodel = active_model.expanded_names;
  let model_name = (options.user_plural_view_names) ? pluralize(options.model_name) : options.model_name;
  let middleware_options = Object.assign({}, options, {
    basename: 'search_index',
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

const CREATE_TAXONOMY = function (options) {

};

module.exports = (function () {
  view_adapter = ReponderInterface.create({ adapter: 'html', extname: '.ejs' });
  return {
    NEW,
    SHOW,
    EDIT,
    INDEX,
    REMOVE,
    SEARCH,
    CREATE_TAXONOMY
  };
})();
