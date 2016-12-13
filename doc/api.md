## Classes

<dl>
<dt><a href="#HTTP_ADAPTER">HTTP_ADAPTER</a> : <code>HTTP_Adapter</code></dt>
<dd><p>A protocol adapter for HTTP requests and responses</p>
</dd>
<dt><a href="#REST_ADAPTER">REST_ADAPTER</a> : <code>REST_Adapter</code></dt>
<dd><p>An API adapter for RESTful API&#39;s. REST_Adapter handles standing up a standard set of RESTful routes and middleware</p>
</dd>
<dt><a href="#PROTOCOL_ADAPTER_INTERFACE">PROTOCOL_ADAPTER_INTERFACE</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#generateErrorDetails">generateErrorDetails(req, data)</a> ⇒ <code>Object</code></dt>
<dd><p>Appends a standard set of request data to an error response</p>
</dd>
<dt><a href="#_generateSuccessDetails">_generateSuccessDetails(req, data)</a> ⇒ <code>Object</code></dt>
<dd><p>Appends a standard set of request data to a success response</p>
</dd>
<dt><a href="#_IMPLEMENT">_IMPLEMENT(options)</a> ⇒ <code>Object</code></dt>
<dd><p>Generates a set of controller functions indexed by a standard set of properties</p>
</dd>
<dt><a href="#composeMiddleware">composeMiddleware(options)</a> ⇒ <code>function</code></dt>
<dd><p>A convenience method for creating view rendering middleware for a given model</p>
</dd>
<dt><a href="#setViewModelProperties">setViewModelProperties(model_name)</a> ⇒ <code>Object</code></dt>
<dd><p>Checks to see if active model label matches model name. If there is a match returns active model inflected name values otherwise generates expanded names from model name and sets value to active model</p>
</dd>
<dt><a href="#NEW">NEW(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that will render the &quot;new&quot; view</p>
</dd>
<dt><a href="#SHOW">SHOW(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that will render the &quot;show&quot; view</p>
</dd>
<dt><a href="#EDIT">EDIT(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that will render the &quot;edit&quot; view</p>
</dd>
<dt><a href="#INDEX">INDEX(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that will render the &quot;index&quot; view</p>
</dd>
<dt><a href="#REMOVE">REMOVE(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that handles deleting items from a database</p>
</dd>
<dt><a href="#SEARCH">SEARCH(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that handles rendering a view from paginated data</p>
</dd>
<dt><a href="#CREATE">CREATE(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that handles creating items in a database</p>
</dd>
<dt><a href="#UPDATE">UPDATE(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that handles updating an item in a database</p>
</dd>
<dt><a href="#LOAD_WITH_COUNT">LOAD_WITH_COUNT(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that sets a property on req.headers that specifies that query results should be paginated</p>
</dd>
<dt><a href="#LOAD_WITH_LIMIT">LOAD_WITH_LIMIT(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that sets a default limit and starting page for paginated queries</p>
</dd>
<dt><a href="#PAGINATE">PAGINATE(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that handles querying a database and returning paginated data</p>
</dd>
<dt><a href="#LOAD">LOAD(options)</a> ⇒ <code>function</code></dt>
<dd><p>Generates middleware that handles querying for a single populated item</p>
</dd>
</dl>

<a name="HTTP_ADAPTER"></a>

## HTTP_ADAPTER : <code>HTTP_Adapter</code>
A protocol adapter for HTTP requests and responses

**Kind**: global class  

* [HTTP_ADAPTER](#HTTP_ADAPTER) : <code>HTTP_Adapter</code>
    * [new HTTP_ADAPTER(options)](#new_HTTP_ADAPTER_new)
    * [.error(req, res, [options])](#HTTP_ADAPTER+error) ⇒ <code>Object</code>
    * [.warn(req, res, [options])](#HTTP_ADAPTER+warn) ⇒ <code>Object</code>
    * [.exception(req, res, [options])](#HTTP_ADAPTER+exception) ⇒ <code>Object</code>
    * [.respond(req, res, [options])](#HTTP_ADAPTER+respond) ⇒ <code>Object</code>
    * [.redirect(req, res, [options])](#HTTP_ADAPTER+redirect) ⇒ <code>Object</code>
    * [.implement(options)](#HTTP_ADAPTER+implement) ⇒ <code>Object</code>

<a name="new_HTTP_ADAPTER_new"></a>

### new HTTP_ADAPTER(options)
Constructor for HTTP_Adapter


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Options for the HTTP adapter |
| options.db | <code>Object</code> |  | Database adapters indexed by model name (periodicjs.core.data) |
| options.express | <code>Object</code> |  | Express module |
| options.responder | <code>Object</code> |  | A response adapter (periodicjs.core.responder) |
| options.config | <code>Object</code> |  | Periodic configuration object |
| options.settings | <code>Object</code> |  | Periodic application settings |
| options.resources | <code>Object</code> |  | Periodic resources |
| options.api | <code>string</code> |  | Name of the api adapter that should be used |
| [options.logger] | <code>Object</code> | <code>console</code> | A logger module |

<a name="HTTP_ADAPTER+error"></a>

### httP_ADAPTER.error(req, res, [options]) ⇒ <code>Object</code>
Handles logging errors

**Kind**: instance method of <code>[HTTP_ADAPTER](#HTTP_ADAPTER)</code>  
**Returns**: <code>Object</code> - this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Object</code> |  | Express request object |
| res | <code>Object</code> |  | Express response object |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for error logging |
| options.err | <code>Object</code> |  | An error to log |

<a name="HTTP_ADAPTER+warn"></a>

### httP_ADAPTER.warn(req, res, [options]) ⇒ <code>Object</code>
Handles logging warns

**Kind**: instance method of <code>[HTTP_ADAPTER](#HTTP_ADAPTER)</code>  
**Returns**: <code>Object</code> - this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Object</code> |  | Express request object |
| res | <code>Object</code> |  | Express response object |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for warning logging |
| options.err | <code>Object</code> |  | An error to log |

<a name="HTTP_ADAPTER+exception"></a>

### httP_ADAPTER.exception(req, res, [options]) ⇒ <code>Object</code>
Handles sending an error response

**Kind**: instance method of <code>[HTTP_ADAPTER](#HTTP_ADAPTER)</code>  
**Returns**: <code>Object</code> - this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Object</code> |  | Express request object |
| res | <code>Object</code> |  | Express response object |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for error logging |
| options.err | <code>Object</code> |  | An error to log. If this.config.exception_message is set error param is ignored |

<a name="HTTP_ADAPTER+respond"></a>

### httP_ADAPTER.respond(req, res, [options]) ⇒ <code>Object</code>
Handles sending the response to a request by rendering data according to this.responder configuration

**Kind**: instance method of <code>[HTTP_ADAPTER](#HTTP_ADAPTER)</code>  
**Returns**: <code>Object</code> - this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Object</code> |  | Express request object |
| res | <code>Object</code> |  | Express response object |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for response |
| options.ignore_error | <code>Boolean</code> |  | If true error will be treated like a normal response |
| options.responder_override | <code>\*</code> |  | Data to send in response. If this value is defined A success response will always be set and all formatting rules will be ignored |
| options.skip_default_props | <code>Boolean</code> |  | If true request details will not be appended to success response |
| options.err | <code>Object</code> |  | An error to send in response. If this value is set an error response will be generated unless options.ignore_error is true |
| options.data | <code>Object</code> |  | Data to send in success response. If options.err is defined this value will be ignored |

<a name="HTTP_ADAPTER+redirect"></a>

### httP_ADAPTER.redirect(req, res, [options]) ⇒ <code>Object</code>
Handles redirects

**Kind**: instance method of <code>[HTTP_ADAPTER](#HTTP_ADAPTER)</code>  
**Returns**: <code>Object</code> - this  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| req | <code>Object</code> |  | Express request object |
| res | <code>Object</code> |  | Express response object |
| [options] | <code>Object</code> | <code>{}</code> | Configurable options for redirect |
| options.model_name | <code>string</code> |  | A path to attempt for redirect if req.redirect is not provided |

<a name="HTTP_ADAPTER+implement"></a>

### httP_ADAPTER.implement(options) ⇒ <code>Object</code>
Convenience method for accessing .implement method on API adapter. Also handles implementing controllers and routers for multiple models

**Kind**: instance method of <code>[HTTP_ADAPTER](#HTTP_ADAPTER)</code>  
**Returns**: <code>Object</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for implementing controllers and routers. See API adapter .implement method for more details |
| options.model_name | <code>string</code> &#124; <code>Array.&lt;string&gt;</code> | An array of model names or a single model name that should have controllers and routes implemented |

<a name="REST_ADAPTER"></a>

## REST_ADAPTER : <code>REST_Adapter</code>
An API adapter for RESTful API's. REST_Adapter handles standing up a standard set of RESTful routes and middleware

**Kind**: global class  

* [REST_ADAPTER](#REST_ADAPTER) : <code>REST_Adapter</code>
    * [new REST_ADAPTER(protocol_adapter)](#new_REST_ADAPTER_new)
    * [.routing(options)](#REST_ADAPTER+routing) ⇒ <code>Object</code>
    * [.implement(options)](#REST_ADAPTER+implement) ⇒ <code>Object</code>

<a name="new_REST_ADAPTER_new"></a>

### new REST_ADAPTER(protocol_adapter)
Constructor for REST_Adapter


| Param | Type | Description |
| --- | --- | --- |
| protocol_adapter | <code>Object</code> | A protocol adapters that exposes database adapters, response adapters, and an express server |

<a name="REST_ADAPTER+routing"></a>

### resT_ADAPTER.routing(options) ⇒ <code>Object</code>
Appends RESTful routes to an express router

**Kind**: instance method of <code>[REST_ADAPTER](#REST_ADAPTER)</code>  
**Returns**: <code>Object</code> - Returns an express router that has RESTful routes registered to it  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for routing |
| options.router | <code>Object</code> | An express router. If this value is not defined a new express router will be created |
| options.middleware | <code>Object</code> | Middleware functions that are used in generating routes |
| options.override | <code>Object</code> | Full route overrides |
| options.override.create_index | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of normal GET /model/new route |
| options.override.update_index | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of normal GET /model/edit route |
| options.override.get_index | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of normal GET /model route |
| options.override.create_item | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of normal POST /model route |
| options.override.get_item | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of normal GET /model/:id |
| options.override.update_item | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of PUT /model/:id |
| options.override.delete_item | <code>Array.&lt;function()&gt;</code> | An array of middleware to use in place of DELETE /model/:id |
| options.model_name | <code>string</code> | The name of the model the routes are being created for |
| options.viewmodel | <code>Object</code> | Inflected model name values |

<a name="REST_ADAPTER+implement"></a>

### resT_ADAPTER.implement(options) ⇒ <code>Object</code>
Convenience method for generting controller functions and routes for a given model. See _IMPLEMENT for more details

**Kind**: instance method of <code>[REST_ADAPTER](#REST_ADAPTER)</code>  
**Returns**: <code>Object</code> - Returns an object that has an express router and controller functions  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for implementing controller functions and routes for a model |
| options.model_name | <code>string</code> | The name of the model that the controller functions are being generated for |
| options.router | <code>Object</code> | An express router that routes should be mounted on |

<a name="PROTOCOL_ADAPTER_INTERFACE"></a>

## PROTOCOL_ADAPTER_INTERFACE
**Kind**: global class  

* [PROTOCOL_ADAPTER_INTERFACE](#PROTOCOL_ADAPTER_INTERFACE)
    * [new PROTOCOL_ADAPTER_INTERFACE([options])](#new_PROTOCOL_ADAPTER_INTERFACE_new)
    * [.create([options])](#PROTOCOL_ADAPTER_INTERFACE+create) ⇒ <code>Object</code>

<a name="new_PROTOCOL_ADAPTER_INTERFACE_new"></a>

### new PROTOCOL_ADAPTER_INTERFACE([options])
Creates an interface


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | A set of properties defined by keys with their allowed types as values. Each property will be required by newly constructed classes from this interface |

<a name="PROTOCOL_ADAPTER_INTERFACE+create"></a>

### protocoL_ADAPTER_INTERFACE.create([options]) ⇒ <code>Object</code>
Constructs a new object with a prototype defined by the .adapter ensuring that instantiated class conforms to interface requirements

**Kind**: instance method of <code>[PROTOCOL_ADAPTER_INTERFACE](#PROTOCOL_ADAPTER_INTERFACE)</code>  
**Returns**: <code>Object</code> - Returns an instantiated adapter class  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Values to be passed to class constructor (.adapter should be reserved for either customer class or string that matches key in ADAPTERS) |
| options.adapter | <code>string</code> &#124; <code>function</code> |  | Required to specify type of adapter to be constructed or a class constructor that can be instantiated with new keyword |

<a name="generateErrorDetails"></a>

## generateErrorDetails(req, data) ⇒ <code>Object</code>
Appends a standard set of request data to an error response

**Kind**: global function  
**Returns**: <code>Object</code> - The original error data with request information added  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | An express request object |
| data | <code>Object</code> | Error data that should be included in response |

<a name="_generateSuccessDetails"></a>

## _generateSuccessDetails(req, data) ⇒ <code>Object</code>
Appends a standard set of request data to a success response

**Kind**: global function  
**Returns**: <code>Object</code> - The original data with request information added  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | An express request object |
| data | <code>Object</code> | Data to be included in response |

<a name="_IMPLEMENT"></a>

## _IMPLEMENT(options) ⇒ <code>Object</code>
Generates a set of controller functions indexed by a standard set of properties

**Kind**: global function  
**Returns**: <code>Object</code> - A set of controller functions a express router if options.router was provided  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for the creation of model specific middleware |
| [options.override] | <code>Object</code> | A set of middleware functions that will be used in place of defaults |
| [options.override.new] | <code>function</code> | Override function for standard "new" view rendering function |
| [options.override.show] | <code>function</code> | Override function for standard "show" view rendering function |
| [options.override.edit] | <code>function</code> | Override function for standard "edit" view rendering function |
| [options.override.index] | <code>function</code> | Override function for standard "index" view rendering function |
| [options.override.remove] | <code>function</code> | Override function for standard "remove" middleware |
| [options.override.search] | <code>function</code> | Override function for standard "search" view rendering function |
| [options.override.create] | <code>function</code> | Override function for standard "create" middleware |
| [options.override.update] | <code>function</code> | Override function for standard "update" middleware |
| [options.override.load] | <code>function</code> | Override function for standard "load" middleware |
| [options.override.paginate] | <code>function</code> | Override function for standard "paginate" middleware |
| [options.router] | <code>Object</code> | An express router that routes will be appended on. If no router is provided routes will not be registered and only controller functions are returned |

<a name="composeMiddleware"></a>

## composeMiddleware(options) ⇒ <code>function</code>
A convenience method for creating view rendering middleware for a given model

**Kind**: global function  
**Returns**: <code>function</code> - Returns an express middleware function that will render a view dependent on options  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options |
| [options.fileext] | <code>string</code> | Defines the file extension of the view file being rendered |
| [options.viewname] | <code>string</code> | Defines the basename, partial path or full path of a view file |
| [options.themename] | <code>string</code> | Specifies a periodicjs theme folder that will be searched for a the view file |
| [options.basename] | <code>string</code> | If viewname is not provided basename is used to define a best guess viewname by combining options.model_name and options.basename |
| [options.model_name] | <code>string</code> | The name of the model that the middleware is being generated for |
| [options.protocol] | <code>Object</code> | A parent protocol adapter that must have a defined responder property |
| options.transform_data | <code>function</code> | A function for pulling data out of a request object and assigning it to an eventual response body |
| [options.strict] | <code>Boolean</code> | When falsy defined protocol responder will always be used instead of default HTML adapter. Default HTML adapter will also be ignored if protocol responder is an HTML adapter |

<a name="setViewModelProperties"></a>

## setViewModelProperties(model_name) ⇒ <code>Object</code>
Checks to see if active model label matches model name. If there is a match returns active model inflected name values otherwise generates expanded names from model name and sets value to active model

**Kind**: global function  
**Returns**: <code>Object</code> - Returns an object containing inflected string values  

| Param | Type | Description |
| --- | --- | --- |
| model_name | <code>string</code> | String value that should be inflected |

<a name="NEW"></a>

## NEW(options) ⇒ <code>function</code>
Generates middleware that will render the "new" view

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware function that will render "new" view  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for "new" view rendering |
| [options.use_plural_view_name] | <code>Boolean</code> | If true the plural value of the model name will be used in the view |
| options.template_ext | <code>string</code> | Used in specifying a custom file extension for view files |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |

<a name="SHOW"></a>

## SHOW(options) ⇒ <code>function</code>
Generates middleware that will render the "show" view

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware function that will render "show" view  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for "show" view rendering |
| [options.use_plural_view_name] | <code>Boolean</code> | If true the plural value of the model name will be used in the view |
| options.template_ext | <code>string</code> | Used in specifying a custom file extension for view files |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |

<a name="EDIT"></a>

## EDIT(options) ⇒ <code>function</code>
Generates middleware that will render the "edit" view

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware function that will render "edit" view  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for "edit" view rendering |
| [options.use_plural_view_name] | <code>Boolean</code> | If true the plural value of the model name will be used in the view |
| options.template_ext | <code>string</code> | Used in specifying a custom file extension for view files |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |

<a name="INDEX"></a>

## INDEX(options) ⇒ <code>function</code>
Generates middleware that will render the "index" view

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware function that will render "index" view  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for "index" view rendering |
| [options.use_plural_view_name] | <code>Boolean</code> | If true the plural value of the model name will be used in the view |
| options.template_ext | <code>string</code> | Used in specifying a custom file extension for view files |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |

<a name="REMOVE"></a>

## REMOVE(options) ⇒ <code>function</code>
Generates middleware that handles deleting items from a database

**Kind**: global function  
**Returns**: <code>function</code> - Returns middleware that handles deleting items  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for delete middleware |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |
| options.protocol | <code>Object</code> | A protocol adapter with a defined db property containing database adapters indexed by model name |

<a name="SEARCH"></a>

## SEARCH(options) ⇒ <code>function</code>
Generates middleware that handles rendering a view from paginated data

**Kind**: global function  
**Returns**: <code>function</code> - Returns middleware that handles rendering a view from paginated data  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for querying middleware |
| [options.use_plural_view_name] | <code>Boolean</code> | If true the plural value of the model name will be used in the view |
| options.template_ext | <code>string</code> | Used in specifying a custom file extension for view files |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |

<a name="CREATE"></a>

## CREATE(options) ⇒ <code>function</code>
Generates middleware that handles creating items in a database

**Kind**: global function  
**Returns**: <code>function</code> - Returns middleware that handles creating items  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for create middleware |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |
| options.protocol | <code>Object</code> | A protocol adapter with a defined db property containing database adapters indexed by model name |

<a name="UPDATE"></a>

## UPDATE(options) ⇒ <code>function</code>
Generates middleware that handles updating an item in a database

**Kind**: global function  
**Returns**: <code>function</code> - Returns middleware that handles updating items  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for delete middleware |
| options.model_name | <code>string</code> | Name of the model that the view middleware is being generated for |
| options.protocol | <code>Object</code> | A protocol adapter with a defined db property containing database adapters indexed by model name |

<a name="LOAD_WITH_COUNT"></a>

## LOAD_WITH_COUNT(options) ⇒ <code>function</code>
Generates middleware that sets a property on req.headers that specifies that query results should be paginated

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware that ensures that query results are paginated  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for generating middleware |
| options.model_name | <code>string</code> | Name of the model being queried |

<a name="LOAD_WITH_LIMIT"></a>

## LOAD_WITH_LIMIT(options) ⇒ <code>function</code>
Generates middleware that sets a default limit and starting page for paginated queries

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware that set default limit and starting page number params on req.query for paginated queries  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for generating middleware |

<a name="PAGINATE"></a>

## PAGINATE(options) ⇒ <code>function</code>
Generates middleware that handles querying a database and returning paginated data

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware function that will query the database and return paginated data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Configurable options for generating middleware for making queries that will return paginated data |
| options.protocol | <code>Object</code> |  | A protocol adapter with a defined db property containing database adapters indexed by model name |
| [options.query] | <code>Object</code> | <code>{}</code> | Sets a default query that should be used. This value is ignored if req.controllerData.model_query is set |
| [options.fields] | <code>Object</code> |  | A default set of fields to pull when middleware is called this value is ignored if req.controllerData.model_fields is set |
| [options.population] | <code>string</code> &#124; <code>Object</code> | <code>&quot;\&quot;\&quot;&quot;</code> | Population settings for model |

<a name="LOAD"></a>

## LOAD(options) ⇒ <code>function</code>
Generates middleware that handles querying for a single populated item

**Kind**: global function  
**Returns**: <code>function</code> - Returns a middleware function that will query the database for a single item which is populated by default  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options for load middleware |
| options.protocol | <code>Object</code> | A protocol adapter with a defined db property containing database adapters indexed by model name |

