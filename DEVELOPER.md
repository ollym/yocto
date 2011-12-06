## Available Internal Functions

### Object Short-hands
Object short-hands are simply shorter-named variables representing JavaScript's built-in variables. You are strongly encouraged to use them where possible as they are minified by the closure compiler.

`$A` = Array
`$O` = Object
`$S` = String
`$N` = Number
`$F` = Function
`$R` = RegExp
`$D` = Date

`$Ap` = Array.prototype
`$Op` = Objcet.prototype;

### Array Operators
The Yocto object ($ or Yocto) is an extended native array with a different set of methods. This means that all the array methods you know and love (slice, splice, pop, unshift, sort etc.) all work on Yocto objects like so: `Array.prototype.slice.call(yoctoObject, 1, 3)`. They are incredibly fast and minify well, so are available as internal methods. All operators are used extensively throughout the core - for example we use forEach.call(this, function() {}) instead of this.each(function() {}) because it's faster and minifies better.

`slice`   = Array.prototype.slice
`filter`  = Array.prototype.filter
`reduce`  = Array.prototype.reduce
`map`     = Array.prototype.map
`every`   = Array.prototype.every
`some`    = Array.prototype.some
`indexOf` = Array.prototype.indexOf
`forEach` = Array.prototype.forEach

All these methods are defined in the ECMA5 spec, so if you don't know how to use them - go google it.

Some extras not defined in ECMA5:

`pluck(array, property)`  - Fetches a property within each of the objects within the array and returns them in a separate array.
`flatten(array)`          - Takes a multi-dimensional array and flattens it by 1-dept only. flatten([['a'],[['b']],'c']) => ['a', ['b'], 'c'].
`uniq(array)`             - Generates a new array with the unique values from the given array (no duplicates - comparison is strict (===)).

The above variables reference the call function of the original function. And therefore act as procedural methods - so remember to always add the array as the first parameter. For example:

```javascript
slice(yoctoObject, 2, 3);
```

However the following variables are simple references to the function because they can be useful in both the call and apply context:

`concat`,`splice`

For example:

```javascript
concat.apply(yoctoObject, htmlElement1, [htmlElement2, htmlElement3]);
```

### Type Checkers
Don't do type checking yourself. Use one of these methods. It is much more efficient and compiles smaller.

`isArr`   Is an array? - returns false for array-like objects such as `arguments`. Returns true for Yocto objects.
`isObj`   Is an object? i.e. not a function, boolean, number or string.
`isStr`   Is a string?
`isFunc`  Is a function? N.b. `isFunc(/some-regex/) == true`
`isNum`   Is a number or string number? `isNum('123') == true`
`isNull`  Is undefined or null?
`isEmpty` Is array and length is 0 or casts to false? `isEmpty('') == true, isEmpty([]) == true, isEmpty(false) == true`
`isEnum`  Is an enumerable object? - i.e. one without a constructor. `isEnum({}) == true, isEnum([]) == true, isEnum(new ConstructorFunction()) == false`
`isBool`  Is a valid boolean?

### Object Operators
Exactly like Array Operators (mentioned above) except these just alias properties of the `Object` built-in function with a few extras from us. Again they minify well - so use them!

`keys`     = Object.keys
`toString` = Object.prototype.toString.call

And 1 of our own:

`merge`    = Merges 2 enumerable objects together. Works like Zepto/JQuery's $.extend.

### Object Casters
Javascript is a dynamic language - sometimes you will want to ensure a parameter is of a specific type. We use these extensively in the core to avoid common bugs relating to type mis-matches.

`Arr` = Alias of flatten. `Arr('a', ['b', 'c']) => ['a','b','c']`


## Google Closure Guidelines

1. Declare and fetch properties explicitly

  ```javascript
  MyObj[param ? 'someFuncA' : 'someFuncB']('param');    // BAD! ✘
  (param ? MyObj.someFuncA : MyObj.someFuncB)('param'); // GOOD! ✔
  ```

2. Do not mix property export types.

  ```javascript
  var obj = {a:1,b:2,c:3};
  obj['a'] // BAD! ✘
  obj.a    // GOOD! ✔
  ```
  
  ```javascript
  var obj = {'a':1,'b':2,'c':3};
  obj['a'] // GOOD! ✔
  obj.a    // BAD! ✘
  ```
  
## Coding Guidelines
Follow these guidelines carefully to ensure your code is optimised for minification and follows

1. Use internal methods wherever possible.
2. 

2. (Do Not Repeat Yourself)™
  
  ```javascript
  function() {
    
  }
  ```

1. Avoid using 'this' where possible. (Small)

  ```javascript
  $('.foo').each(function(index,element) {
    $(this).foobar();    // BAD! ✘
    $(element).foobar(); // GOOD! ✔
  });
  ```
  