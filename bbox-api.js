/*!
 * @brief Bbox Javascript API
 *
 * Copyright (c) 2013, 2014 Bouygues Telecom
 *
 * The computer program contained herein contains proprietary
 * information which is the property of Bouygues Telecom.
 * The program may be used and/or copied only with the written
 * permission of Bouygues Telecom or in accordance with the
 * terms and conditions stipulated in the agreement/contract under
 * which the programs have been supplied.
 *
 * @author Stephane Carrez <stcarrez@bouyguestelecom.fr>
 */
var Bbox = Bbox || {};

/**
 * @brief Format the speed in Mbps or Kbps.
 *
 * @param speed the speed to format.
 * @return the formatted speed to display.
 */
function formatSpeed(speed) {
    var n = (speed / 1024);

    if (parseInt(n) > 0) {
        return n.toFixed(2) + ' Mbps';
    } else {
        n = speed;
        return n.toFixed(2) + ' Kbps';
    }
}

function formatDecibel(db) {
    var n = (db / 10);

    return n.toFixed(1) + ' dB';
}

function formatDays(days) {
    if (days > 1) {
        return days + ' jours';
    } else if (days === 1) {
        return days + ' jour';
    } else {
        return '';
    }
}

// add the required nb of prefixed '0' :
function myNumFormat(number, ndigit) {
      var mys = number.toString();
      var prefix = '';
      var length = mys.length;
      for (var i=0; i< ndigit - length; i++) {
          prefix = prefix + '0';
      }
      mys = prefix + mys;
      
      return mys;
    };
    
    function formatTimeStamp(timet)
    {      
      var sadate= new Date(timet * 1000);
      var imonth = sadate.getMonth() + 1;
      var chaine;
      
      chaine = sadate.getDate() + '/' + myNumFormat(imonth,2) + '/' + sadate.getFullYear() + ' à ' + myNumFormat(sadate.getHours(),2) + ' H ' + myNumFormat(sadate.getMinutes(),2);

      return chaine;
    }

    function formatTimeStampInLetters(timet,withMin)
    {      
      var sadate= new Date(timet * 1000);
      var imonth = sadate.getMonth();
      var chaine;
      var tabMonth = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
      chaine = sadate.getDate() + ' ' + tabMonth[imonth] + ' ' + sadate.getFullYear();
      if(withMin) {
          chaine += ' à ' +
          myNumFormat(sadate.getHours(),2) + ' H ' + 
          myNumFormat(sadate.getMinutes(),2);
      }
      return chaine;
    }

/**
 * @brief Add spaces between each 2 char, starting from the end !
 *
 * @param the number as a string (phone number typically)
 * @return the formatted nb to display.
 * if first char is * #, ignore until next *; ignore  also last #/*
 */
function addspaceEach2(number) {
  var s = number + '';
  if (s.length > 4 && s.search(/[0-9]/) !== -1) {
    var i;
    var ms='';
    var last=0;
    var deb=0;
    if (s.substr(deb,1) === '*' || s.substr(deb,1) === '#') {
      // count how many leading char to put as-is
      deb++;
      while(s.substr(deb,1) !== '*' && s.substr(deb,1) !== '#' && deb < 6) {
    deb++;
      }
      deb++;
    }
    
    // check last char
    if (s.substr(s.length -1,1) === '*' || s.substr(s.length -1,1) === '#') {
      last=1;
      ms = s.substr(s.length -1,1);
    }
    
    for (i=s.length-2-last; i>=deb; i-=2) {
      ms = ' ' + s.substring(i, i + 2) + ms;
    }
    if ((s.length - deb - last) %2 !== 0) { // first char alone.
      ms = s.substr(deb,1) + ms;
    }
    if (deb !== 0) {
      ms = s.substr(0,deb) + ms;
    }
    s = ms;
  }
  
  return s;
}
    

function formatHours(days, hours) {
    if (hours > 1) {
        return hours + ' heures';
    } else if (hours === 1) {
        return hours + ' heure';
    } else if (days > 0) {
        return '0 heure';
    } else {
        return '';
    }
}

function formatMins(days, hours, mins) {
    if (mins > 1) {
        return mins + ' minutes';
    } else if (mins === 1) {
        return mins + ' minute';
    } else if ((hours > 0) || (days > 0)) {
        return '0 minute';
    } else {
        return '';
    }
}

