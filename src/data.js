Yocto._dataStore = {};

Yocto._getData = function(node, name) {
  var id = Yocto._elementId(node);
  return node.hasAttribute('data-' + name) ?
    node.getAttribute('data-' + name) : (Yocto._dataStore[id] || (Yocto._dataStore[id] = {}))[name];
}

Yocto._setData = function(node, name, value) {
  var id = Yocto._elementId(node), store = Yocto._dataStore[id]|| (Yocto._dataStore[id] = {});
  node.removeAttribute('data-' + name);
  if (Yocto.isUndefined(value)) delete store[name];
  else {
    store[name] = value;
    if (isStr(value) || isNum(value))
      node.setAttribute('data-' + name, value);
  }
}

Yocto.prototype.data = function(name, value) {
  return arguments.length == 1 ?
    this.length == 0 ? undefined : Yocto._getData(this[0], name) :
    this.forEach(function(element, index) {
      Yocto._setData(element, name, isFunc(value) ? value.call(element, index, Yocto._getData(element, name)) : value);
    });
};