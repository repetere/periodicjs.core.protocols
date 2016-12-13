# periodicjs.core.data
[![Build Status](https://travis-ci.org/typesettin/periodicjs.core.protocols.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs.core.protocols) [![NPM version](https://badge.fury.io/js/periodicjs.core.protocols.svg)](http://badge.fury.io/js/periodicjs.core.protocols) [![Coverage Status](https://coveralls.io/repos/github/typesettin/periodicjs.core.protocols/badge.svg?branch=master)](https://coveralls.io/github/typesettin/periodicjs.core.protocols?branch=master)  [![Join the chat at https://gitter.im/typesettin/periodicjs.core.data](https://badges.gitter.im/typesettin/periodicjs.core.protocols.svg)](https://gitter.im/typesettin/periodicjs.core.protocols?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


### Description
Core protocols is a component of periodicjs.core.controller that exposes a standard set of methods across different transport protcols with options for implementing different API strategies.  With core protocols implementing a RESTful API for HTTP requests looks no different than standing up a JSONRPC API for websocket based communications.

### [Full Documentation](https://github.com/typesettin/periodicjs.core.protocols/blob/master/doc/api.md)

### Usage (basic)
```javascript

```
### Usage (HTML Adapter Advanced)
```javascript

```

### Development
*Make sure you have grunt installed*
```sh
$ npm install -g grunt-cli jsdoc-to-markdown
```

For generating documentation
```sh
$ grunt doc
$ jsdoc2md adapters/**/*.js api_adapters/**/*.js utility/**/*.js index.js > doc/api.md
```
### Notes
* Check out [https://github.com/typesettin/periodicjs](https://github.com/typesettin/periodicjs) for the full Periodic Documentation

### Testing
```sh
$ npm i
$ grunt test
```
### Contributing
License
----

MIT
