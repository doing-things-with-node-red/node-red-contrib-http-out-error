/* eslint-disable import/no-extraneous-dependencies */

const createError = require('http-errors');

module.exports = (RED) => {
  // Use code from Node-RED http-out node to parse msg Headers and Cookies
  function HTTPOut(msg) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (msg.headers) {
        if (msg.headers.hasOwnProperty('x-node-red-request-node')) {
            const headerHash = msg.headers['x-node-red-request-node'];
            delete msg.headers['x-node-red-request-node'];
            const hash = hashSum(msg.headers);
            if (hash === headerHash) {
                delete msg.headers;
            }
        }
        if (msg.headers) {
            for (const h in msg.headers) {
                if (msg.headers.hasOwnProperty(h) && !headers.hasOwnProperty(h)) {
                    headers[h] = msg.headers[h];
                }
            }
        }
        if (Object.keys(headers).length > 0) {
            msg.res._res.set(headers);
        }
    }
    if (msg.cookies) {
        for (const name in msg.cookies) {
            if (msg.cookies.hasOwnProperty(name)) {
                if (msg.cookies[name] === null || msg.cookies[name].value === null) {
                    if (msg.cookies[name]!==null) {
                        msg.res._res.clearCookie(name,msg.cookies[name]);
                    } else {
                        msg.res._res.clearCookie(name);
                    }
                } else if (typeof msg.cookies[name] === 'object') {
                    msg.res._res.cookie(name,msg.cookies[name].value,msg.cookies[name]);
                } else {
                    msg.res._res.cookie(name,msg.cookies[name]);
                }
            }
        }
    }
    return msg;
  }
  // Get httpError response by StatusCode
  function getHttpError(statusCode) {
      let httpError;
      switch(statusCode) {
          case 400: {
              httpError = createError.BadRequest();
              break;
          }
          case 401: {
            httpError = createError.Unauthorized();
            break;
          }
          case 402: {
            httpError = createError.PaymentRequired();
            break;
          }
          case 403: {
            httpError = createError.Forbidden();
            break;
          }
          case 404: {
            httpError = createError.NotFound();
            break;
          }
          case 405: {
            httpError = createError.MethodNotAllowed();
            break;
          }
          case 406: {
            httpError = createError.NotAcceptable();
            break;
          }
          case 407: {
            httpError = createError.ProxyAuthenticationRequired();
            break;
          }
          case 408: {
            httpError = createError.RequestTimeout();
            break;
          }
          case 409: {
            httpError = createError.Conflict();
            break;
          }
          case 410: {
            httpError = createError.Gone();
            break;
          }
          case 411: {
            httpError = createError.LengthRequired();
            break;
          }
          case 412: {
            httpError = createError.PreconditionFailed();
            break;
          }
          case 413: {
            httpError = createError.PayloadTooLarge();
            break;
          }
          case 414: {
            httpError = createError.URITooLong();
            break;
          }
          case 415: {
            httpError = createError.UnsupportedMediaType();
            break;
          }
          case 416: {
            httpError = createError.RangeNotSatisfiable();
            break;
          }
          case 417: {
            httpError = createError.ExpectationFailed();
            break;
          }
          case 418: {
            httpError = createError.ImATeapot();
            break;
          }
          case 421: {
            httpError = createError.MisdirectedRequest();
            break;
          }
          case 422: {
            httpError = createError.UnprocessableEntity();
            break;
          }
          case 423: {
            httpError = createError.Locked();
            break;
          }
          case 424: {
            httpError = createError.FailedDependency();
            break;
          }
          case 425: {
            httpError = createError.UnorderedCollection();
            break;
          }
          case 426: {
            httpError = createError.UpgradeRequired();
            break;
          }
          case 429: {
            httpError = createError.TooManyRequests();
            break;
          }
          case 431: {
            httpError = createError.RequestHeaderFieldsTooLarge();
            break;
          }
          case 451: {
            httpError = createError.UnavailableForLegalReasons();
            break;
          }
          case 501: {
            httpError = createError.NotImplemented();
            break;
          }
          case 502: {
            httpError = createError.BadGateway();
            break;
          }
          case 503: {
            httpError = createError.ServiceUnavailable();
            break;
          }
          case 504: {
            httpError = createError.GatewayTimeout();
            break;
          }
          case 505: {
            httpError = createError.HTTPVersionNotSupported();
            break;
          }
          case 506: {
            httpError = createError.VariantAlsoNegotiates();
            break;
          }
          case 507: {
            httpError = createError.InsufficientStorage();
            break;
          }
          case 508: {
            httpError = createError.LoopDetected();
            break;
          }
          case 509: {
            httpError = createError.BandwidthLimitExceeded();
            break;
          }
          case 510: {
            httpError = createError.NotExtended();
            break;
          }
          case 511: {
            httpError = createError.NetworkAuthenticationRequired();
            break;
          }
          case 500:
          default: {
            httpError = createError.InternalServerError();
            break;
          }
      }
      return { httpCode: statusCode, ...httpError };
  }
  function initNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.on('input', (msg) => {
      try {
        if (msg.res) {
            const statusCode = msg.statusCode >= 400 ? msg.statusCode : 500;
            const httpError = getHttpError(statusCode);
            // parse msg Headers and Cookies:
            msg = HTTPOut(msg);
            // Send response with our statusCode and our httpError message
            msg.res._res.status(statusCode).jsonp(httpError);
        } else {
            node.warn(RED._("httpouterrors.errors.no-response"));
        }
      } catch (err) {
        node.error(RED._(`httpouterrors.errors.exception: ${err.message || err}`));
      }
    });
  }
  RED.nodes.registerType('http-out-error', initNode);
};