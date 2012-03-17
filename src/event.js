/**
 * Gives a DOM node a unique identifier.
 * @param {Element} element
 * @return {number}
 * @private
 */
Yocto._elementId = function(element) {
  return element['__yid__'] || (element['__yid__'] = ++Yocto._elementIdOffset);
}

/**
 * @type {number}
 * @private
 */
Yocto._elementIdOffset = 0;

/**
 * @type {Object.<number,function(this:Element,Event)>}
 * @private
 */
Yocto._eventCallbacks = {};

/**
 * Binds to an event on all matched elements.
 * @public
 */
Yocto.prototype.bind = function(type, data, callback) {
  this.on(type, null, data, callback);
};

/**
 * Binds to an event on all matched elements.
 * @public
 */
Yocto.prototype.on = function(type, selector, data, callback) {
  if (Yocto.isObject(type)) return Yocto.keys(type).forEach(function(event) {
    this.on(event, selector, data, type[event]);
  }, this) || this;
  if (Yocto.isNull(callback) && Yocto.isFunction(data)) {
    if (Yocto.isString(selector)) { callback = data; data = null;  }
    else { callback = data; data = selector; selector = null; }
  }
  else if (Yocto.isFunction(selector)) { callback = selector; selector = null; }
  type.split(/\s+/).forEach(function(type) {
    this.forEach(function(element) {
      var id = Yocto._elementId(element), proxy;
      if ( ! (id in Yocto._eventCallbacks)) Yocto._eventCallbacks[id] = {};
      if ( ! (type in Yocto._eventCallbacks[id])) Yocto._eventCallbacks[id][type] = [];
      callback['__yid__'] = Yocto._eventCallbacks[id][type].push(proxy = function(event) {
        if (selector && ! $(event.target).is(selector)) return;
        event.data = data;
        var params = [event].concat((Array.isArray(event['data']) ? event['data'] : []), data),
            result = Yocto.isFunction(callback) ? callback.apply(event.target, params) : callback;
        if (result === false) event.preventDefault();
        return result;
      }) - 1;
      element.addEventListener(type, proxy);
    });
  }, this); return this;
};

Yocto.prototype.one = function(type, callback) {
  var self = this;
  this.bind(type, function() {
    callback.apply(this, Yocto.makeArray(arguments));
    self.unbind(type, callback);
  });
};

Yocto.prototype.off =
Yocto.prototype.unbind = function(type, callback) {
  var index = arguments.length ? callback['__yid__'] : false;
  if (Yocto.isNull(index)) return this;
  return this.forEach(function(element) {
    var id = Yocto._elementId(element), proxies;
    if ( ! (id in Yocto._eventCallbacks) ||  ! (type in Yocto._eventCallbacks[id])) return;
    proxies = Yocto.isNumber(index) ? [Yocto._eventCallbacks[id][type][index]] : Yocto._eventCallbacks[id][type];
    proxies.forEach(function(proxy) {
      element.removeEventListener(type, proxy);
      delete Yocto._eventCallbacks[id][type][index];
    });
  });
};

Yocto.prototype.trigger = function(event, params) {
  event = Yocto.isObject(event) ? event : Yocto.Event(event, params);
  this.forEach(function(element) {
    element.dispatchEvent(event);
  });
};

Yocto.prototype.remove = function() {
  return this.off() && this.detach();
}

/**
 * @constructor
 * @param {string} type
 * @return {Yocto.Event}
 */
Yocto.Event = function(type, data) {
  var event, types = {
    'MouseEvent': /^((?:dbl)?click$|mouse).*/i,
    'KeyboardEvent': /^(textInput$|key).*/i,
    'FocusEvent': /^(blur$|focus).*/i,
    'Event': /.+/
  }, match;
  Yocto.each(types, function(name, regex) {
    if (regex.test(type)) {
      var params = Yocto.extend({
        'bubbles': true,
        'cancalable': true
      }, data);
      
      if (name == 'MouseEvent') params = Yocto.extend({
        'view': document.defaultView,
        'detail': 0,
        'screenX': 0, 'screenY': 0,
        'clickX': 0, 'clickY': 0,
        'ctrlKey':  false, 'altKey': false, 'shiftKey': false, 'metaKey': false,
        'button': 0,
        'relatedTarget': null
      }, params);
      else if (name == 'KeyboardEvent') params = Yocto.extend({
        'view': document.defaultView,
        'char': null,
        'key': null,
        'location': 0,
        'modifiersList': null,
        'repeat': false,
        'locale': null,
        'relatedTarget': null
      }, params);
      else if (name.match(/(Focus)?Event/)) params = Yocto.extend({
        'deatil': (name == 'Event' ? null : 0)
      }, params);
      
      event = document.createEvent(name);
      event['init' + name].apply(event, [type].concat(Yocto.values(params)));
      event['data'] = data;
      
      return false;
    }
  });
  
  return event;
};