$.support.cors = true;
Bbox.createApi = function() {
  var api = {
    fake: 0,
    lastError: null,

    /**
     * @brief The optional server URI part.
     */
    server: '',

    error : function(response, callback) {
        var result;

        if (response.status === 401) {
            Bbox.login();
        }
        if (response.status === 403 && Bbox.isRemote) {
            Bbox.errorRemote();
        }
        result = Bbox.api.default_error(response, callback);
        if (response.error !== 0 && response.status !== 0 && response.status !== 401 && !(response.status === 403 && Bbox.isRemote) && !Bbox.PendingErrors) {
            Bbox.printMessage('Erreur', Bbox.api.get_error_message(response.status, response.error),true);
        }
        if(response.status !== 200) {
            Bbox.PendingErrors = true;
        }
        else {
            Bbox.PendingErrors = false;
            setTimeout(Bbox.closeMessage, 5000);
        }
        return result;
    },
    /**
     * @brief Get the string value of an HTTP error
     *
     * @param status the HTTP status.
     * @param error the error string.
     * @return error message
     */
    get_error_message: function(status, error) {
        switch (status) {
            case 404:
                return Bbox.Messages.api_not_found_error;

            case 400:
                return Bbox.Messages.api_usage_error;

            case 401:
                return Bbox.Messages.api_unauthorized_error;

            case 403:
                if (Bbox.isRemote) {
                    return Bbox.Messages.api_remote_error;
                }
                return Bbox.Messages.api_forbidden_error;

            case 500:
                return Bbox.Messages.api_server_error;

            case 200:
                // Syntax error when extracting the data.
                return Bbox.Messages.api_internal_error + ': ' + error;

            default:
                return Bbox.Messages.connection_error + ' status ' + status;
        }
    },

    /**
     * @brief Handler called after a POST/GET operation failed.
     *
     * @param jqXHDR the XMLHttprequest object.
     * @param status the HTTP status.
     * @param error the error string.
     * @param url the API operation being called.
     * @param callback the API callback.
     * @return nothing
     */
    handle_error: function(jqXHDR, status, error, url, callback) {
        var result, api = this, response = {
            error: error === '' ? 'operation failed': error,
            message: api.get_error_message(jqXHDR.status, error),
            status: jqXHDR.status,
            contentType: jqXHDR.getResponseHeader('Content-type'),
            data: null
        };
        if (status === 0) {
            response.message = Bbox.Messages.api_timeout_error;
        }
        return api.error(response, callback);
    },

    /**
     * @brief Call a callback with a response to an ajax request as an argument
     *
     * @param response the response of an ajax request
     * @param callback the callback than will be invoked
     * @return the result of the callbak
     */
    default_error: function(response, callback) {
        return callback(response);
    },

    /**
     * @brief Post a request on the Bbox API
     *
     * @param op the type (GET,POST,PUT,DELETE) of the ajax opration
     * @param url the API URL (without the api/v1 prefix).
     * @param params the post parameters.
     * @param callback the callback operation invoked when the response is received.
     * @return nothing
     */
    operation: function(op, url, params, callback) {
        var api = this;
        var args = arguments;
        if (api.fake) {
            var response = {
                error: null,
                status: 200,
                contentType: 'application/json',
                data: [{ status: 1 }]
            };
            callback(response);
            return;
        }
        var p = params;
        if (typeof params === 'object') {
            var plist;
            p = '';
            for (var prop in params) {
                if ((typeof params[prop] !== 'undefined') && (params[prop] !== null)) {
                    if (p.length > 0) {
                        p = p + '&';
                    }
                    p = p + prop + '=' + encodeURIComponent(params[prop]);
                }
            }
        }
        jQuery.ajax({
            type: op,
            url: api.server + '/api/v1/' + url,
            data: p,
            context: document.body,
            crossDomain: true,
            xhrFields: {
                   withCredentials: true
            },
            headers: {
                'X-Requested-With': 'XmlHttpRequest'
            },
            /**
             * @brief call when the ajax request success
             *
             * @param data the data send to the ajax operation
             * @param status status of the ajax request
             * @param jqXDR ajax object
             * @return nothing
             */
            success: function(data, status, jqXHDR) {
                var response = {
                    error: null,
                    message: null,
                    status: jqXHDR.status,
                    contentType: jqXHDR.getResponseHeader('Content-type'),
                    location: jqXHDR.getResponseHeader('Location'),
                    data: data
                };
                if(Bbox.PendingErrors) {
                    Bbox.PendingErrors = false;
                    setTimeout(Bbox.closeMessage, 5000);
                }
                callback(response);
            },
            /**
             * @brief call when the ajax request failed
             *
             * @param jqXDR ajax object
             * @param status status of the ajax request
             * @param error type of error of the request
             * @return nothing
             */
            error: function(jqXHDR, status, error) {
                api.lastError = args;
                return api.handle_error(jqXHDR, status, error, url, callback);
            }
        });
    },

    /**
     * @brief Post a request on the Bbox API
     *
     * @param url the API URL (without the api/v1 prefix).
     * @param params the post parameters.
     * @param callback the callback operation invoked when the response is received.
     * @return the result of the ajax operation
     */
    post: function(url, params, callback) {
        return api.operation('POST', url, params, callback);
    },

    /**
     * @brief Execute a PUT operation on the Bbox API (update operation).
     *
     * @param url the API URL (without the api/v1 prefix).
     * @param params the post parameters.
     * @param callback the callback operation invoked when the response is received.
     * @return the result of the ajax operation
     */
    put: function(url, params, callback) {
        return api.operation('PUT', url, params, callback);
    },

    /**
     * @brief Execute a DELETE operation on the Bbox API.
     *
     * @param url the API URL (without the api/v1 prefix).
     * @param params the post parameters.
     * @param callback the callback operation invoked when the response is received.
     * @return the result of the ajax operation
     */
    remove: function(url, params, callback) {
        return api.operation('DELETE', url, params, callback);
    },

    /**
     * @brief Get a request on the Bbox API
     *
     * @param url the API URL (without the api/v1 prefix).
     * @param params the optional get parameters.
     * @param callback the callback operation invoked when the response is received.
     * @return nothing
     */
    get: function(url, params, callback) {
        var api = this;
        if (url.indexOf('http://') === - 1 && url.indexOf('https://') === - 1) {
            url = api.server + '/api/v1/' + url;
        }
        jQuery.ajax({
            type: 'GET',
            url: url + (params === null ? '' : '?' + params),
            context: document.body,
            cache: false,
            crossDomain: true,
            xhrFields: {
                   withCredentials: true
            },
            headers: {
                'X-Requested-With': 'XmlHttpRequest'
            },
            /**
             * @brief call when the ajax request success
             *
             * @param data the data send to the ajax operation
             * @param status status of the ajax request
             * @param jqXDR ajax object
             * @return nothing
             */
           success: function(data, status, jqXHDR) {
                var response = {
                    error: null,
                    message: null,
                    status: jqXHDR.status,
                    contentType: jqXHDR.getResponseHeader('Content-type'),
                    data: data
                };
                if(Bbox.PendingErrors) {
                    Bbox.PendingErrors = false;
                    setTimeout(Bbox.closeMessage, 5000);
                }
                callback(response);
            },
            /**
             * @brief call when the ajax request failed
             *
             * @param jqXDR ajax object
             * @param status status of the ajax request
             * @param error type of error of the request
             * @return nothing
             */
             error: function(jqXHDR, status, error) {
                return api.handle_error(jqXHDR, status, error, url, callback);
            }
        });
    },

    /**
     * @brief Login to the Bbox API.
     *
     * @param password the user password to login.
     * @param remember_me when set ask to remember the user on this browser.
     * @param callback the callback operation invoked when the response is received.
     * @return the result of a POST request
     */
    login: function(password, remember_me, callback) {
        return api.post('login', { password: password, remember: remember_me ? 1 : 0 }, callback);
    },
    /**
     * @brief call the put login api to refresh the cookie
     * @param callback function called at the end of the ajax request
     * @returns the result of the ajax request
     */
    refreshLogin: function(callback) {
        return api.put('login',null, callback);
    },

    voip: {
        /**
         * @brief Call a number
         * @param number the number to call
         * @return the result of the ajax operation
         */
        clicktocall: function(number, callback) {
          return api.put('voip/dial', 'line=1&number=' + number,callback);
        },
    },
    xdsl: {
        /**
         * @brief Get the xDSL informations.
         *
         * @param callback the callback operation invoked when the response is received.
         * @return the result of the ajax operation
         */
        info: function(callback) {
            return api.get('wan/xdsl', null, callback);
        },
    },
  };
  return api;
};

Bbox.api = Bbox.createApi();
if(location.protocol === "https:") {
	Bbox.api.server = 'https://bbox';
}
else {
	Bbox.api.server = 'http://bbox';
}
/*Pour contourner le bug safari mobile sur label.for*/
$('label').click(function() {});
