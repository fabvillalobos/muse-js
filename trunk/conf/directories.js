/**
 * Note : this file is monitored and the server will automatically
 *        update itself reflecting changes to this file
 */

/**
 * Specify the document root; where static files are located
 */
global.DOCUMENT_ROOT = './pub';

/**
 * Directory options. These options define the behavior of
 * a given path under the document root. Any option is applied
 * from the root to the sub directory tree recursively. A given
 * file is not accessible if any option defined restrict access
 * to it.
 *
 * Possible options are
 *
 *       allow          If a function, a callback that will be
 *                      called if the path is accessed. The callback
 *                      will receive the actual ServerRequest object
 *                      and should return false explicitely to deny.
 *                      Any other value will be treated as allowed.
 *                      If any other value, if explitely set to
 *                      false, deny access. Allow otherwise.
 *
 *       ignore         any file matching this regular expression
 *                      will be hidden (as if they did not exist)
 *                      If this option is not defined, the default
 *                      regular expression is /(^\\.)/
 *
 *       index          if evaluated as true, and the request is
 *                      a directory, the content of the directory
 *                      will be listed and echoed to the client.
 */

this.directoryOptions = {
	'/': {
		allow: true,
		ignore: /(^\\.)/,
		index: true		
	}
};

