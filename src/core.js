/**
 * Yocto Core.js
 * Copyright (c) 2011 Oliver Morgan <oliver.morgan@kohark.com>
 * MIT License
 */
 
/**
 * @typedef {(Window|HTMLDocument|Element|Array.<Element>|string|Yocto|NodeList)}
 */
var Selector;

/**
 * @constructor
 * @param {Selector=} selector
 * @param {Selector=} context
 * @param {Yocto=} prevObject
 * @return {Yocto}
 * @extends {Array.<Element>}
 * @notypecheck
 */
var Yocto = function(selector, context, prevObject) {
  
  if ( ! (this instanceof Yocto))
    return new Yocto(selector, context, prevObject);
  
  this.selector = selector || '';
  this.prevObject = prevObject;

  var dom = [], match;

  if ( ! selector) {
    dom.__proto__ = this;
    return dom;
  }
  else if (selector instanceof Yocto) return selector;
  else if ( ! Yocto.isNull(context)) return Yocto(context).find(selector);
  else if (Yocto.isFunction(selector))
    return Yocto(document).ready(selector);
  else {
    if (Yocto.isArray(selector))
      /** @notypecheck */
      dom = Yocto.clean(selector).reduce(function(a,b) {
        return Array.prototype.concat.apply(a, Yocto(b));
      }, []);
    else if ( !!~ [1,9,11].indexOf(selector.nodeType) || selector === window)
      dom = [selector], this.selector = null;
    else if (selector.nodeType === 3)
      dom = [selector], this.selector = null;
    else if (Yocto.isString(selector)) {
      if (match = selector.match(/^\s*<(\w+)[^>]*>/))
        dom = Yocto._fragments(selector.trim(), match[1]), this.selector = null;
      else dom = Yocto.selectAll(selector);
    }
    
    dom.__proto__ = this;
    return dom;
  }
}

Yocto.keys    = Object.keys,
Yocto.isArray = Array.isArray;
Yocto.makeArray = function(input) {
  return Array.prototype.slice.call(input);
}

/**
 * @param {string} name
 * @this {Array}
 */
Yocto.pluck = function(array, name) {
  return Array.prototype.map.call(array, function(value) {
    return value[name];
  });
};

/**
 * @return Array
 * @this Array
 */
Yocto.flatten = function(array) {
  return Array.prototype.concat.apply([], Array.prototype.slice.call(array || this));
};

/**
 * @param {!Object} obj
 * @return {Array}
 */
Yocto.values = function(obj) {
  return Yocto.keys(obj).reduce(function(values, key) {
    return values.concat(obj[key]);
  }, []);
};

/**
 * @param {Object|Array} obj
 * @param {function(string,*,Array|Object)} callback
 */
Yocto.each = function(obj, callback) {
  if ( ! obj) return obj;
  for(var i = 0, keys = Yocto.keys(obj); i < keys.length; i++)
    if (callback.call(obj[keys[i]], keys[i], obj[keys[i]], obj) === false)
      break;
  return obj;
};

/**
 * is Undefined
 * @param {*} value
 * @return {boolean}
 */
Yocto.isUndefined = function(value) { return typeof value === 'undefined'; };

/**
 * is Object
 * @param {*} value
 * @return {boolean}
 */
Yocto.isObject = function(value) { return typeof value === 'object'; };

/**
 * is String
 * @param {*} value
 * @return {boolean}
 */
Yocto.isString = function(value) { return typeof value === 'string'; };

/**
 * is Function
 * @param {*} value
 * @return {boolean}
 */               
Yocto.isFunction = function(value) { return typeof value === 'function'; };

/**
 * is Number
 * @param {*} value
 * @return {boolean}
 */
Yocto.isNumber = function(value) { return ! isNaN(value); };

/**
 * is Null or Undefined
 * @param {*} value
 * @return {boolean}
 */
Yocto.isNull = function(value) { return value === undefined || value === null; };

/**
 * is Empty array or falsifies.
 * @param {*} value
 * @return {boolean}
 */
Yocto.isEmpty = function(value) { return (Yocto.isArray(value) && value.length === 0) || ( ! value) };

/**
 * is Empty array or falsifies.
 * @param {*} value
 * @return {boolean}
 */
Yocto.isBoolean = function(value) { return typeof value === 'boolean'; };   

/**
 * Removes null entries and trims strings
 * @param {Array} array
 * @return {Array}
 */
