/**
 * Note : these configuration are being monitored and the server
 *        will automatically reload them if the file is changed and
 *        saved.
 */


/**
 * Specify what interface and which port to listen to for incoming
 * HTTP connections.
 *
 *   host     may be null, or a dotted address of a network interface
 *   port     a (available) port number
 */ 
this.listen = {
	host: null,   // null=any, "xxx.xxx.xxx.xxx"=specific address
	port: 8090
};


/**
 * The request timeout defines how long a request can last. This
 * option can be reset from Application.setTimeout(ms) 
 *
 * TODO : implement request timeout in Application.handle()
 */
this.REQUEST_TIMEOUT = 1000 * 30;

/**
 * Define the logging level
 *
 *    LOG_NOTHING       do not log anything
 *    LOG_ALL           log everything
 *    LOG_DEBUG         log debug messages
 *    LOG_INFO          log information messages
 *    LOG_WARN          log warnings
 *    LOG_ERROR         log errors and exceptions
 */
this.LOG_LEVEL = LOG_ALL;

this.APP_PATH = "app";

/**
 * Packages options
 */
this.packages = {
	default: 'sys',
	index: 'index.js'
};


/**
 * Views options
 */
this.views = {
	basePath: this.APP_PATH + "/:package/views",
	suffix: "mu"
};

