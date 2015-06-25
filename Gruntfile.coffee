module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json'),
    uglify: 
      build:
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
    coffee:
      compile:
        files: 
          'dist/<%= pkg.name %>.js': 'source/<%= pkg.name %>.coffee' # 1:1 compile

  # Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-coffee')

  # Default task(s).
  grunt.registerTask('default', ['coffee', 'uglify'])
