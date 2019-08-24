'use strict';

function getEnvironment(grunt) {
   const TYPES = [ 'prd', 'dev' ],
         env = grunt.option('env');

   return TYPES.indexOf(env) === -1 ? 'dev' : env;
}

module.exports = (grunt) => {
   const ENVIRONMENT = getEnvironment(grunt);

   let config;

   config = {
      entryFile: './src/ts/index.ts',
      html: {
         src: './src/**/*.html',
         base: './src/html/',
      },
      js: {
         gruntFile: 'Gruntfile.js',
         webpackConfig: 'webpack.config.js',
         all: [
            './*.js',
            './src/**/*.js',
            './tests/**/*.js',
         ],
      },
      ts: {
         src: './src/**/*.ts',
         all: [
            './*.ts',
            './src/**/*.ts',
            './tests/**/*.ts',
         ],
         configs: {
            standards: 'tsconfig.json',
            esm: 'src/tsconfig.esm.json',
         },
      },
      commands: {
         tsc: './node_modules/.bin/tsc',
         webpack: './node_modules/.bin/webpack',
      },
      out: {
         dist: './dist',
         test: [ './.nyc_output', 'coverage' ],
      },
   };

   grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         target: [ ...config.js.all, ...config.ts.all ],
         fix: {
            src: [ ...config.js.all, ...config.ts.all ],
            options: {
               fix: true,
            },
         },
      },

      copy: {
         html: {
            expand: true,
            cwd: config.html.base,
            src: '**/*',
            dest: config.out.dist,
         },
      },

      exec: {
         options: {
            failOnError: true,
         },
         standards: {
            cmd: `${config.commands.tsc} -p ${config.ts.configs.standards} --pretty`,
         },
         esm: {
            cmd: `${config.commands.tsc} -p ${config.ts.configs.esm} --pretty`,
         },
         webpackUMD: {
            cmd: `${config.commands.webpack} ${config.entryFile} ${ENVIRONMENT === 'prd' ? '--env.production' : ''}`,
         },
      },

      clean: {
         dist: config.out.dist,
         testOutput: config.out.test,
      },

      watch: {
         html: {
            files: [ config.html.src ],
            tasks: [ 'build-html' ],
         },
         ts: {
            files: [ config.ts.src ],
            tasks: [ 'build-umd' ],
         },
         webpackConfig: {
            files: [ config.js.webpackConfig ],
            tasks: [ 'build-umd' ],
         },
         gruntFile: {
            files: [ config.js.gruntFile ],
            options: {
               reload: true,
            },
         },
      },
   });

   grunt.loadNpmTasks('grunt-eslint');
   grunt.loadNpmTasks('grunt-exec');
   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-copy');

   grunt.registerTask('standards', [ 'eslint:target', 'exec:standards' ]);
   grunt.registerTask('standards-fix', [ 'eslint:fix' ]);

   grunt.registerTask('build-umd', [ 'exec:webpackUMD' ]);
   grunt.registerTask('build-html', [ 'copy:html' ]);
   grunt.registerTask('build', [ 'build-umd', 'build-html' ]);

   grunt.registerTask('develop', [ 'clean:dist', 'build', 'watch' ]);

   grunt.registerTask('default', [ 'standards' ]);
};
