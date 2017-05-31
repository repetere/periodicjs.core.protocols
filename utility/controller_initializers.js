'use strict';
const path = require('path');

/**
 * Returns a proxy which implements a get trap that targets a utils object containing methods indexed by function name. If return value is a function default options from parent will be used as default options in each function call
 * @param  {Object} parent An object that the proxy should be set on. Also assumes that parent is a API adapter.
 * @param  {Object} utils  An object containing utility methods
 * @return {Object}        Returns a Proxy
 */
module.exports = function getInitializers (parent, utils = {}) {
  const get = function (target, property) {
    if (typeof utils[property] === 'function') {
      return function (options = {}) {
        return utils[property](Object.assign({}, parent, options));
      };
    }
    return utils[property];
  };
  const set = function () {
    return true;
  };
  return new Proxy({}, { get, set, });
};