Yocto.clean = function(array) {
  return array.filter(function(value) {
    return ! (Yocto.isNull(value) || (Yocto.isString(value) && value.trim() == ''));
  });
};

/**
 * Removes duplicates within the array
 * @param {Array} array
 * @return {Array}
 */
Yocto.unique = function(array) {
  return array.filter(function(value, index) {
    return array.indexOf(value) == index;
  });
}

/**
 * Removes duplicates within the array
 * @param {!Object} a
 * @param {!Object} b
 * @return {Object}
 */
Yocto.extend = function(deep) {
  var objects = Array.prototype.slice.call(arguments);
  deep = Yocto.isBoolean(deep) ? objects.shift() : false;
  return objects.reduce(function(group, obj) {
    Yocto.each(obj, function(key, val) {
      group[key] = deep ? ([group[key], val].every(Yocto.isArray) ? group[key].concat(val) :
        [group[key], val].every(Yocto.isObject) ? Yocto.extend(true, group[key], val) : val) : val;
    }); return group;
  }, {});
}

/**
 * Takes an html string and generates a element subtree.
 * @param {string} html
 * @param {string=} name
 * @return {Array.<Element>}
 * @private
 */
Yocto._fragments = function(html, name) {
  var /** @type {Array.<string>} */ match;
  if (Yocto.isNull(name) && (match = html.match(/^\s*<(\w+)[^>]*>/))) name = match[1];
  var container = document.createElement({
    'tr': 'tbody',
    'tbody': 'table',
    'thead': 'table',
    'tfoot': 'table',
    'td': 'tr',
    'th': 'tr',
    'caption': 'table',
    'col': 'table',
    'colgroup': 'table',
    'option': 'select',
    'optgroup': 'select',
    'dt': 'dl', 'dd': 'dl'
  }[name] || 'div');
  container.innerHTML = ''+html;
  return Array.prototype.slice.call(container.childNodes);
};

Yocto._getComputedStyle = document.defaultView.getComputedStyle;

/**
 * A cache of default displays for element tags
 * @enum {string}
 * @private
 */
Yocto._defaultDisplay = {};

/**
 * Gets the default display for a specific element.
 * @private
 * @param {Element} node
 * @return {string}
 */
Yocto._getDeafultDisplay = function(node) {
  var tag = node.tagName;
  if ( ! tag in defaultDisplay) {
    var element = document.body.appendChild(document.createElement(tag)),
        style = Yocto._getComputedStyle(element, null).getPropertyValue('display');
    element.parentNode.removeChild(element);
    display == 'none' && (display = 'block');
    defaultDisplay[tag] = display;
  } return deafultDisplay[tag];
};
    
/**
 * foo-bar => fooBar
 * @private
 * @param {string} str
 * @return {string}
 */
Yocto._camelize = function(str)  {
  return str.replace(/-+(.)?/g, function(match, chr) {
    return chr ? chr.toUpperCase() : ''
  })
};

/**
 * fooBar => foo-bar
 * @private
 * @param {string} str
 * @return {string}
 */
