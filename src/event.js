/**
 * Yocto Event.js
 * Copyright (c) 2011 Oliver Morgan <oliver.morgan@kohark.com>
 * MIT License
 */
 
 function add(element, events, fn, selector, getDelegate){
   var id = zid(element), set = (handlers[id] || (handlers[id] = []));
   eachEvent(events, fn, function(event, fn){
     var delegate = getDelegate && getDelegate(fn, event),
       callback = delegate || fn;
     var proxyfn = function (event) {
       var result = callback.apply(element, [event].concat(event.data));
       if (result === false) event.preventDefault();
       return result;
     };
     var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length});
     set.push(handler);
     element.addEventListener(handler.e, proxyfn, false);
   });
 }
 function remove(element, events, fn, selector){
   var id = zid(element);
   eachEvent(events || '', fn, function(event, fn){
     findHandlers(element, event, fn, selector).forEach(function(handler){
       delete handlers[id][handler.i];
       element.removeEventListener(handler.e, handler.proxy, false);
     });
   });
 }
 
fn.delegate = function(selector, event, callback) {
  return this.each(function(i, element){
    add(element, event, callback, selector, function(fn){
      return function(e){
        var evt, match = $(e.target).closest(selector, element).get(0);
        if (match) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element});
          return fn.apply(match, [evt].concat([].slice.call(arguments, 1)));
        }
      }
    });
  });
}