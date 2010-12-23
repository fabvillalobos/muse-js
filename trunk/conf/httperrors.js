/**
 * Note : this file is monitored and the server will automatically
 *        update itself reflecting changes to this file
 */


this.DEFAULT_MESSAGE = "Ooops! An error have occured!";

/**
 * the default view should be located inside the 'sys' package
 */
this.DEFAULT_VIEW = "errors/default.html";

/**
 * See : http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */
this.Codes = {
	// 1xx - informational
	100: "Continue",
	//101: "Switching Protocols",
	//102: "Processing",  // WebDav

	// 2xx - Success
	200: "Ok",
	201: "Created",
	202: "Accepted",
	203: "Non-Authoritative Information",
	204: "No content",
	//205: "Reset content",
	//206: "Partial content",
	//207: "Multi-status",    // WebDav
	
	// 3xx - Redirection
	300: "Multiple choices",
	301: "Moved Permanently",
	302: "Found",
	//303: "See other",
	//304: "Not modified",
	//305: "Use Proxy",
	//306: "Switch Proxy",
	307: "Temporary Redirect",
	
	// 4xx - Client error
	400: "Bad request",
	401: "Unauthorized",
	402: "Payment Required",
	403: "Forbidden",
	404: "Not found",
	405: "Method not allowed",
	406: "Not acceptable",
	//407: "Proxy Authentication Required",
	408: "Request timeout",
	409: "Conflict",
	410: "Gone",
	411: "Length Required",
	412: "Precondition Failed",
	413: "Request Entity Too Large",
	414: "Request-URI Too Long",
	//415: "Unsupported Media Type",
	416: "Requested Range Not Satisfiable",
	417: "Expectation Failed",
	//418: "I'm a teapot", 
	//422: "Unprocessable Entity",   // WebDav
	//423: "Locked",  // WebDav
	//424: "Failed Dependency",   // WebDav
	//425: "Unordered Collection",   // WebDav
	426: "Upgrade Required",      // switch (to newer) protocol
	//449: "Retry With",    // Ex: "Retry with a different browser"
	//450: "Blocked by Windows Parental Controls",
	499: "Client Closed Request",
	
	// 5xx - Server Error
	500: "Internal Server Error",
	501: "Not Implemented",
	502: "Bad Gateway",
	503: "Service Unavailable",
	504: "Gateway Timeout",
	505: "HTTP Version Not Supported",
	506: "Variant Also Negotiates",
	//507: "Insufficient Storage",  // WebDav
	//509: "Bandwidth Limit Exceeded",   // Apache bw/limited extension
	510: "Not Extended"
};