Yocto._dasherize = function(str){
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

/**
 * @param {string} selector
 * @param {(Element|HTMLDocument)=} context
 * @return {Array.<Element>}
 */
Yocto.selectAll = function(selector, context) {
  if (Yocto.isEmpty(selector)) return [];
  var result; context = context || document; var /** @type {Array.<string>} */ match;
  if (context === document && (match = selector.match(/^#([\w\-]+)$/)) && (result = document.getElementById(match[1])))
    return result ? [result] : [];
  else return Array.prototype.slice.call(
    (match = selector.match(/^\.([\w\-]+)$/)) ? context.getElementsByClassName(match[1]) :
    (match = selector.match(/^([\w\-]+)$/)) ? context.getElementsByTagName(match[1]) :
    context.querySelectorAll(selector));
};

/**
 * @param {function(Element,number,Yocto)} callback
 * @return {Yocto}
 */
Yocto.prototype.forEach = function(callback) {
  return Array.prototype.forEach.call(this, callback) || this;
};
  
/**
 * @param {string} value
 * @return {Array} 
 */
Yocto.prototype.pluck = function(value) {
  return Yocto.pluck(this, value);
};
  
/**
 * @param {Element} value
 * @return {number}
 */
Yocto.prototype.indexOf = function(value) {
  return Array.prototype.indexOf.call(this, value);
};

/**
 * @param {function(this:Element,*,*,number,Yocto)} callback
 * @param {*=} initial
 * @return {Yocto}
 */
Yocto.prototype.reduce = function(callback, initial) {
  return Yocto(Array.prototype.reduce.call(this, function(memo, value, index, obj) {
    return callback.call(value, memo, value, index, obj);
  }, initial || []), null, this);
};
  
/**
 * @param {number} start
 * @param {number=} end
 * @return {Yocto}
 */
Yocto.prototype.slice = function(start, end) {
  return Yocto(Array.prototype.slice.call(this, start, end), null, this);
};
  
/**
 * @param {(Selector|function(this:Element,number)|Element|Yocto)=} selector
 * @return {Yocto}
 */
Yocto.prototype.filter = function(selector) {
  return Yocto(Array.prototype.filter.call(this, function(element, index) {
    return Yocto(element).is(Yocto.isFunction(selector) ? function() {
      return selector.call(element, index);
    } : selector);
  }), null, this);
};
  
/**
 * @param {function(this:Element,number,Element)} callback
 * @return {Yocto}
 */
Yocto.prototype.map = function(callback) {
  return Yocto(Array.prototype.map.call(this, function(element, index) {
    return callback.call(element, index, element);
  }), null, this);
};
  
/**
 * @param {number=} index
 * @return {(Element|Array.<Element>)}
 */
Yocto.prototype.get = function(index) {
  return Yocto.isNull(index) ? this : this[index];
};

/**
 * @param {function()=} callback
 * @return {Yocto}
 */
Yocto.prototype.ready = function(callback) {
  if (/complete|loaded|interactive/.test(document.readyState)) callback();
  else document.addEventListener('DOMContentLoaded', function() { callback(); }, false);
  return this;
};

/** @return {number} */
Yocto.prototype.size = function() {
  return this.length;
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.detach = function(selector) {
  this.filter(selector).forEach(function(element, index) {
    element.parentNode && element.parentNode.removeChild(element);
  }); return this;
};

/**
 * @param {function(this:Element,number,Element)} callback
 * @return {Yocto}
 */
Yocto.prototype.each = function(callback, thisArg) {
  for (var i = 0, obj = this; i < obj.length; i++)
    if (callback.call(obj[i], i, obj[i]) === false) break;
  return this;
};

/** @return {Yocto} */
Yocto.prototype.end = function() {
  return this.prevObject || Yocto();
};

/** @return {Yocto} */
Yocto.prototype.andSelf = function() {
  return this.add(this.end());
};

/**
 * @param {Selector=} selector
 * @param {Element=} context
 * @return {Yocto}
 */
Yocto.prototype.add = function(selector, context) {
  return Yocto(Array.prototype.concat.call(this, Yocto(selector, context)), null, this);
};

/**
 * @param {(Selector|function(this:Element,number))=} selector
 * @return {boolean}
 */
Yocto.prototype.some =
Yocto.prototype.is = function(selector) {
  if (Yocto.isNull(selector)) return true;
  if (selector instanceof Yocto)
    return selector.length === this.length && Array.prototype.every.call(this, function(element) {
      return ~ this.indexOf(element); }, this);
  return Array.prototype.every.call(this, Yocto.isFunction(selector) ? 
    function(element, index, obj) { return selector.call(element, index); } : 
    function(element, index) {
      return Yocto.isString(selector) ? (element['matchesSelector'] || element['webkitMatchesSelector'] || element['mozMatchesSelector'] || element['oMatchesSelector'] || function(selector) {
        return !!~ Yocto.selectAll(selector, element.parentNode).indexOf(element);
      }).call(element, selector) : element === selector;
    });
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.not = function(selector) {
  return this.filter(function(index) {
    return ! Yocto(this).is(selector);
  });
};

/**
 * @param {!number} index
 * @return {Yocto}
 */
Yocto.prototype.eq = function(index) {
  return index === -1 ? this.slice(index) : this.slice(index, Number(index) + 1);
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.first = function(selector) {
  for (var i = 0, e = Yocto(this[i], null, this); i < this.length; e = Yocto(this[++i], null, this))
    if (e.is(selector)) return e;
  return Yocto(null, null, this);
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.last = function(selector) {
  for (var i = this.length-1, e = Yocto(this[i], null, this); i >= 0; e = Yocto(this[--i], null, this))
    if (e.is(selector)) return e;
  return Yocto(null, null, this);
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.find = function(selector) {
  return this.reduce(function(/** @type {Array.<Element>} */ array, /** @type {Element} */ element) {
    return Yocto.unique(array.concat(Yocto.selectAll(selector, element)));
  });
};

/**
 * @param {string} selector
 * @param {Element=} context
 * @return {Yocto}
 */
Yocto.prototype.closest = function(selector, context) {
  var candidates = Yocto.selectAll(selector, context), node = this[0];
  if (Yocto.isNull(selector) || candidates.length === 0)
    return Yocto(null, null, this);
  while (node && candidates.indexOf(node) < 0)
    node = node !== context && node !== document && node.parentNode;
  return Yocto(node, null, this);
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.parents = function(selector) {
  return this.reduce(function(ancestors, node) {
    while ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0)
      if (Yocto(node).is(selector)) ancestors.push(node)
    return ancestors;
  });
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.parent = function(selector) {
  return this.reduce(function(parents, node) {
    return parents.indexOf(node.parentNode) < 0 && Yocto(node.parentNode).is(selector) ?
      parents.concat(node.parentNode) : parents;
  });
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.children = function(selector) {
  return this.reduce(function(children, node) {
    return children.concat(Array.prototype.filter.call(node.children, function(child) {
      return children.indexOf(child) < 0 && Yocto(child).is(selector);
    }));
  });
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.siblings = function(selector) {
  return this.reduce(function(siblings, node) {
    return siblings.concat(node.parentNode ? Array.prototype.filter.call(node.parentNode.children, function(child) {
      return siblings.indexOf(child) < 0 && child !== node && Yocto(child).is(selector);
    }) : undefined);
  })
};

/** @return {Yocto} */
Yocto.prototype.empty = function() {
  return this.forEach(function(node) { node.innerHTML = '' });
};

/** @return {Yocto} */
Yocto.prototype.show = function() {
  return this.forEach(function(element) {
    element.style.visibility = 'visible';
    element.style.display == 'none' && (element.style.display = null);
    if (getComputedStyle(element, null).getPropertyValue('display') == 'none')
      element.style.display = getDefaultDisplay(element.tagName);
  });
};

/** @return {Yocto} */
Yocto.prototype.hide = function() {
  return this.css('display', 'none');
};

/**
 * @param {(Selector|function(this:Element,number))=} elements
 * @param {number=} action
 * @return {Yocto}
 */
Yocto.prototype.insert = function(elements, action) {
  action = Yocto.isNull(action) ? 3 : action;
  return this.forEach(function(target, index) {
    Yocto(Yocto.isFunction(elements) ? elements.call(target, index) : elements).forEach(function(element) {
      var parent = (action % 2) ? target : target.parentNode;
      parent && parent.insertBefore(element.cloneNode(true),
        ! action ? target.nextSibling : action == 1 ? parent.firstChild : action == 2 ? target : null);
    });
  });
};

/**
 * @param {(Selector|function(this:Element,number))=} selector
 * @return {Yocto}
 */
Yocto.prototype.after = function(selector) {
  return this.insert(Yocto.isFunction(selector) ? selector : Yocto.flatten(arguments), 0);
};

/**
 * @param {(Selector|function(this:Element,number))=} selector
 * @return {Yocto}
 */
Yocto.prototype.prepend = function(selector) {
  return this.insert(Yocto.isFunction(selector) ? selector : Yocto.flatten(arguments), 1);
};

/**
 * @param {(Selector|function(this:Element,number))=} selector
 * @return {Yocto}
 */
Yocto.prototype.before = function(selector) {
  return this.insert(Yocto.isFunction(selector) ? selector : Yocto.flatten(arguments), 2);
};

/**
 * @param {(Selector|function(this:Element,number))=} selector
 * @return {Yocto}
 */
Yocto.prototype.append = function(selector) {
  return this.insert(Yocto.isFunction(selector) ? selector : Yocto.flatten(arguments), 3);
};

/**
 * @param {Selector} selector
 * @return {Yocto}
 */
Yocto.prototype.insertAfter = function(selector) {
  Yocto(selector).insert(this, 0); return this;
};

/**
 * @param {Selector} selector
 * @return {Yocto}
 */
Yocto.prototype.prependTo = function(selector) {
  Yocto(selector).insert(this, 1); return this;
};

/**
 * @param {Selector} selector
 * @return {Yocto}
 */
Yocto.prototype.insertBefore = function(selector) {
  Yocto(selector).insert(this, 2); return this;
};

/**
 * @param {Selector} selector
 * @return {Yocto}
 */
Yocto.prototype.appendTo = function(selector) {
  Yocto(selector).insert(this, 3); return this;
};

/**
 * @param {Selector=} context
 * @return {Yocto}
 */
Yocto.prototype.replaceWith = function(context) {
  return this.forEach(function(element) {
    Yocto(element).before(context).detach();
  });
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.wrap = function(selector) {
  var wrap = Yocto(selector)[0];
  return this.forEach(function(element) {
    var context = Yocto(wrap.cloneNode(true)).append(element);
    Yocto(element).replaceWith(context);
  });
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.wrapAll = function(selector) {
  var highest, height, length;
  this.forEach(function(element) {
    length = Yocto(element).parents().length;
    if ( ! height || length < height)
      highest = element, height = length;
  });
  return Yocto(highest).wrap(selector);
};

/**
 * @param {Selector=} selector
 * @return {Yocto}
 */
Yocto.prototype.wrapInner = function(selector) {
  this.children().wrap(selector); return this;
};

/** @return {Yocto} */
Yocto.prototype.unwrap = function() {
  this.parent().forEach(function(parent) {
    Yocto(parent).replaceWith(Yocto(parent).children());
  }); return this;
};

/**
 * @param {!(string|Object.<string,*>)} property
 * @param {(string|number|function(this:Element,number,*))=} value
 * @return {(string|Yocto)}
 */
Yocto.prototype.css = function(property, value) {
  if (value === undefined) {
    if (Yocto.isString(property))
      return this.length == 0 ? undefined :
        this[0].style[Yocto._camelize(property)] || getComputedStyle(this[0], null).getPropertyValue(property);
    else if (Yocto.isObject(property))
      Yocto.keys(property).forEach(function(key) {
        this.css(key, property[key]);
      }, this);
  } else this.forEach(function(element, index) {
    value = Yocto.isFunction(value) ? value.call(element, index, Yocto(element).css(property)) : value;
    if (Yocto.isNumber(value) && ! property.match(/column(s|count)|columns|font-weight|line-height|opacity|z-index|zoom/gi))
      value += 'px';
    element.style[Yocto._camelize(property)] = Yocto.isFunction(value) ? value.call(element, index, Yocto(element).css(property)) : value;
  });
  return this;
};

/** @return {boolean} */
Yocto.prototype.visible = function() {
  return this.css('visibility') != 'hidden' && this.css('display') != 'none';
};

/**
 * @param {boolean=} show
 * @return {Yocto}
 */
Yocto.prototype.toggle = function(show) {
  return this.forEach(function(element) {
    element = Yocto(element);
    (Yocto.isNull(show) ? Yocto(element).visible() : !show) ? Yocto(element).hide() : Yocto(element).show();
  });
};

/** @return {Yocto} */
Yocto.prototype.prev = function() {
  return Yocto(Yocto.pluck(this, 'previousElementSibling'), null, this);
};

/** @return {Yocto} */
Yocto.prototype.next = function() {
  return Yocto(Yocto.pluck(this, 'nextElementSibling'), null, this);
};

/**
 * @param {(Yocto|string|function(this:Element,number,string))=} string
 * @return {(string|Yocto)}
 */
Yocto.prototype.html = function(string) {
  return arguments.length ? this.forEach(function(element, index) {
    Yocto(element).empty().append(Yocto.isFunction(string) ? string.call(element, index, element.innerHTML) : string);
  }) : this[0].innerHTML;
};

/**
 * @param {(string|function(this:Element,number,string))=} string
 * @return {(string|Yocto)}
 */
Yocto.prototype.text = function(string) {
  return arguments.length ? this.forEach(function(element, index) {
    element.textContent = Yocto.isFunction(string) ? string.call(element, index, element.innerHTML) : string;
  }) : this[0].textContent;
};

/**
 * @param {(string|!Object.<string,*>)} name
 * @param {(string|number|function(this:Element,number,string)):string=} value
 * @return {(string|Yocto)}
 */
Yocto.prototype.attr = function(name, value) {
  return (arguments.length == 1 && Yocto.isString(name)) ?
    (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
      this[0].getAttribute(name) || this[0][name] || '' :
    this.forEach(function(element, index, obj) {
      if (Yocto.isObject(name)) Yocto.keys(name).forEach(function(key) { obj.attr(key, name[key]); });
      else element.setAttribute(name, Yocto.isFunction(value) ? value.call(element, index, Yocto(element).attr(name)) : value);
    });
};

/**
 * @param {string} name
 * @return {Yocto}
 */
Yocto.prototype.removeAttr = function(name) {
  var attributes = Yocto.isString(name) ? name.split(/\s+/) : Yocto.flatten(name);
  return this.forEach(function(element) {
    attributes.forEach(function(attr) {
      element.removeAttribute(attr);
    });
  });
};

/**
 * @param {(string|function(this:Element,number,*))=} value
 * @return {(string|number|Array.<string>|Yocto)}
 */
Yocto.prototype.val = function(value) {
  return arguments.length ?
    this.forEach(function(element, index) {
      value = Yocto.isFunction(value) ? value.call(element, index, Yocto(element).val()) : value;
      if (element.multiple && (value = [].concat(value)))
        Array.prototype.forEach.call(element.options, function(option) {
          option.selected = !!~ value.indexOf(option.value);
        });
      else element.value = value;
    }) : (this.length > 0 ? this[0].multiple ?
      Yocto.pluck(Array.prototype.filter.call(this[0].options, function(option) { return option.selected; }), 'value') : this[0].value : null);
};

/** @return {?{left:number,top:number,width:number,height:number}} */
Yocto.prototype.offset = function() {
  if (this.length == 0) return null;
  var rect = this[0] == window ? { 'left':0, 'top':0, 'width':window.innerWidth, 'height':window.innerHeight } :
    (this[0] == document ? document.documentElement : this[0]).getBoundingClientRect();
  return {
    'left': rect.left + window.pageXOffset,
    'top': rect.top + window.pageYOffset,
    'width': rect.width,
    'height': rect.height
  };
};

/**
 * @param {(Selector)=} selector
 * @return {number}
 */
Yocto.prototype.index = function(selector) {
  if ( ! arguments.length) return this.parent().children().indexOf(this[0]);
  for (var i = 0; i < this.length; i++)
    if (Yocto(this[i]).is(selector)) return i;
  return -1;
};

/**
 * @param {string} name
 * @return {boolean}
 */
Yocto.prototype.hasClass = function(name) {
  return !! ~ this[0].className.split(/\s+/).indexOf(name);
};

/**
 * @param {(string|function(this:Element,number,string))} name
 * @return {Yocto}
 */
Yocto.prototype.addClass = function(name) {
  return this.forEach(function(element, index, obj) {
    element.className = Yocto.unique(Yocto.clean((element.className + ' ' + (Yocto.isFunction(name) ?
      name.call(element, index, element.className) : name)).split(/\s+/))).join(' ').trim();
  });
};

/**
 * @param {(string|function(this:Element,number,string))} name
 * @return {Yocto}
 */
Yocto.prototype.removeClass = function(name) {
  return this.forEach(function(element, index, obj) {
    var classes = (Yocto.isFunction(name) ? name.call(element, index, element, obj) : name).split(/\s+/),
        classList = element.className.split(/\s+/), index;
    classes.forEach(function(klass) {
      ( ~ (index = classList.indexOf(klass))) && classList.splice(index, 1);
    });
    element.className = classList.join(' ').trim();
  });
};

/**
 * @param {(string|boolean|function(this:Element,number,string,boolean))=} name
 * @param {boolean=} add
 * @return {Yocto}
 */
Yocto.prototype.toggleClass = function(name, add) {
  return this.forEach(function(element, index) {
    var classes = Yocto.isFunction(name) ? name.call(element, index, element.className, add) : name, e = Yocto(element);
    classes.split(/\s+/).forEach(function(klass) {
      (Yocto.isBoolean(add) ? add : ! e.hasClass(klass)) ? e.addClass(klass) : e.removeClass(klass);
    });
  });
};

/** @return {number} */
Yocto.prototype.width = function(value) {
  return Number(arguments.length ? this.css('width', value) : this.offset().width);
};

/** @return {number} */
Yocto.prototype.height = function(value) {
  return Number(arguments.length ? this.css('height', value) : this.offset().height);
}