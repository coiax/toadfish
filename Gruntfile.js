var fs = require('fs');

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    var my_options = JSON.parse(fs.readFileSync('./screeps-options', 'utf8'))

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        screeps: {
            options: my_options,
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}
