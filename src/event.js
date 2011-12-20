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
        var result = isFunc(callback) ? callback.apply(event.target, [event].concat(data || [])) : callback;
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

$.Event = function(type, props) {
  var event;
  if (type.match(/^(click$|mouse).*/i) && (event = document.createEvent('MouseEvent')))
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  else if (type.match(/^(textInput$|key).*/i) && (event = document.createEvent('KeyBoardEvent')))
    event.initKeyEvent(type, true, true, null, false, false, false, false, 0, 0);
  else (event = document.createEvent('Events')).initEvent(type, true, true);
  if (isObj(props)) keys(props).forEach(function(key) { event[key] = props[key]; });
  return event;
};