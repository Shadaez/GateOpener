module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				files: {
					'public/styles.css': 'src/styles.scss'
				}
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			all: {
				files: [{
					expand: true,
					flatten: true,
					src: ['src/js/**.js'],
					dest: 'public/',
					ext: '.min.js'
				}]
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'src/js/**.js', 'vps/**.js', 'pi/**.js', 'test/test.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		watch: {
			css: {
				files: "src/*.scss",
				tasks: ['sass']
			},
			js: {
				files: ["src/js/*.js"],
				tasks: ['jshint', 'uglify']
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('default', ['jshint', 'uglify', 'sass']);
};