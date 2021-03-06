module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        browserify: {
            options: {
                debug: true,
                transform: ["reactify", "debowerify"]
            },
            default: {
                src: "main.js",
                dest: "bundle.js"
            }
        },

        watch: {
            scripts: {
                files: ["js/**/*.js"],
                tasks: ["browserify"],
                options: {
                    nospawn: true,
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["browserify"]);
};
