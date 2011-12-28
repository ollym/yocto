/**
 * Yocto Core.js
 * Copyright (c) 2011 Oliver Morgan <oliver.morgan@kohark.com>
 * MIT License
 */
var FRAG_REGEX = /^\s*<(\w+)[^>]*>/,
    CLASS_REGEX = /^\.([\w\-]+)$/,
    ID_REGEX = /^#([\w\-]+)$/,
    TAG_REGEX = /^[\w\-]+$/,
    TABLE = document.createElement('table'),
    TBODY = document.createElement('tbody'),
    DIV = document.createElement('div'),
    TABLEROW = document.createElement('tr'),
    CONTAINERS = {
      'tr': TBODY,
      'tbody': TABLE, 'thead': TABLE, 'tfoot': TABLE,
      'td': TABLEROW, 'th': TABLEROW,
      'caption': TABLE, 'col': TABLE, 'colgroup': TABLE,
      '*': DIV
    };

/**
 * @typedef {(Window|Document|Element|Array.<Element>|string|Yocto|NodeList)}
 */
var Selector;

/* Object Short-hand Notations */
var $A  = Array, $O = Object, $S = String, $N = Number, $F = Function, $R = RegExp, $D = Date;
var $Ap = $A.prototype, $Op = $O.prototype;

/* Array Operators */
var slice   = $Ap.slice,
    concat  = $Ap.concat,
    splice  = $Ap.splice,
    filter  = $Ap.filter,
    reduce  = $Ap.reduce,
    map     = $Ap.map,
    every   = $Ap.every,
    some    = $Ap.some,
    indexOf = $Ap.indexOf,
    forEach = $Ap.forEach,
    pluck   = function(selector) {
      return map.call(this, function(value) {
        return value[selector];
      });
    },
    flatten = function(array) {
      return concat.apply([], slice.call(this));
    }

/* Object Operators */
var keys = $O.keys,
    values = function(obj) {
      return keys(obj).reduce(function(values, key) {
        return values.concat(obj[key]);
      }, []);
    },
    toString = $Op.toString.call;

/* Type Definitions */
var isArr   = $A.isArray,                                                   // is Array
    isObj   = function(v) { return typeof v === 'object'; },                // is Object
    isStr   = function(v) { return typeof v === 'string'; },                // is String                 
    isFunc  = function(v) { return typeof v === 'function'; },              // is Function               
    isNum   = function(v) { return ! isNaN(v); },                           // is Number or Decimal      
    isNull  = function(v) { return v === undefined || v === null; },        // is Undefined or Null      
    isEmpty = function(v) { return (isArr(v) && a.length === 0) || (!v) },  // is Empty string or array  
    isEnum  = function(v) { return v && v.constructor === $O },             // is Enumerable object      
    isBool  = function(v) { return typeof v === 'boolean'; };               // is Boolean                

/* Type Definition Casters/Getters */
var Arr = function(v) { return flatten.call(arguments); },
    Str = String, Num = $N,
    Obj = function(v) { keys(v).reduce(function(a,b) { a[b] = v[b]; return a; }, {}); };
    
/* Utility Methods */
var clean   = function(v) { return v.filter(function(e) { return ! (isNull(e) || (isStr(e) && e.trim() == '')); }); },
    uniq    = function(a) { return isArr(a) ? a.filter(function(v,i) { return a.indexOf(v) === i }) : a; },
    merge   = function(a,b) {
      if (isNull(b)) return a;
      return uniq(keys(a).concat(keys(b))).reduce(function(o,k) {
        o[k] = (k in b && b[k] !== undefined) ? b[k] : a[k];
        return o;
      }, {});
    };
    
/* Pre-Processors */
var fragment = function(html, name) {
  isNull(name) && FRAG_REGEX.test(html) && $R.$1;
  var container = CONTAINERS[name] || CONTAINERS['*'];
  container.innerHTML = ''+html;
  return slice.call(container.childNodes);
};

/* Utility Methods */
var getComputedStyle = document.defaultView.getComputedStyle;
var defaultDisplay = {},
    getDeafultDisplay = function(node, style) {
      var tag = node.tagName;
      if ( ! tag in defaultDisplay) {
        var element = document.body.appendChild(document.createElement(tag)),
            style = getComputedStyle(element, null).getPropertyValue('display');
        element.parentNode.removeChild(element);
        display == 'none' && (display = 'block');
        defaultDisplay[tag] = display;
      } return deafultDisplay[tag];
    };
    
