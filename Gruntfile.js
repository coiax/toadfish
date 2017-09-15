module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        screeps: {
            options: require("./screeps-options"),
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}
