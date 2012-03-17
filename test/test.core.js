module('Core');

var $ = Yocto;

var ready = false;
$(function() { ready = true; });

test('Yocto', function() { 
  equal(typeof $, 'function');
  
  var a = $(), b = $();
  ok(a instanceof Yocto);
  ok(a !== b);
  
  equal($(document).length, 1);
});
test('Yocto(selector)', function() {
  equal($('.foo').length, 3);  // .class
  equal($('#root').length, 1); // #id
  equal($('defn').length, 1);  // tag
  equal($('#root > .bar').length, 1); // querySelectorAll
  equal($('#root > .bar').selector, '#root > .bar');
});
test('Yocto(fragment)', function() {
  var fragment = $('<div>');
  equal(fragment.length, 1);
  equal('<div></div>', fragment[0].outerHTML);
  equal(fragment.selector, null);
  
  fragment = $('<script>window.foo="bar";</script>');
  equal(fragment.length, 1);
  equal(fragment[0].innerText, 'window.foo="bar";');
  
  fragment = $('<div>hello world</div>');
  equal(fragment.length, 1);
  equal('<div>hello world</div>', fragment[0].outerHTML);
  equal(fragment.selector, null);

  fragment = $('<div>hello</div> <span>world</span>');
  equal(fragment.length, 3);
  equal('<div>hello</div>', fragment[0].outerHTML);
  equal(Node.TEXT_NODE, fragment[1].nodeType);
  equal('<span>world</span>', fragment[2].outerHTML);
  equal(fragment.selector, null);

  fragment = $('<div>\nhello</div> \n<span>world</span>');
  equal(fragment.length, 3);
  equal('<div>\nhello</div>', fragment[0].outerHTML);
  equal(Node.TEXT_NODE, fragment[1].nodeType);
  equal('<span>world</span>', fragment[2].outerHTML);
  equal(fragment.selector, null);

  fragment = $('<div>hello</div> ');
  equal(fragment.length, 1);
  
  ['td','tr','th','thead','tfoot','tbody','caption','col','colgroup'].forEach(function(tag) {
    ok($('<' + tag + '>' + '</' + tag + '>').length);
  });
});
test('Yocto(element)', function() {
  
  // Normal element
  var elem = $(document.getElementById('root'));
  equal(elem.length, 1);
  equal(elem[0], document.getElementById('root'));
  
  // Text element
  elem = $(document.createTextNode('yocto'));
  equal(elem.length, 1);
  equal(elem[0].nodeType, Node.TEXT_NODE);
});
test('Yocto(document)', function() {
  var elem = $(document);
  equal(elem.length, 1);
  equal(elem[0], document);
});
test('Yocto(array)', function() {
  var element = document.getElementById('root');

  var elem = $([element]);
  equal(elem.length, 1);
  equal(elem[0], element);

  elem = $([element, null, undefined]);
  equal(elem.length, 1);
  equal(elem[0], element);

  elem = $([null, element, null]);
  equal(elem.length, 1);
  equal(elem[0], element);
});
test('Yocto#reduce', function() {
  var i = 0, foo = $('.foo');
  var result = foo.reduce(function(a,b,indx,o) {
    
    if (i === 0) {
      ok(Array.isArray(a));
      equal(o, foo);
    }
    
    equal(this, b);
    equal(indx, i);
    equal(foo[i++], b);

    return a.concat(b);
  });
  
  ok(result instanceof Yocto);
  equal(result.prevObject, foo);
  equal(i, foo.length);
  deepEqual(result, foo);
});

