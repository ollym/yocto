require 'rubygems'
require 'zlib'
require 'closure-compiler'

desc "Use the Closure Compiler to compress Yocto"
task :build do
  
  src = "(function(){#{File.read('src/core.js')}"
  Dir.glob('src/**/*.js') do | file |
    if (file != 'src/core.js')
      src += File.read(file);
    end
  end
  src += '})();'
  
  min = Closure::Compiler.new(
    :compilation_level => 'ADVANCED_OPTIMIZATIONS',
    :externs => 'build/extern.js'
    #:formatting => 'pretty_print'
  ).compile(src)
  
  File.open('dist/yocto.js', 'w') do |file|
    file.write src
    file.close
  end
  File.open('dist/yocto.min.js', 'w') do |file|
    file.write min
    file.close
  end
  File.open('dist/yocto.min.js.gz', 'w') do |file|
    gzip = Zlib::GzipWriter.new(file)
    gzip.write min
    gzip.close
  end
  
  raw = File.size('dist/yocto.js').to_f;
  min = File.size('dist/yocto.min.js').to_f;
  gzip = File.size('dist/yocto.min.js.gz').to_f;
  
  puts "Original: %0.3f kb" % (raw/1000);
  puts "Minified: %0.3f kb : %0.3f" % [(min/1000), (raw/min)];
  puts "Gzipped:  %0.3f kb : %0.3f" % [(gzip/1000), (min/gzip)];
end