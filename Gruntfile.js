'use strict';

var webpackConfig = require('./webpack.config.js');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var pkgConfig = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkgConfig,

    webpack: {
      options: webpackConfig,
      dist: {
        cache: false
      }
    },

    watch: {
      files: ['src/**/*.js'],
      tasks: ['build']
    },

    'webpack-dev-server': {
      options: {
        hot: true,
        port: 8000,
        webpack: webpackConfig,
        publicPath: 'dist/assets/',
        contentBase: './<%= pkg.src %>'
      },

      start: {
        keepAlive: true
      }
    },

    connect: {
      options: {
        port: 8000
      },

      dist: {
        options: {
          keepalive: true,
          middleware: function(connect) {
            return [
              mountFolder(connect, pkgConfig.dist)
            ];
          }
        }
      }
    },

    open: {
      options: {
        delay: 500
      },

      dev: {
        path: 'http://localhost:<%= connect.options.port %>/webpack-dev-server/'
      },

      dist: {
        path: 'http://localhost:<%= connect.options.port %>/'
      }
    },

    copy: {
      dist: {
        files: [
          {
            flatten: true,
            expand: true,
            src: [
              '<%= pkg.src %>/*'
            ],
            dest: '<%= pkg.dist %>/',
            filter: 'isFile'
          }
        ]
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= pkg.dist %>'
          ]
        }]
      }
    }
  });

  grunt.registerTask('serve', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open:dist', 'connect:dist']);
    }

    grunt.task.run([
      'open: dev',
      'webpack-dev-server'
    ]);
  });

  grunt.registerTask('build', ['clean', 'copy', 'webpack']);

  grunt.registerTask('default', []);

  grunt.loadNpmTasks('grunt-contrib-watch');
};
