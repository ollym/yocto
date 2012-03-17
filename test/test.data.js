module('Data');

test('Yocto#data', function() {
  var obj = {};
  $('.foo').data('obj', obj);
  strictEqual($('#root').data('obj'), obj);
  
  $('#root').attr('data-foo', 'bar');
  equal($('#root').data('foo'), 'bar');
});