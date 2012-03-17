Yocto.prototype.serializeObject = function() {
  return Yocto.deparam(this.serialize());
};

Yocto.prototype.serializeArray = function() {
  return Array.prototype.reduce.call(this, function(arr, form) {
    Array.prototype.forEach.call(form.elements, function(element) {
      if ( ! element.nodeName.match(/fieldset|button/i) &&
           ! element.disabled &&
           ! element.declare &&
           ! (element.type && element.type.match(/reset|submit/i))
           ((type != 'radio' && type != 'checkbox') || element.checked) && element.name) {
        arr.push({
          'name': element.name,
          'value': $(element).val()
        });
      }
    });
    return arr;
  }, []);
};

Yocto.prototype.serialize = function() {
  return this.serializeArray().map(function(pair) {
    return pair['name'] + '=' + encodeURIComponent(pair['value']);
  }).join('&');
};

Yocto.prototype.submit = function(callback) {
  if (arguments.length) return this.bind('submit', callback);
  return this.forEach(function(element) {
    var event = Yocto.Event('submit');
    $(element).trigger(event);
    if ( ! event.defaultPrevented)
      element.submit();
  });
};