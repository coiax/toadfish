var fs = require('fs');

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    var my_options = JSON.parse(fs.readFileSync('./screeps-options', 'utf8'));

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        screeps: {
            options: my_options,
            dist: {
                src: ['dist/*.js']
            }
        },
        clean: {
            'dist': ['dist/*.js']
        },
        // Copy all source files into the dist folder
		// flattening the folder structure by converting
		// path delimiters to underscores
        copy: {
          screeps: {
            files: [{
              expand: true,
              cwd: 'src/',
              src: '**',
              dest: 'dist/',
              filter: 'isFile',
              rename: function (dest, src) {
                return dest + src.replace(/\//g,'_');
              }
            }],
          }
        }
    });

	// Sets default `grunt` invocation to running these three tasks
	grunt.registerTask('default',  ['clean', 'copy:screeps', 'screeps']);
}
