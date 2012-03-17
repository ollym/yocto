module('Ajax');

test('Yocto.ajax', function() {
  $('body').one('ajaxSend', function() {
    console.log('asd');
  });
  
  Yocto.ajax({
    'url': './assets/test.xml',
    'success': function(data) {
      console.log(data);
    }
  });
});

test('Yocto.param', function() {
  same(Yocto.param({ foo: 'bar'}), 'foo=bar');
  same(Yocto.param({ foo: ['a','b'] }), 'foo[]=a&foo[]=b');
  same(Yocto.param({ foo: { 0:'a', 1:'b', 3:'c' }}), 'foo[0]=a&foo[1]=b&foo[3]=c');
  same(Yocto.param({ foo: [['a']]}), 'foo[][]=a');
  same(Yocto.param({ foo: { 'a': { 'b': 'c' }}}), 'foo[a][b]=c');
});

test('Yocto.deparam', function() {
  same(Yocto.deparam('foo=bar'), { foo: 'bar'});
  same(Yocto.deparam('foo[]=a&foo[]=b'), { foo: ['a','b'] });
  same(Yocto.deparam('foo[]=a&foo[]=b&foo[3]=c'), { foo: { 0:'a', 1:'b', 3:'c' }});
  same(Yocto.deparam('foo[][]=a'), { foo: [['a']]});
  same(Yocto.deparam('foo[a][b]=c'), { foo: { 'a': { 'b': 'c' }}});
});