test('Yocto#slice', function() {
  var items = $('.foo, .bar'), slice = items.slice(1,3);
  ok(slice instanceof Yocto);
  equal(slice.length, 2);
  equal(slice.prevObject, items);
  ok([].every.call(slice, function(element, i) {
    return element == items[1 + i];
  }));
});
test('Yocto#filter', function() {
  var i = 0, items = $('.foo, .bar');
  var result = items.filter(function(index) {
    equal(this, items[index]);
    equal(index, i++);
    return !!(i % 2);
  });
  ok(result instanceof Yocto);
  equal(result.prevObject, items);
  equal(i, items.length);
  deepEqual(result, [items[0], items[2], items[4]]);
});
test('Yocto#map', function() {
  var i = 0, items = $('.foo, .bar'), parents = [];
  var result = items.map(function(index, element) {
    equal(this, element);
    equal(index, i);
    equal(items[i++], element);
    
    parents.push(element.parentNode);
    
    return element.parentNode;
  });

  ok(result instanceof Yocto);
  equal(result.prevObject, items);
  equal(i, items.length);
  deepEqual(result, parents);
});
test('Yocto#get', function() {
  deepEqual($('.foo').get(), $('.foo'));
  equal($('.foo').get(2), $('.foo')[2]);
});
test('Yocto#ready', 2, function() {
  ok(ready);
  $(function() {
    ok(true);
  });
});
test('Yocto#size', function() {
  equal($('<div></div>').size(), 1);
  equal($('<div></div><div></div>').size(), 2);
});
test('Yocto#each', function() {
  var i = 0, items = $('.foo, .bar'), parents = [];
  var result = items.each(function(index) {
    equal(index, i);
    equal(items[i++], this);
    
    parents.push(this.parentNode);
  });

  equal(result, items);
  equal(i, items.length);
  
  i = 0;
  items.each(function(indx) {
    i++; if (indx === 2) return false;
  });
  
  deepEqual(items.pluck('parentNode'), parents);
  equal(i, 3);
});
test('Yocto#is', function() {
  var root = $('#root');
  ok(root.is());
  ok(root.is('#root'));
  ok(root.is('#root.foo'));
  ok(root.is(function(index) {
    equal(this, root[index]);
    equal(index, 0);
    return true;
  }));
    
  strictEqual(root.is, root.some);
});
test('Yocto#detach', function() {
  var bar = $('.bar');
  bar.detach();
  equal($('.bar').length, 0);
});
test('Yocto#end', function() {
  var a = $('.bar'),
      b = a.filter();
  strictEqual(b.end(), a);
});
test('Yocto#add', function() {
  var root = $('#root'), foo = $('foo'), foo$root = $('#root, foo');
  ok(root.add(foo).is(foo$root));
});
test('Yocto#andSelf', function() {
  var a = $('.bar').filter('#root').andSelf();
  ok(a.is($('.bar, #foo')));
});
test('Yocto#not', function() {
  var a = $('.foo').not('#root');
  ok(a.is($('.foo:not(#root)')));
});
test('Yocto#eq', function() {
  var bar = $('.bar');
  strictEqual(bar.eq(1)[0], bar[1]);
  strictEqual(bar.eq(-2)[0], bar[bar.length - 2]);
});
test('Yocto#first', function() {
  var foo = $('.foo');
  deepEqual(foo.first(), [foo[0]]);
  deepEqual(foo.last('#root'), $('#root'));
});
test('Yocto#last', function() {
  var foo = $('.foo');
  deepEqual(foo.last(), [foo[foo.length-1]]);
  deepEqual(foo.last('#root'), $('#root'));
});
test('Yocto#find', function() {
  deepEqual($(document).find('.bar'), $('.bar'));
  deepEqual($('.foo').find('.bar'), $('.foo .bar'));
});
test('Yocto#find', function() {
  deepEqual($(document).find('.bar'), $('.bar'));
  deepEqual($('.foo').find('.bar'), $('.foo .bar'));
});
test('Yocto#closest', function() {
  ok($('#root').closest());
  deepEqual($('#nested-c').closest('#nested-a'), $('#nested-a'));
});
test('Yocto#parents', function() {
  deepEqual($('#root').parents(), [].concat($('#qunit-fixture'), $(document.body), $('html')));
  deepEqual($('#nested-c, #nested-b').parents(), [].concat($('#nested-a'), $('#qunit-fixture'), $(document.body), $('html'), $('#nested-b')));
  deepEqual($('#nested-c, #nested-b').parents('#nested-b'), $('#nested-b'));
});
test('Yocto#parent', function() {
  deepEqual($('#nested-c').parent(), $('#nested-b'));
  deepEqual($('#double > div').parent(), $('#double'));
  deepEqual($('#nested-c, #nested-b').parent('#nested-a'), $('#nested-a'));
});
test('Yocto#children', function() {
  deepEqual($('#double').children(), $('#double *'));
  deepEqual($('#double').children('.foo'), $('#double .foo'));
});
test('Yocto#siblings', function() {
  deepEqual($('#double .bar').siblings(), $('#double .foo'));
  deepEqual($('#tripple .a').siblings('.b'), $('#tripple .b'));
});
test('Yocto#empty', function() {
  deepEqual($('defn').empty(), $('defn'));
  equal($('defn')[0].innerHTML, '');
});
test('Yocto#show', function() {
  function getDisplay() {
    return document.defaultView.getComputedStyle($('defn')[0], null).getPropertyValue('display')
  };
  $('defn')[0].style.display = 'none';
  strictEqual($('defn').show()[0], $('defn')[0])
  deepEqual(getDisplay(), 'inline');
});
test('Yocto#insert', function() {
  $('#root').insert('<div><script>window["foo"]="bar";</script></div>');
  equal(window['foo'], 'bar'); delete window['foo'];
  var bar = $('.bar');
  var nodes = bar.insert(function(index) {
    strictEqual(this, bar[index]);
    return '<div class="insert-index">' + index + '</div>';
  });
  equal(nodes.length, $('.bar').length);
});
test('Yocto#insertBefore', function() {
  var node = $('<div class="insertBefore"></div>');
  equal(node.insertBefore('#root *:first-child').length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:first-child').pluck('outerHTML'));
});
test('Yocto#insertAfter', function() {
  var node = $('<div class="insertAfter"></div>');
  equal(node.insertAfter('#root *:last-child').length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:last-child').pluck('outerHTML'));
});
test('Yocto#before', function() {
  var node = $('<div class="before"></div>');
  equal($('#root *:last-child').before(node).length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:first-child').pluck('outerHTML'));
});
test('Yocto#after', function() {
  var node = $('<div class="after"></div>');
  equal($('#root *:last-child').after(node).length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:last-child').pluck('outerHTML'));
});
test('Yocto#append', function() {
  var node = $('<div class="append"></div>');
  equal($('#root').append(node).length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:last-child').pluck('outerHTML'));
});
test('Yocto#prepend', function() {
  var node = $('<div class="append"></div>');
  equal($('#root').prepend(node).length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:first-child').pluck('outerHTML'));
});
test('Yocto#appendTo', function() {
  var node = $('<div class="append"></div>');
  equal((node = node.appendTo('#root')).length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:last-child').pluck('outerHTML'));
});
test('Yocto#prependTo', function() {
  var node = $('<div class="append"></div>');
  equal((node = node.prependTo('#root')).length, 1);
  deepEqual(node.pluck('outerHTML'), $('#root *:first-child').pluck('outerHTML'));
});
test('Yocto#replaceWith', function() {
  $('#root').replaceWith('<div id="bar"></div>');
  equal($('#root').length, 0);
  equal($('#bar').length, 1);
});
test('Yocto#wrap', function() {
  $('#root *').wrap('<div class="wrapped"></div>');
  equal($('#root > *').length, 1);
  equal($('#root > * > *').length, 1);
});
test('Yocto#wrapAll', function() {
  $('#nested-b, #nested-c').wrapAll('<div class="wrapped"></div>');
  deepEqual($('#nested-a > *'), $('.wrapped'));
});
test('Yocto#wrapInner', function() {
  var a = $('#double').children();
  $('#double').wrapInner('<div class="wrapped"></div>');
  var b = $('.wrapped').children();
  deepEqual(a.pluck('outerHTML'), b.pluck('outerHTML'));
});
test('Yocto#unwrap', function() {
  $('#nested-b, #nested-c').wrapAll('<div class="wrapped"></div>');
  $('#nested-b').unwrap();
  
  deepEqual($('#nested-a > *'), $('#nested-b'));
});
test('Yocto#css', function() {
  $('defn').css('background-color', 'red');
  equal($('defn').css('background-color'), 'red');
  equal($('defn')[0].getAttribute('style'), 'background-color: red; ');
  $('defn').css({
    'background-color': 'white',
    'line-height': '12px'
  });
  equal($('defn').css('background-color'), 'white');
  equal($('defn').css('line-height'), '12px');
});
test('Yocto#hide', function() {
  $('defn').hide();
  equal($('defn').css('display'), 'none');
});
test('Yocto#visible', function() {
  equal($('defn').visible(), true);
  strictEqual($('defn').hide().visible(), false);
  strictEqual($('defn').show().visible(), true);
  strictEqual($('defn').css('visibility', 'hidden').visible(), false);
  
  var obj = $('.bar');
  obj.visible(function(index, visible, element, object) {
    equal(this, element);
    strictEqual(visible, true);
    strictEqual(obj, object);
  });
});
test('Yocto#toggle', function() {
  var bar = $('.bar');
  $(bar[2]).hide();
  bar.toggle();
  
  bar.each(function(index, element) {
    strictEqual($(element).visible(), index === 2);
  });
  
  bar.toggle(true);
  bar.each(function(index, element) {
    strictEqual($(element).visible(), true);
  });
  
  bar.toggle(false);
  bar.each(function(index, element) {
    strictEqual($(element).visible(), false);
  });
});
test('Yocto#prev', function() {
  deepEqual($('#tripple .b').prev(), $('#tripple .a'));
});
test('Yocto#next', function() {
  deepEqual($('#tripple .b').next(), $('#tripple .c'));
});
test('Yocto#html', function() {
  equal($('#root').html(), $('#root')[0].innerHTML);
  var foo = $('.foo');
  foo.html(function(index, html) {
    strictEqual(this, foo[index]);
    equal(this.innerHTML, html);
    return '';
  });
  ok($('.foo').pluck('innerHTML').every(function(html) {
    return html == '';
  }));
});
test('Yocto#text', function() {
  $('#root').text('HelloWorld');
  equal($('#root')[0].textContent, 'HelloWorld');
  var foo = $('.foo');
  foo.text(function(index, text) {
    strictEqual(this, foo[index]);
    equal(this.textContent, text);
    return '<div></div>';
  });
  ok($('.foo').pluck('textContent').every(function(text) {
    return text == '<div></div>';
  }));
});
test('Yocto#attr', function() {
  equal($('#root').attr('id'), 'root'); var obj = $('.bar');
  equal(obj.attr('class', function(index, value) {
    equal(value, this.className);
    strictEqual(this, obj[index]);
    return 'foo';
  }), obj);
  ok([].every.call(obj, function(e) {
      return e.className == 'foo';
  }));
  $('#root').attr({
    'data-foo': 'bar',
    'data-bar': 'foo'
  });
  equal($('#root').attr('data-foo'), 'bar');
  equal($('#root').attr('data-bar'), 'foo');
});
test('Yocto#removeAttr', function() {
  $('#root').removeAttr('class');
  equal($('#root')[0].className.trim(), '');
});
test('Yocto#val', function() {
  equal($('#form [name="text"]').val(), 'text-value');
  equal($('#form [name="checked-checkbox"]').val(), 'on');
  
  var radios = $('#form [name="radio"]');
  radios.val(function(index, value) {
    strictEqual(this, radios[index]);
    strictEqual(value, 'radio-' + (['a','b','c'][index]));
    return 'radio-v';
  });
  
  deepEqual(radios.pluck('value'), ['radio-v','radio-v','radio-v']);
  deepEqual($('#multiple-select').val(), ['value-a', 'value-c']);
  
  $('#multiple-select').val('value-c');
  deepEqual($('#multiple-select').val(), ['value-c']);
  
  $('#multiple-select').val(['value-c','value-b']);
  deepEqual($('#multiple-select').val(), ['value-b','value-c']);
});
test('Yocto#offset', function() {
  deepEqual($('#floater').offset(), {
    height: 90,
    left: 100,
    top: 150,
    width: 90
  });
});
test('Yocto#index', function() {
  equal($('#tripple > *').index('.b'), 1);
  equal($('#tripple > *').index('.d'), -1);
  equal($('#tripple > *').index(), 0)
});
test('Yocto#hasClass', function() {
  ok($('#root').hasClass('foo'));
  ok($('#both').hasClass('bar'));
});
test('Yocto#addClass', function() {
  $('#root').addClass(' foo bar baz');
  equal($('#root')[0].className, 'foo bar baz');
});
test('Yocto#removeClass', function() {
  $('#root').removeClass('foo');
  equal($('#root')[0].className, '');
  
  $('#root').addClass(' foo bar');
  $('#root').removeClass('bar')
  equal($('#root')[0].className, 'foo');
});
test('Yocto#toggleClass', function() {
  
  $('#root').toggleClass('foo');
  equal($('#root')[0].className, '');
  
  $('#root').toggleClass('foo');
  equal($('#root')[0].className, 'foo');
  
  $('#root').toggleClass('foo bar', true);
  equal($('#root')[0].className, 'foo bar');
  
  $('#root').toggleClass('bar baz');
  equal($('#root')[0].className, 'foo baz');
  
  $('#root').toggleClass(function(index, klass, add) {
    equal(add, undefined);
    equal(klass, 'foo baz');
    return 'baz';
  });
  
  equal($('#root')[0].className, 'foo');
  
  $('#root').toggleClass(function(index, klass, add) {
    ok(add);
    return 'baz';
  }, true);
  
  equal($('#root')[0].className, 'foo baz');
});
test('Yocto#width', function() {
  equal($(window).width(), window.innerWidth);
  equal($(document).width(), document.documentElement.offsetWidth);
  equal($('#floater').width(), 90);
  
  $('#floater').width(20);
  equal($('#floater').width(), 60);
});
test('Yocto#height', function() {
  equal($(window).height(), window.innerHeight);
  equal($(document).height(), document.documentElement.offsetHeight);
  equal($('#floater').height(), 90);
  
  $('#floater').height(20);
  equal($('#floater').height(), 60);
});