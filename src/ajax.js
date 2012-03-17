Yocto.ajaxSettings = {
  'type': 'GET',
  'async': true,
  'url': window.location.toString(),
  'beforeSend': null,
  'success': null,
  'error': null,
  'complete': null,
  'cache': true,
  'context': null,
  'global': true,
  'xhrFields': {},
  'xhr': function () {
    return new window.XMLHttpRequest();
  },
  'accepts': {
    'script': 'text/javascript, application/javascript',
    'json':   'application/json',
    'xml':    'application/xml, text/xml',
    'html':   'text/html',
    'text':   'text/plain'
  },
  'timeout': 0
};

Yocto.param = function(obj, prefix) {
  return Yocto.isObject(obj) ? Yocto.keys(obj).reduce(function(pairs, name) {
    var key = prefix ? prefix + (Yocto.isArray(obj) ? '[]' : '[' + encodeURIComponent(name) + ']') : encodeURIComponent(name), value = obj[name];
    return pairs.concat(Yocto.isObject(value) ? Yocto.param(value, key) : key + '=' + encodeURIComponent(value));
  }, []).join('&') : obj;
};

Yocto.deparam = function(query) {
  return query.split('&').reduce(function(obj, pair) {
    var parts = pair.split('='), path = parts[0].replace(/\[([^\]]+)\]/g, '.$1').split('.');
    return Yocto.extend(true, obj, path.reverse().reduce(function(value, key) {
      if(Yocto.isString(value)) value = decodeURIComponent(value);
      value = ! isNaN(value) ? Number(value) : /true|false/.test(value) ? value == 'true' : value == 'null' ? null : value;
      while (key.match(/\[\]$/))
        value = [value], key = key.substr(0, key.length - 2);
      pair = {}, pair[decodeURIComponent(key)] = value;
      return pair;
    }, decodeURIComponent(parts[1])));
  }, {});
};

Yocto._jsonpId = 0;

/**
 * @private
 */
Yocto._beforeSend = function(xhr, options) {
  if (options['global'] && ! Yocto.ajax.active)
    $(document).trigger('ajaxStart');

  var beforeSend = options['beforeSend'];
  if (Yocto.isFunction(beforeSend) && beforeSend.call(options['context'], xhr, options) === false)
    return false;

  Yocto.ajax.active++;
  options['global'] && $(document).trigger('ajaxSend', [xhr, options]);
}

/**
 * @private
 */
Yocto._ajaxSuccess = function(data, xhr, options) {
  var success = options['success'];
  Yocto.isFunction(success) && success.call(options['context'], data, 'success', xhr);
  options['global'] && $(document).trigger('ajaxSuccess', [data, 'success', xhr]);
  Yocto._ajaxComplete(xhr, options, 'success');
}

/**
 * @private
 */
Yocto._ajaxError = function(xhr, options, error, status) {
  var error = options['error'];
  Yocto.isFunction(error) && error.call(options['context'], xhr, options, error);
  options['global'] && $(document).trigger('ajaxError', [xhr, options, error]);
  Yocto._ajaxComplete(xhr, options, status);
}

/**
 * @private
 */
Yocto._ajaxComplete = function(xhr, options, status) {  
  var complete = options['complete'];
  Yocto.isFunction(complete) && complete.call(options['context'], xhr, options);
  options['global'] && $(document).trigger('ajaxSuccess', [xhr, options]);
  if ( ! --Yocto.ajax.active && options['global'])
    $(document).trigger('ajaxStop');
}