/* String Formatters */
var camelize = function(str)  { return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
var dasherize = function(str){
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

/**
 * @constructor
 * @param {(Selector|Element|Object|Array.<Element>|Yocto|string|function())=} selector
 * @param {(Element|Yocto|Document|Object.<string, (string|function(Yocto.event=))>)=} context
 * @param {Yocto=} prevObject
 * @return {Yocto}
 */
function Yocto(selector, context, prevObject) {
  if (this instanceof Yocto) {
    this.selector = selector || '';
    this.prevObject = prevObject;
  }
  else if ( ! selector) {
    var dom = [];
    dom.__proto__ = new Yocto;
    return dom;
  }
  else if (selector instanceof Yocto) return selector;
  else if ( ! isNull(context)) return $(context).find(selector);
  else if (isFunc(selector)) return $(document).ready(selector);
  else {
    var dom = null;
    if (isArr(selector))
      dom = clean(selector).reduce(function(a,b) {
        return concat.apply(a, $(b));
      }, []);
    else if ( !!~ [1,9,11].indexOf(selector.nodeType) || selector === window)
      dom = [selector], selector = null;
    else if (FRAG_REGEX.test(selector))
      dom = fragment(selector.trim(), $R.$1), selector = null;
    else if (selector.nodeType === 3)
      dom = [selector], selector = null;
    else dom = $.qsa(selector);
    
    dom.__proto__ = new $(selector, context, prevObject);
    return dom;
  }
}

var $ = (window['Yocto'] = window['$'] = Yocto);

$.extend = merge;

/**
 * @param {string} selector
 * @param {Element=} context
 * @return {Array.<Element>}
 */
Yocto.qsa = function(selector, context) {
  var result; context = context || document;
  if (context === document && ID_REGEX.test(selector) && (result = document.getElementById($R.$1)))
    return result ? [result] : [];
  else return slice.call(
    CLASS_REGEX.test(selector) ? context.getElementsByClassName($R.$1) :
    TAG_REGEX.test(selector) ? context.getElementsByTagName(selector) :
    context.querySelectorAll(selector)
  );
};

var fn = Yocto.prototype = Yocto.fn = {
  pluck: function(value) {
    return pluck.call(this, value);
  },
  indexOf: function(value) {
    return indexOf.call(this, value);
  },
  some: function(selector, thisArg) {
    return some.call(this, function(element, index, obj) {
      return $(element).is(isFunc(selector) ? function() {
        return selector.call(thisArg || element, element, index, obj);
      } : selector, obj);
    });
  },
  reduce: function(callback, initial) {
    return $(reduce.call(this, function(a,b,i,o) {
        return callback.call(b,a,b,i,o);
      }, initial || []), null, this);
  },
  concat: function() {
    return $([this].concat(slice.call(arguments)), null, this);
  },
  
  /**
   * @param {number} start
   * @param {number=} end
   * @return {Yocto}
   */
  slice: function(start, end) {
    return $(slice.call(this, start, end), null, this);
  },
  
  /**
   * @param {(Selector|function(this:Element,number)|Element|Yocto)} selector
   * @return {jQuery}
   */
  filter: function(selector) {
    return $(filter.call(this, function(element, index) {
      return $(element).is(isFunc(selector) ? function() {
        return selector.call(element, index);
      } : selector);
    }), null, this);
  },
  
  /**
   * @param {function(this:Element,number,Element)} callback
   * @return {Yocto}
   */
  map: function(callback) {
    return $(map.call(this, function(element, index) {
      return callback.call(element, index, element);
    }), null, this);
  },
  
  /**
   * @param {number=} index
   * @return {(Element|Array.<Element>)}
   */
  get: function(index) {
    return isNull(index) ? this : this[index];
  },
  
  /**
   * @param {function()} handler
   * @return {jQuery}
   */
  ready: function(callback) {
    if (/complete|loaded|interactive/.test(document.readyState)) callback();
    else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false);
    return this;
  },
  
  /** @return {number} */
  size: function() {
    return this.length;
  },
  
  /**
   * @param {Selector=} selector
   * @return {Yocto}
   */
  detach: function(selector) {
    forEach.call(this.filter(selector), function(element, index) {
      element.parentNode && element.parentNode.removeChild(element);
    });
    return this;
  },
  
  /**
   * @param {function(this:Element,number,Element)} callback
   * @return {Yocto}
   */
  each: function(callback, thisArg) {
    for (var i = 0, obj = this; i < obj.length; i++)
      if (callback.call(obj[i], i, obj[i]) === false) break;
    return this;
  },
  
  /** @return {Yocto} */
  end: function() {
    return this.prevObject || new Yocto;
  },
  
  /** @return {Yocto} */
  andSelf: function() {
    return this.add(this.end());
  },
  
  /**
   * @param {Selector} selector
   * @param {Element=} context
   * @return {Yocto}
   */
  add: function(selector, context) {
    return $(uniq(concat.call(this, $(selector, context))), null, this);
  },
  
  /**
   * @param {(Selector|function(this:Element,number)} selector
   * @return {boolean}
   */
  is: function(selector) {
    if (isNull(selector)) return true;
    if (selector instanceof Yocto)
      return selector.length === this.length && every.call(this, function(element) {
        return ~ this.indexOf(element); }, this);
    return every.call(this, isFunc(selector) ? 
      function(element, index, obj) { return selector.call(element, index); } : 
      function(element, index) {
        return isStr(selector) ? (element['matchesSelector'] || element['webkitMatchesSelector'] || element['mozMatchesSelector'] || element['oMatchesSelector'] || function(selector) {
          return !!~ $.qsa(selector, element.parentNode).indexOf(element);
        }).call(element, selector) : element === selector;
      });
  },
  
  /**
   * @param {Selector} selector
   * @param {Element=} context
   * @return {Yocto}
   */
  not: function(selector) {
    return this.filter(function(index) {
      return ! $(this).is(selector);
    }, this);
  },
  
  /**
   * @param {number} index
   * @return {Yocto}
   */
  eq: function(index) {
    return index === -1 ? this.slice(index) : this.slice(index, $N(index) + 1);
  },
  
  /**
   * @param {Selector} selector
   * @return {Yocto}
   */
  first: function(selector) {
    for (var i = 0, e = $(this[i], null, this); i < this.length; e = $(this[++i], null, this))
      if (e.is(selector)) return e;
    return $(null, null, this);
  },
  
  /**
   * @param {Selector} selector
   * @return {Yocto}
   */
  last: function(selector) {
    for (var i = this.length-1, e = $(this[i], null, this); i >= 0; e = $(this[--i], null, this))
      if (e.is(selector)) return e;
    return $(null, null, this);
  },
  
  /**
   * @param {Selector} selector
   * @return {Yocto}
   */
  find: function(selector) {
    var context = this;
    return context.reduce(function(array, element) {
      return uniq(array.concat($.qsa(selector, element)));
    });
  },
  
  /**
   * @param {Selector} selector
   * @param {Element=} context
   * @return {Yocto}
   */
  closest: function(selector, context) {
    var candidates = $.qsa(selector, context), node = this[0];
    if (isNull(selector) || candidates.length === 0)
      return $(null, null, this);
    while (node && candidates.indexOf(node) < 0)
      node = node !== context && node !== document && node.parentNode;
    return $(node, null, this);
  },
  
  /**
   * @param {Selector=} selector
   * @return {Yocto}
   */
  parents: function(selector) {
    return this.reduce(function(ancestors, node) {
      while ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0)
        if ($(node).is(selector)) ancestors.push(node)
      return ancestors;
    });
  },
  
  /**
   * @param {Selector=} selector
   * @return {Yocto}
   */
  parent: function(selector) {
    return this.reduce(function(parents, node) {
      return parents.indexOf(node.parentNode) < 0 && $(node.parentNode).is(selector) ?
        parents.concat(node.parentNode) : parents;
    });
  },
  
  /**
   * @param {Selector=} selector
   * @return {Yocto}
   */
  children: function(selector) {
    return this.reduce(function(children, node) {
      return children.concat(filter.call(node.children, function(child) {
        return children.indexOf(child) < 0 && $(child).is(selector);
      }));
    });
  },
  
  /**
   * @param {Selector=} selector
   * @return {Yocto}
   */
  siblings: function(selector) {
    return this.reduce(function(siblings, node) {
      return siblings.concat(node.parentNode ? filter.call(node.parentNode.children, function(child) {
        return siblings.indexOf(child) < 0 && child !== node && $(child).is(selector);
      }) : undefined);
    })
  },
  
  /** @return {Yocto} */
  empty: function() {
    return forEach.call(this, function(node) { node.innerHTML = '' }) || this;
  },
  
  /** @return {Yocto} */
  show: function() {
    return this.each(function(index, element) {
      element.style.visibility = 'visible';
      element.style.display == 'none' && (this.style.display = null);
      if (getComputedStyle(element, null).getPropertyValue('display') == 'none')
        element.style.display = getDefaultDisplay(element.tagName);
    });
  },
  
  /** @return {Yocto} */
  hide: function() {
    return this.css('display', 'none');
  },
  
  /**
   * @param {Selector|function(this:Element,number)} elements
   * @param {number} action
   * @return {Yocto}
   */
  insert: function(elements, action) {
    forEach.call(this, function(target, index) {
      elements = $(isFunc(elements) ? elements.call(target, index) : elements), action = isNull(action) ? 3 : action;
      forEach.call(elements, function(element) {
        var parent = (action % 2) ? target : target.parentNode;
        parent && parent.insertBefore(element.cloneNode(true),
          ! action ? target.nextSibling : action == 1 ? parent.firstChild : action == 2 ? target : null);
      });
    }); return this;
  },
    
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  after: function(selector) {
    this.insert(isFunc(selector) ? selector : flatten.call(arguments), 0); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  prepend: function(selector) {
    this.insert(isFunc(selector) ? selector : flatten.call(arguments), 1); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  before: function(selector) {
    this.insert(isFunc(selector) ? selector : flatten.call(arguments), 2); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  append: function(selector) {
    this.insert(isFunc(selector) ? selector : flatten.call(arguments), 3); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  insertAfter: function(selector) {
    $(selector).insert(this, 0); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  prependTo: function(selector) {
    $(selector).insert(this, 1); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  insertBefore: function(selector) {
    $(selector).insert(this, 2); return this;
  },
  
  /**
   * @param {Selector|function(this:Element,number)} selector
   * @return {Yocto}
   */
  appendTo: function(selector) {
    $(selector).insert(this, 3); return this;
  },
  
  /**
   * @param {Selector} context
   * @return {Yocto}
   */
  replaceWith: function(context) {
    forEach.call(this, function(element) {
      $(element).before(context).detach();
    }); return this;
  },
  
  /**
   * @param {Selector} selector
   * @return {Yocto}
   */
  wrap: function(selector) {
    var wrap = $(selector)[0];
    forEach.call(this, function(element) {
      var context = $(wrap.cloneNode(true)).append(element);
      $(element).replaceWith(context);
    }); return this;
  },
  
  /**
   * @param {Selector} selector
   * @return {Yocto}
   */
  wrapAll: function(selector) {
    var highest, height, length;
    forEach.call(this, function(element) {
      length = $(element).parents().length;
      if ( ! height || length < height)
        highest = element, height = length;
    }); return $(highest).wrap(selector);
  },
  
  /**
   * @param {Selector} selector
   * @return {Yocto}
   */
  wrapInner: function(selector) {
    this.children().wrap(selector); return this;
  },
  
  /** @return {Yocto} */
  unwrap: function() {
    forEach.call(this.parent(), function(parent) {
      $(parent).replaceWith($(parent).children());
    }); return this;
  },
  
  /**
   * @param {(string|Object.<string,*>)} property
   * @param {(string|number|function(this:Element,number,*))=} value
   * @return {(string|Yocto)}
   */
  css: function(property, value) {
    if (value === undefined) {
      if (isStr(property))
        return this.length == 0 ? undefined :
          this[0].style[camelize(property)] || getComputedStyle(this[0], null).getPropertyValue(property);
      else if (isEnum(property))
        keys(property).forEach(function(key) {
          this.css(key, property[key]);
        }, this);
    } else forEach.call(this, function(element, index) {
      value = isFunc(value) ? value.call(element, index, $(element).css(property)) : value;
      if (isNum(value) && ! property.match(/column(s|count)|columns|font-weight|line-height|opacity|z-index|zoom/gi))
        value += 'px';
      element.style[camelize(property)] = isFunc(value) ? value.call(element, index, $(element).css(property)) : value;
    });
    return this;
  },
  
  /** @return {boolean} */
  visible: function() {
    return this.css('visibility') != 'hidden' && this.css('display') != 'none';
  },
  
  /**
   * @param {boolean=} show
   * @return {Yocto}
   */
  toggle: function(show) {
    forEach.call(this, function(element) {
      element = $(element);
      (isNull(show) ? $(element).visible() : !show) ? $(element).hide() : $(element).show();
    }); return this;
  },
  
  /** @return {Yocto} */
  prev: function() {
    return $(pluck.call(this, 'previousElementSibling'), null, this);
  },
  
  /** @return {Yocto} */
  next: function() {
    return $(pluck.call(this, 'nextElementSibling'), null, this);
  },
  
  /**
   * @param {(Yocto|string|function(this:Element,number,string))=} string
   * @return {(string|Yocto)}
   */
  html: function(string) {
    return arguments.length ? forEach.call(this, function(element, index) {
      $(element).empty().append(isFunc(string) ? string.call(element, index, element.innerHTML) : string);
    }) || this : this[0].innerHTML;
  },
  
  /**
   * @param {(string|function(this:Element,number,string))=} string
   * @return {(string|Yocto)}
   */
  text: function(string) {
    return arguments.length ? forEach.call(this, function(element, index) {
      element.textContent = isFunc(string) ? string.call(element, index, element.innerHTML) : string;
    }) || this : this[0].textContent;
  },
  
  /**
   * @param {(string|Object.<string,*>)} name
   * @param {(string|number|function(this:Element,number,string))=} value
   * @return {(string|Yocto)}
   */
  attr: function(name, value) {
    if (arguments.length == 1 && isStr(name))
      return (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
        this[0].getAttribute(name) || this[0][name] || '';
    else forEach.call(this, function(element, index, obj) {
      if (isObj(name)) keys(name).forEach(function(key) { obj.attr(key, name[key]); });
      else element.setAttribute(name, isFunc(value) ? value.call(element, index, $(element).attr(name)) : value);
    }); return this;
  },
  
  /**
   * @param {string} name
   * @return {Yocto}
   */
  removeAttr: function(name) {
    var attributes = isStr(name) ? name.split(/\s+/) : Arr(name);
    forEach.call(this, function(element) {
      attributes.forEach(function(attr) {
        element.removeAttribute(attr);
      });
    }); return this;
  },
  
  /**
   * @param {(string|function(this:Element,number,*))=} value
   * @return {(string|number|Array.<string>|Yocto)}
   */
  val: function(value) {
    return arguments.length ?
      forEach.call(this, function(element, index) {
        value = isFunc(value) ? value.call(element, index, $(element).val()) : value;
        if (element.multiple && (value = Arr(value)))
          forEach.call(element.options, function(option) {
            option.selected = !!~ value.indexOf(option.value);
          });
        else element.value = value;
      }) || this : (this.length > 0 ? this[0].multiple ?
        pluck.call(filter.call(this[0].options, function(option) { return option.selected; }), 'value') : this[0].value : null);
  },
  
  /** @return {{left:number,top:number,width:number,height:number}} */
  offset: function() {
    if (this.length == 0) return null;
    var rect = this[0] == window ? { 'left':0, 'top':0, 'width':window.innerWidth, 'height':window.innerHeight } :
      (this[0] == document ? document.documentElement : this[0]).getBoundingClientRect();
    return {
      'left': rect.left + window.pageXOffset,
      'top': rect.top + window.pageYOffset,
      'width': rect.width,
      'height': rect.height
    };
  },
  
  /**
   * @param {(Selector)=} selector
   * @return {number}
   */
  index: function(selector) {
    if ( ! arguments.length) return this.parent().children().indexOf(this[0]);
    for (var i = 0; i < this.length; i++)
      if ($(this[i]).is(selector)) return i;
    return -1;
  },
  
  /**
   * @param {string} name
   * @return {boolean}
   */
  hasClass: function(name) {
    return !! ~ this[0].className.split(/\s+/).indexOf(name);
  },
  
  /**
   * @param {(string|function(this:Element,number,string))} name
   * @return {Yocto}
   */
  addClass: function(name) {
    forEach.call(this, function(element, index, obj) {
      element.className = uniq(clean((element.className + ' ' + (isFunc(name) ?
        name.call(element, index, element.className) : name)).split(/\s+/))).join(' ').trim();
    }); return this;
  },
  
  /**
   * @param {(string|function(this:Element,number,string))} name
   * @return {Yocto}
   */
  removeClass: function(name) {
    forEach.call(this, function(element, index, obj) {
      var classes = (isFunc(name) ? name.call(element, index, element, obj) : name).split(/\s+/),
          classList = element.className.split(/\s+/), index;
      classes.forEach(function(klass) {
        ( ~ (index = classList.indexOf(klass))) && classList.splice(index, 1);
      });
      element.className = classList.join(' ').trim();
    }); return this;
  },
  
  /**
   * @param {(string|boolean|function(this:Element,number,string,boolean))=} name
   * @param {boolean=} add
   * @return {Yocto}
   */
  toggleClass: function(name, add) {
    forEach.call(this, function(element, index) {
      var classes = isFunc(name) ? name.call(element, index, element.className, add) : name, e = $(element);
      classes.split(/\s+/).forEach(function(klass) {
        (isBool(add) ? add : ! e.hasClass(klass)) ? e.addClass(klass) : e.removeClass(klass);
      });
    });
  },
  
  /** @return {number} */
  width: function(value) {
    return arguments.length ? this.css('width', value) : this.offset().width;
  },
  
  /** @return {number} */
  height: function(value) {
    return arguments.length ? this.css('height', value) : this.offset().height;
  }
};

/* Dynamic Definitions & Aliases */
Yocto.prototype.some = Yocto.prototype.is;
Yocto.prototype.remove = Yocto.prototype.detach;