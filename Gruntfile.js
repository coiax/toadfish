module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    var my_options = require("./screeps-options.json")

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
