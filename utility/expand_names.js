'use strict';
const pluralize = require('pluralize');
const capitalize = require('capitalize');

/**
 * Generates a set of standard inflections from a given model name
 * @param  {Object} [options={}] Configurable options for string inflection
 * @param {string} options.model_name String to inflect
 * @return {Object}         A set of inflections from a given string
 */
module.exports = function getViewModelProperties (options = {}) {
  let model_name = options.model_name;
  let viewmodel = {
    name: model_name,
    name_plural: pluralize(model_name),
  };
  return Object.assign(viewmodel, {
    capital_name: capitalize(model_name),
    page_plural_title: capitalize(viewmodel.name_plural),
    page_plural_count: `${ viewmodel.name_plural }count`,
    page_plural_query: `${ viewmodel.name_plural }query`,
    page_single_count: `${ model_name }count`,
    page_pages: `${ model_name }pages`,
  });
};