Yocto.ajax = function(url, options, success) {
  
  if (Yocto.isString(url)) (options = (options || {}))['url'] = url;
  else options = url, success = options;
  
  if (Yocto.isFunction(success))
    options['success'] = [success].concat(options['success']);
    
  if (options['dataType'] == 'jsonp' || options['dataType'] == 'script')
    options['async'] = true, options['cache'] = isNull(options['cache']) ? options['cache'] : false;

  options = Yocto.extend(Yocto.ajaxSettings, options);
  
  if ( ! ('crossDomain' in options))
    options['crossDomain'] = /^([\w-]+:)?\/\/([^\/]+)/.test(options['url']) && RegExp.$2 != window.location.host;
    
  if (/=\?/.test(options['url']))
    options['dataType'] = 'jsonp';
  
  if (options['data'] && ! options['contentType'])
    options['contentType'] = 'application/x-www-form-urlencoded';
  
  if (Yocto.isObject(options['data']))
    options['data'] = Yocto.param(options['data']);
    
  if (options['type'].match(/get/i) && options['data']) {
    var query = options['data'];
    options['url'] += options['url'].match(/\?.*=/) ? ('&' + query) : (query[0] != '?') ? ('?' + query) : query;
  }

  var protocol = /^([\w-]+:)\/\//.test(options['url']) ? RegExp.$1 : window.location.protocol
  
  if ( ! options['cache'] && /^http/.test(protocol))
    options['url'] += (/\.[^\?]+\?.+/g.test(options['url']) ? '?' : '&') + '_=' + (new Date()).getTime();
  
  if (options['dataType'] == 'jsonp')
  {
    var callback = '__jsonp' + (++Yocto._jsonpId),
        script = document.createElement('script'),
        timeout = options['timeout'] > 0 && setTimeout(function() {
          xhr['abort']();
          Yocto._ajaxError(null, options, null, 'timeout');
        }, options['timeout']),
        xhr = { 'abort': function() {
          document.head.removeChild(script);
          window[callback] = function(){};
        }};
    
    window[callback] = function(data) {
      timeout && clearTimeout(timeout);
      document.head.removeChild(script); delete window[callback];
      Yocto._ajaxSuccess(data, null, options);
    }
    
    if (Yocto._beforeSend(xhr, options) === false)
      return false;
    
    script.src = options['url'].replace(/=\?/, '=' + callback);
    document.head.appendChild(script);

    return xhr;
  }
  else
  {
    var mime = options['accepts'][options['dataType']],
    xhr = /** @type {XMLHttpRequest} */ Yocto.extend(options['xhr'](), options['xhrFields']), timeout, headers = {};
    
    if ( ! options['crossDomain'])
      headers['X-Requested-With'] = 'XMLHttpRequest';
    
    if (mime) {
      headers['Accept'] = mime;
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    
    headers = Yocto.extend(headers, options['headers']);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        clearTimeout(timeout);
        var result, error = false, status = 'success';
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          if (xhr.status == 304) status = 'notmodified';
          var ctype = xhr.getResponseHeader('content-type'), match, dtype = options['dataType'] ||
            (ctype ? (match = ctype.match(/^(?:application|text)\/(json|xml)/i)) && match[1] :
            (match = options['url'].match(/\.(json|xml)$/i)) && match[1]) || 'text';
          try {
              result = dtype === 'script' ? eval.call(window, xhr.responseText) :
                dtype == 'xml' ? xhr.responseXML :
                dtype == 'json' && ! (/^\s*$/.test(xhr.responseText)) ? JSON.parse(xhr.responseText) : xhr.responseText;
          } catch (e) { error = e; status = 'parseerror'; }

          if (error) Yocto._ajaxError(xhr, options, error, status);
          else Yocto._ajaxSuccess(result, xhr, options);
        }
        else Yocto._ajaxError(xhr, options, null, 'error');
      }
    };
    
    var abort = xhr.abort;
    xhr.abort = function() {
      abort.call(xhr);
      Yocto._ajaxError(xhr, options, null, 'abort');
    }
    
    if (Yocto._beforeSend(xhr, options) === false)
      return false;

    xhr.open(options['type'], options['url'], !! options['async'], options['username'], options['password']);
    
    if ('contentType' in options)
      headers['Content-Type'] = options['contentType'];
    
    Yocto.each(headers, function(name, value) {
      xhr.setRequestHeader(name, value);
    });
      
    if (options['timeout'] > 0)
      timeout = setTimeout(function() {
        xhr.onreadystatechange = null;
        abort.call(xhr);
        Yocto._ajaxError(xhr, options, null, 'timeout');
      }, options['timeout']);
      
    xhr.send(options['data']);
    return xhr;
  }
}

Yocto.ajax.active = 0;

Yocto.post = function(url, data, success, type) {
  if (Yocto.isFunction(data)) type = type || success, success = data, data = null;
  return Yocto.ajax({
    'type': 'POST',
    'url': url,
    'data': data,
    'success': success,
    'dataType': type
  });
};

Yocto.get = function(url, success, type){
  return Yocto.ajax({
    'type': 'GET',
    'url': url,
    'success': success,
    'dataType': type
  });
};

Yocto.getJSON = function(url, success){
  return Yocto.get(url, success, 'json');
};

Yocto.prototype.load = function(url, options, success) {
  if ( ! this.length) return this;
  if (Yocto.isFunction(options)) options = { 'success': options };
  var self = this, parts = url.split(/\s+/), selector;
  if (parts.length > 0) url = parts[0], selector = parts[1];
  Yocto.ajax(url, options, function(response) {
    self.html(selector ? $('<div>').html(response).find(selector).html() : response);
    success && success.call(self);
  }); return this;
};

/* Event Methods */
Yocto.prototype.ajaxStart = function(callback) {
  return $(document).bind('ajaxStart', function() {
    
  }, this);
};

Yocto.prototype.ajaxSend = function(callback) {
  var elements = this;
  $(document).bind('ajaxSend', function(event, xhr, options) {
    elements.forEach(function(element) {
      callback.call(element, event, xhr, options);
    });
  }, this); return elements;
};

Yocto.ajaxSuccess = function(callback) {
  return this.bind('ajaxSuccess', callback);
};

Yocto.ajaxError = function(callback) {
  return this.bind('ajaxError', callback);
};