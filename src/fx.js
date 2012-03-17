Yocto.fx = {
  off: false
};

Yocto.prototype.animate = function(properties, duration, easing, callback) {
  
  if ( ! Yocto.isObject(duration))
    easing = duration['easing'], callback = duration['complete'], duration = duration['duration'];
  
  var prefix = Yocto.browser.webkit ? '-webkit-' :
    Yocto.browser.mozilla ?  '-moz-' :
    Yocto.browser.opera ? '-o-' :
    Yocto.browser.msie ? '-ms-' : '', transforms = [];
  
  var css = {}, self = this;
  
  function end() {
    $(this).css(prefix + 'transition', 'none')
      .css(prefix + 'animation-name', 'none');
    Yocto.isFunction(callback) &&
      callback.apply(this, Yocto.makeArray(arguments));
  }
  
  if (Yocto.isString(properties)) {
    css[prefix + 'animation-name'] = properties;
    css[prefix + 'animation-duration'] = duration + 's';
    if (duration > 0) this.one(prefix + 'AnimationEnd', end);
  }
  else {
    Yocto.each(properties, function(key, value) {
      if (key.match(/^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i))
        transforms.push(key + '(' + value + ')');
    });
  
    if (transforms.length)
      css[prefix + 'transform'] = transforms.join(' ');
    
    if ( ! Yocto.fx.off)
      css[prefix + 'transition'] = 'all ' + duration + 's ' + (easing || '');
      
    if (duration > 0) this.one(prefix + 'TransitionEnd', end);
  }
  
  setTimeout(function() {
    self.css(css);
    if (duration <= 0) setTimeout(function() {
      self.forEach(function(element) { end.call(element) });
    }, 0);
  }, 0);
  
  return this;
}