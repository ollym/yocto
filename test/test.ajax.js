module('Ajax');

function MockXHR() {
}

MockXHR.prototype = Object.create(window.XMLHttpRequest.prototype);

$.ajaxSettings['xhr'] = function() {
  return new MockXHR();
}

test('Yocto.ajax', function() {
  $.get('assets/test.json', function(data) {
    console.log(data);
  });
});