module('Event');

test('Yocto#on', function() {
  var evt = $.Event('click');
  
  // Test direct binding
  $('.foo').on('click', function(e) {
    strictEqual(e, evt);
    strictEqual(this, $('#root')[0]);
  });
  $('#root').trigger(evt);
  
  // Test delegate binding
  $('#nested-a').on('click', '#nested-b', function(e) {
    strictEqual(this, $('#nested-b')[0]);
    strictEqual(e.currentTarget, $('#nested-a')[0]);
  });
  $('#nested-b').trigger(evt);
  
  // Test data passing
  $('.foo').on('click', ['foo'], function(e, foo) {
    strictEqual(foo, 'foo');
    deepEqual(e.data, ['foo']);
  });
  $('#root').trigger(evt);
});

test('Yocto#unbind', function() {
  var evt = $.Event('click'), caught = false;
  function handler(e) { caught = true; }
  $('.foo').bind('click', handler);
  $('.foo').unbind('click', handler);
  $('#root').trigger(evt);
  equal(caught, false);
});