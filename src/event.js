var idOffset = 0, eventCallbacks = {};

function elementId(element) {
  return element['__yid__'] || (element['__yid__'] = ++idOffset);
}

fn.bind = function(type, data, callback) {
  this.on(type, null, data, callback);
};

fn.on = function(type, selector, data, callback) {
  if (isObj(type)) return keys(type).forEach(function(event) {
    this.on(event, selector, data, type[event]);
  }, this) || this;
  
  if (isNull(callback) && isFunc(data)) {
    if (isStr(selector)) { callback = data; data = null;  }
    else { callback = data; data = selector; selector = null; }
  }
  else if (isFunc(selector)) { callback = selector; selector = null; }
  
  type.split(/\s+/).forEach(function(type) {
    forEach.call(this, function(element) {
      var id = elementId(element), proxy;
      if ( ! (id in eventCallbacks)) eventCallbacks[id] = {};
      if ( ! (type in eventCallbacks[id])) eventCallbacks[id][type] = [];
      callback['__yid__'] = eventCallbacks[id][type].push(proxy = function(event) {
        if (selector && ! $(event.target).is(selector)) return;
        event.data = data;
        var params = [event].concat((event['params'] || []), data),
            result = isFunc(callback) ? callback.apply(event.target, params) : callback;
        if (result === false) event.preventDefault();
        return result;
      }) - 1;
      element.addEventListener(type, proxy);
    });
  }, this); return this;
};

fn.unbind = fn.off = function(type, callback) {
  var index = arguments.length ? callback['__yid__'] : false;
  if (isNull(index)) return this;
  forEach.call(this, function(element) {
    var id = elementId(element), proxies;
    if ( ! (id in eventCallbacks) ||  ! (type in eventCallbacks[id])) return;
    proxies = isNum(index) ? [eventCallbacks[id][type][index]] : eventCallbacks[id][type];
    proxies.forEach(function(proxy) {
      element.removeEventListener(type, proxy);
      delete eventCallbacks[id][type][index];
    });
  });
};

fn.trigger = function(event, params) {
  event = isObj(event) ? event : $.Event(event, params);
  forEach.call(this, function(element) {
    element.dispatchEvent(event);
  }); return this;
};

function eventTypeParameters(name, data) {
  
  switch (name) {
    case 'MouseEvent': return merge({
      'bubbles': true,
      'cancelable': true,
      'view': window,
      'detail': 0,
      'screenX': 0, 'screenY': 0,
      'clickX': 0, 'clickY': 0,
      'ctrlKey':  false, 'altKey': false, 'shiftKey': false, 'metaKey': false,
      'button': 0,
      'relatedTarget': null
    }, data);
    case 'KeyboardEvent': return merge({
      'bubbles': true,
      'cancelable': true,
      'view': window,
      'char': null,
      'key': null,
      'location': 0,
      'modifiersList': null,
      'repeat': false,
      'locale': null
    }, data);
    case 'FocusEvent': return merge({'deatil': 0}, data);
  }
}

$.eventTypes = {
  'MouseEvent': /^((dbl)?click$|mouse).*/i,
  'KeyboardEvent': /^(textInput$|key).*/i,
  'FocusEvent': /^(blur$|focus).*/i,
  'CustomEvent': /.+/
}

/**
 * @constructor
 * @param {string} type
 * @return {$.Event}
 */
$.Event = function(type, data) {
  var event;
  for (var name in $.eventTypes) { if ( ! $.eventTypes.hasOwnProperty(name)) continue;
    if ($.eventTypes[name].test(type)) {
      event = document.createEvent(name);
      event['init' + name].apply(event, [type].concat(values(eventTypeParameters(name, data))));
      break;
    }
  }
  return event;
};