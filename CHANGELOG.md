#Improvements

selector = 
  function(element, index) (this = element) OR
  css query string OR
  array/Yocto object of elements OR
  single element to match against

reduce()
filter(selector)
first(selector)
last(selector)
is(selector) (alias = every)

# Fixes
Element support: col, colgroup and caption 

Yocto#closest now supports multiple values (as it should).


# API Changes
$.fn.map callback follows ES5 not jQuery (function(element, index, object) not function(index, element)).
$.fn.filter callback follows ES5 not jQuery (function(element, index, object) not function(index)).

# Non-ES5 Conformance
map, filter, every, some (this = element).