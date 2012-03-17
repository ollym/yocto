require 'rake/packagetask'
require 'net/http'
require 'uri'
require 'zlib'

desc "Build zepto testing distribution for fast development."
task :dist do

  src = '';
  
  Dir.glob('src/**/*.js') do | file |
    src += File.read(file) + "\n";
  end
  
  min = Net::HTTP.post_form(URI.parse('http://closure-compiler.appspot.com/compile'), {
    'js_code' => src,
    'output_format' => 'text',
    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
    'output_info' => 'compiled_code'
  });
    
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

  puts "Original: %0.3f kb" % (raw / 1024);
  puts "Minified: %0.3f kb : %0.3f" % [(min / 1024), (raw/min)];
  puts "Gzipped:  %0.3f kb : %0.3f" % [(gzip / 1024), (min/gzip)];
end