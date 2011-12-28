$.ajaxSettings = {
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
  'crossDomain': false,
  'timeout': 0
};

var jsonpId = 0;

function ajaxBeforeSend(xhr, options) {
  if (options['global'] && ! $.ajax.active)
    $(document).trigger('ajaxStart');
  
  var beforeSend = options['beforeSend'];
  if (isFunc(beforeSend) && beforeSend.call(options['context'], xhr, options) === false)
    return false;
  
  $.ajax.active++;
  options['global'] && $(document).trigger('ajaxSend', [xhr, options]);
}

function ajaxSuccess(data, xhr, options) {
  
  options['success'].call(options['context'], data, 'success', xhr);
  options['complete'].call(options['context'], data, 'success', xhr);
  
  $.ajax.active--;
}

function ajaxError() {
  
}
function ajaxStop() {
  
}

function ajaxComplete(xhr, options, status) {
  
}

$.ajax = function(url, options, success) {
  
  if (isStr(url)) (options = (options || {}))['url'] = url;
  else options = url, success = options;
  
  if (isFunc(success))
    options['success'] = [success].concat(options['success']);
    
  if (options['dataType'] == 'jsonp' || options['dataType'] == 'script')
    options['async'] = true, options['cache'] = isNull(options['cache']) ? options['cache'] : false;

  options = merge($.ajaxSettings, options);
  
  if (options[''])
  
  if ( ! options['crossDomain'])
    options['crossDomain'] = /^([\w-]+:)?\/\/([^\/]+)/.test(options['url']) && RegExp.$2 != window.location.host;
    
  if (/=\?/.test(options['url']))
    options['dataType'] = 'jsonp';
  
  if (options['data'] && ! options['contentType'])
    options['contentType'] = 'application/x-www-form-urlencoded';
  
  if (isObj(options['data']))
    options['data'] = $.param(options['data']);
    
  if (options['type'].match(/get/i) && options['data']) {
    var query = options['data'];
    options['url'] += options['url'].match(/\?.*=/) ? ('&' + query) : (query[0] != '?') ? ('?' + query) : query;
  }

  var protocol = /^([\w-]+:)\/\//.test(options['url']) ? RegExp.$1 : window.location.protocol
  
  if ( ! options['cache'] && /^http/.test(protocol))
    options['url'] += (/\.[^\?]+\?.+/g.test(options['url']) ? '?' : '&') + '_=' + (new Date()).getTime();
  
  if (options['dataType'] == 'jsonp')
  {
    var callback = '__jsonp' + (++jsonpId),
        script = document.createElement('script'),
        timeout = options['timeout'] > 0 && setTimeout(function() {
          abort();
          ajaxError(null, options, null, 'timeout');
        }, options['timeout']),
        abort = function() {
          $(script).remove();
          window[callback] = function(){};
        };
    
    window[callback] = function(data) {
      timeout && clearTimeout(timeout);
      $(script).remove(), delete window[callback];
      ajaxSuccess(data, null, options);
    }
    
    script.src = options['url'].replace(/=\?/, '=' + callback);
    $('head').append(script);

    return;
  }
  else
  {
    var mime = options['accepts'][options['dataType']],
    xhr = /** @type {XMLHttpRequest} */ options['xhr'](), timeout, headers = {};
  
    if ( ! options['crossDomain'])
      headers['X-Requested-With'] = 'XMLHttpRequest';
    
    if (mime) {
      headers['Accept'] = mime;
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    
    headers = merge(headers, options.headers);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        clearTimeout(timeout);
        var result, error = false, status = 'success';
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          if (xhr.status == 304) status = 'notmodified';
          var ctype = xhr.getResponseHeader('content-type'), dtype = options['dataType'] ||
            (/^(text|application)\/javascript/i.test(ctype) ? 'script' :
             /^application\/json/i.test(ctype) ? 'json' :
             /^(application|text)\/xml/i.test(ctype) ? 'xml' :
             /^text\/html/i.test(ctype) === 'text/html' ? 'html' : 'text');
          try {
              result = dtype === 'script' ? eval.call(window, xhr.responseText) :
                dtype === 'xml' ? xhr.responseXML :
                dtype === 'json' && ! (/^\s*$/.test(xhr.responseText)) ? JSON.parse(xhr.responseText) : xhr.responseText;
          } catch (e) { error = e; status = 'parseerror'; }
          
          if (error) ajaxError(xhr, options, error, status);
          else ajaxSuccess(xhr, options, status);
        }
        else ajaxError(xhr, options, null, 'error');
      }
    };
    
    var abort = xhr.abort;
    xhr.abort = function() {
      abort.call(xhr);
      ajaxError(xhr, options, null, 'abort');
    }
    
    if (ajaxBeforeSend(xhr, options) === false)
      return false;
    
    xhr.open(options['type'], options['url'], !! options['async'], options['username'], options['password']);
    
    if ('Content-Type' in options)
      headers['Content-Type'] = options['Content-Type'];
      
    for (var name in headers)
      xhr.setRequestHeader(name, headers[name]);
      
    if (options['timeout'] > 0)
      timeout = setTimeout(function() {
        xhr.onreadystatechange = null;
        abort.call(xhr);
        ajaxError(xhr, options, null, 'timeout');
      }, options['timeout']);
      
    xhr.send(options['data']);
    return xhr;
  }
}

$.ajax.active = 0;

$.post = function(url, data, success, type){
  if (isFunc(data)) type = type || success, success = data, data = null;
  return $.ajax({ 'type': 'POST', 'url': url, 'data': data, 'success': success, 'dataType': type });
};

$.get = function(url, success, type){
  return $.ajax({ 'type': 'GET', 'url': url, 'success': success, 'dataType': type });
};

$.getJSON = function(url, success){
  return $.get(url, success, 'json');
};

fn.load = function(url, options, success) {
  if ( ! this.length) return this;
  if (isFunc(options)) options = { 'success': options };
  var self = this, parts = url.split(/\s+/), selector;
  if (parts.length > 0) url = parts[0], selector = parts[1];
  $.ajax(url, options, function(response) {
    self.html(selector ? $('<div>').html(response).find(selector).html() : response);
    success && success.call(self);
  }); return this;
};

var esc = encodeURIComponent;
$.query = function(obj, prefix) {
  return isObj(obj) ? keys(obj).reduce(function(pairs, name) {
    var key = prefix ? prefix + (isArr(obj) ? '[]' : '[' + esc(name) + ']') : esc(name), value = obj[name];
    return pairs.concat(isObj(value) ? param(value, key) : key + '=' + esc(value));
  }, []).join('&') : obj;
};