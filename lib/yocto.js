var http = require('http'),
    fs = require('fs'),
    stringify = require('querystring').stringify;

var SRC_FILES = [
  'core.js',
  'event.js',
  'ajax.js',
  'data.js'
];

var src = SRC_FILES.reduce(function(buffer, file) {
  return buffer + fs.readFileSync('./src/' + file) + '\n';
}, '');

module.exports.link = function(file) {
  var req = http.request({
    host: 'closure-compiler.appspot.com',
    port: 80,
    path: '/compile',
    method: 'POST',
    headers: { 'Content-type': 'application/x-www-form-urlencoded' }
  }, function(res) {
    res.on('data', function(chunk) {
      fs.writeFile('./dist/yocto.min.js', chunk);
    });
  });

  fs.writeFile('./dist/yocto.js', src);

  req.write(stringify({
    js_code: src,
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    output_format: 'text',
    output_info: 'compiled_code'
  }));

  req.end();
}