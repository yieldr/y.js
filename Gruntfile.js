/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: pkg,
    // Task configuration.
    concat: {
      dist: {
        options: {
          process: function(src) {
            return src.replace('master', 'v' + grunt.config.data.pkg.version);
          }
        },
        src: ['lib/{,*/}*.js'],
        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.js'
      }
    },
    uglify: {
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.min.js'
      },
      tag: {
        options: {
          mangle: false
        },
        src: 'tag/tag.js',
        dest: 'tag/tag.min.js'
      },
      bookmarklet: {
        options: {
          quoteStyle: 1
        },
        src: 'bookmarklet/bookmarklet.js',
        dest: 'bookmarklet/bookmarklet.min.js'
      }
    },
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      lib_test: {
        src: ['lib/{,*/}*.js']
      }
    },
    mocha: {
      test: {
        src: ['test/test.*.html']
      },
    },
    connect: {
      server: {
        options: {
          port: 9999,
          hostname: '0.0.0.0',
          protocol: 'http',
          base: '.'
        }
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          testname: 'Mocha',
          urls: [
            'http://127.0.0.1:9999/test/test.y.html',
            'http://127.0.0.1:9999/test/test.custom.html'
          ],
          build: pkg.version,
          public: 'public',
          sauceConfig: {
            maxDuration: 60
          },
          browsers: [{
            browserName: 'internet explorer',
            version: '10.0',
            platform: 'Windows 8'
          },{
            browserName: 'internet explorer',
            version: '9.0',
            platform: 'Windows 7'
          },{
            browserName: 'internet explorer',
            version: '8.0',
            platform: 'Windows XP'
          },{
            browserName: 'firefox',
            version: '19',
            platform: 'Windows XP'
          },{
            browserName: 'firefox',
            version: '35.0',
            platform: 'Windows 7'
          },{
            browserName: 'firefox',
            version: '37.0',
            platform: 'Windows 8'
          },{
            browserName: 'chrome',
            version: '42.0',
            platform: 'OS X 10.10'
          },{
            browserName: 'chrome',
            version: '35.0',
            platform: 'OS X 10.8'
          },{
            browserName: 'safari',
            version: '8.0',
            platform: 'OS X 10.10'
          }]
        }
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  grunt.registerTask('default', ['mocha', 'concat', 'uglify']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('test', ['connect', 'mocha', 'saucelabs-mocha']);
  grunt.registerTask('hint', ['jshint']);
};