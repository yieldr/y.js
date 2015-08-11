/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var pkg = grunt.file.readJSON('package.json');

  var banner = "/**" +
    "\n * Yieldr Javascript Tracker" +
    "\n *" +
    "\n * @version   <%= pkg.version %>" +
    "\n * @copyright Yieldr Labs B.V." +
    "\n * @author    <%= pkg.author %>" +
    "\n * @license   <%= pkg.license %>" +
    "\n */\n";

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: pkg,

    // Task configuration.
    browserify: {
      dist: {
        src: ['lib/{,*/}*.js'],
        dest: 'y.js',
        options: {
          banner: banner,
          alias: {
            ab: './lib/ab.js',
            cookie: './lib/cookie.js',
            history: './lib/history.js',
            legacy: './lib/legacy.js',
            mapper: './lib/mapper.js',
            piggyback: './lib/piggyback.js',
            query: './lib/query.js',
            referrer: './lib/referrer.js',
            session: './lib/session.js',
            stats: './lib/stats.js',
            yieldr: './lib/yieldr.js'
          }
        }
      }
    },
    watch: {
      files: ['lib/{,*/}*.js'],
      tasks: ['browserify']
    },
    concat: {
      dist: {
        src: '<%= browserify.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.js',
        options: {
          process: function(src) {
            return src.replace('__VERSION__', pkg.version);
          }
        }
      }
    },
    uglify: {
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.v<%= pkg.version %>.min.js',
        options: {
          banner: banner
        }
      },
      tag: {
        options: {
          mangle: {
            except: ['y', 'i', 'e', 'l', 'd', 'r']
          },
          footer: "\n" +
            "\n_yldr.set(<key>, <value>);" +
            "\n_yldr.track();"
        },
        src: 'tag/tag.js',
        dest: 'tag/tag.min.js'
      }
    },
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      lib_test: {
        src: [
          'lib/{,*/}*.js',
        ]
      }
    },
    jsdoc: {
      dist: {
        src: ['lib/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    mochaTest: {
      dist: {
        options: {
          reporter: 'spec'
        },
        src: ['test/unit/test.*.js']
      }
    },
    mocha: {
      dist: {
        src: [
          'test/func/test.*.html'
        ]
      }
    },
    connect: {
      dist: {
        options: {
          port: 9999,
          hostname: '0.0.0.0',
          protocol: 'http',
          base: '.'
        }
      }
    },
    'saucelabs-mocha': {
      dist: {
        options: {
          testname: 'Mocha',
          urls: [
            'http://127.0.0.1:9999/test/func/test.y.html'
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
          }, {
            browserName: 'internet explorer',
            version: '9.0',
            platform: 'Windows 7'
          }, {
            browserName: 'internet explorer',
            version: '8.0',
            platform: 'Windows XP'
          }, {
            browserName: 'firefox',
            version: '19',
            platform: 'Windows XP'
          }, {
            browserName: 'firefox',
            version: '35.0',
            platform: 'Windows 7'
          }, {
            browserName: 'firefox',
            version: '37.0',
            platform: 'Windows 8'
          }, {
            browserName: 'chrome',
            version: '42.0',
            platform: 'OS X 10.10'
          }, {
            browserName: 'chrome',
            version: '35.0',
            platform: 'OS X 10.8'
          }, {
            browserName: 'safari',
            version: '8.0',
            platform: 'OS X 10.10'
          }, {
            browserName: 'safari',
            version: '5.1',
            platform: 'OS X 10.6'
          }, {
            browserName: 'opera',
            platform: "Windows 7",
            version: "11.64"
          }, {
            browserName: 'iphone',
            version: '8.2',
            platform: 'OS X 10.10',
            deviceName: 'iPhone Simulator',
            deviceOrientation: 'portrait'
          }]
        }
      }
    }
  });

  grunt.registerTask('default', ['browserify:dist', 'concat', 'uglify', 'mocha']);
  grunt.registerTask('build', ['browserify:dist', 'concat', 'uglify']);
  grunt.registerTask('test', ['mochaTest', 'mocha', 'connect', 'saucelabs-mocha']);
  grunt.registerTask('test:unit', ['mochaTest']);
  grunt.registerTask('test:func', ['mocha']);
  grunt.registerTask('hint', ['jshint']);
  grunt.registerTask('doc', ['jsdoc']);

};
