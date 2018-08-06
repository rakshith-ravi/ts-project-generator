#!/usr/bin/env node

var fs = require('fs-extra-promise');
var path = require('path');
var program = require('commander');

program
	.name('ts-project-generator')
	.usage('[options] [dir]')
	.version(require('./package.json').version, '-v, --version')
	.option('--express', 'Add ExpressJS to template')
	.option('--pug', 'Add pug to ExpressJS views')
	.option('--ejs', 'Add EJS to ExpressJS views')
	.option('--hbs', 'Add HandleBars to ExpressJS views')
	.option('--css', 'Add CSS templates')
	.option('--scss', 'Add SCSS templates')
	.option('--sass', 'Add SASS templates')
	.option('--no-git', 'Skips .gitignore')
	.option('--no-eslint', 'Skips .eslintrc')
	.option('--js, --javascript', 'Set template to generate all scripts in javascript (defaults to typescript)')
	.option('--static', 'Populate template with Static page')
	.option('--main', 'Add basic main to template (default)')
	.parse(process.argv);

generate(program);

async function generate(command) {
	// Path
	var destinationPath = program.args.shift() || '.'

	// App name
	var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

	// Make directory
	await mkdirAsync(destinationPath);
	await mkdirAsync(path.join(destinationPath, 'src'));
	await mkdirAsync(path.join(destinationPath, 'bin'));
	await fs.writeFileAsync(path.join(destinationPath, 'package.json'), JSON.stringify({
		name: `${appName}-project`,
		version: '1.0.0',
		description: `Holder project for ${appName}`,
		private: true,
		scripts: {
			build: "original=$(cat src/package.json) && echo ${original/\"ts-node main.ts\"/\"node main.js\"} > bin/package.json && cd bin && npm install",
			clean: "gulp clean",
			rebuild: "gulp rebuild",
			postinstall: "cd src && npm install",
			start: "cd src && npm start"
		},
		license: 'ISC',
		devDependencies: {
			"gulp": "^4.0.0",
			"gulp-clean": "latest",
			"gulp-csso": "latest",
			"gulp-htmlmin": "latest",
			"gulp-minify": "latest",
			"gulp-newer": "latest",
			"gulp-pretty-data": "latest",
			"gulp-pug": "latest",
			"gulp-sass": "latest",
			"gulp-typescript": "latest",
			"gulp-uglify-es": "latest",
			"ts-node": "latest",
			"typescript": "latest"
		}
	}, null, '\t'));
	await fs.copyAsync(path.join(__dirname, 'templates', 'gulpfile.js'), path.join(destinationPath, 'gulpfile.js'));
	await fs.copyAsync(path.join(__dirname, 'templates', 'tsconfig.json'), path.join(destinationPath, 'tsconfig.json'));

	if (!command['no-eslint']) {
		await fs.copyAsync(path.join(__dirname, 'templates', '.eslintrc'), path.join(destinationPath, '.eslintrc'));
	}

	if (!command['no-git']) {
		await fs.copyAsync(path.join(__dirname, 'templates', 'gitignore'), path.join(destinationPath, '.gitignore'));
	}

	var package = {
		name: appName,
		version: '1.0.0',
		private: true,
		scripts: {
			start: 'ts-node main.ts'
		}
	};

	if (command.js || command.javascript) {
		if (command.express) {
			// Copy main file
			await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'main.js'), path.join(destinationPath, 'src', 'main.js'));

			// Set package dependencies for express app
			package.dependencies = {};
			package.dependencies.debug = 'latest';
			package.dependencies.express = 'latest';
			package.dependencies.morgan = 'latest';
			package.dependencies['cookie-parser'] = 'latest';
			package.dependencies['http-errors'] = 'latest';

			package.devDependencies["node-sass"] = 'latest';

			// Copy index route
			await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'routes', 'index.js'), path.join(destinationPath, 'src', 'routes', 'index.js'));

			// Make directory for views
			await mkdirAsync(path.join(destinationPath, 'src', 'views'));

			// Populate views directory based on views selected
			if (command.ejs) {
				// Add ejs as a dependency
				package.dependencies.ejs = 'latest';

				// Copy EJS app
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'app-ejs.js'), path.join(destinationPath, 'src', 'app.js'));

				// Copy EJS views
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'views', 'index.ejs'), path.join(destinationPath, 'src', 'views', 'index.ejs'));
			} else if (command.hbs) {
				// Add HandleBars as a dependency
				package.dependencies.hbs = 'latest';

				// Copy HandleBars' app
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'app-hbs.js'), path.join(destinationPath, 'src', 'app.js'));

				// Copy HandleBars' views
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'views', 'base.hbs'), path.join(destinationPath, 'src', 'views', 'base.hbs'));
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'views', 'index.hbs'), path.join(destinationPath, 'src', 'views', 'index.hbs'));
			} else {
				// Add Pug as a dependency
				package.dependencies.pug = 'latest';

				// Copy Pug's app
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'app-pug.js'), path.join(destinationPath, 'src', 'app.js'));

				// Copy Pug's views
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'views', 'base.pug'), path.join(destinationPath, 'src', 'views', 'base.pug'));
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'views', 'index.pug'), path.join(destinationPath, 'src', 'views', 'index.pug'));
			}

			// Make public folder
			await mkdirAsync(path.join(destinationPath, 'src', 'public'));

			// Populate sub-folders of public
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'fonts'));
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'images'));
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'javascripts'));
			// Push index.js of javascripts sub-folder in public
			await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'public', 'javascripts', 'index.js'), path.join(destinationPath, 'src', 'public', 'javascripts', 'index.js'));

			// Make stylesheets
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'stylesheets'));

			// Populate stylesheets directory based on the stylesheet selected
			if (command.sass) {
				// Copy SASS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'public', 'stylesheets', 'style.sass'), path.join(destinationPath, 'src', 'public', 'stylesheets', 'style.sass'));
			} else if (command.css) {
				// Copy barebone CSS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'public', 'stylesheets', 'style.css'), path.join(destinationPath, 'src', 'public', 'stylesheets', 'style.css'));
			} else {
				// Copy SCSS styles (default)
				await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'express', 'public', 'stylesheets', 'style.scss'), path.join(destinationPath, 'src', 'public', 'stylesheets', 'style.scss'));
			}
		} else if (command.static) {
			// Copy the main file
			await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'static-page', 'main.js'), path.join(destinationPath, 'src', 'main.js'));

			// Copy the assets
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'index.html'), path.join(destinationPath, 'src', 'assets', 'index.html'));
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'index.js'), path.join(destinationPath, 'src', 'assets', 'index.js'));
			if (command.sass) {
				// Copy SASS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'style.sass'), path.join(destinationPath, 'src', 'assets', 'style.sass'));
			} else if (command.css) {
				// Copy barebone CSS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'style.css'), path.join(destinationPath, 'src', 'assets', 'style.css'));
			} else {
				// Copy SCSS styles (default)
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'style.scss'), path.join(destinationPath, 'src', 'assets', 'style.scss'));
			}
		} else {
			// Copy the main file
			await fs.copyAsync(path.join(__dirname, 'templates', 'javascript', 'main', 'main.js'), path.join(destinationPath, 'src', 'main.js'));
		}
	} else {
		if (command.express) {
			// Copy main file
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'main.ts'), path.join(destinationPath, 'src', 'main.ts'));

			// Set package dependencies for express app
			package.dependencies = {};
			package.dependencies.debug = 'latest';
			package.dependencies.express = 'latest';
			package.dependencies.morgan = 'latest';
			package.dependencies['cookie-parser'] = 'latest';
			package.dependencies['http-errors'] = 'latest';

			package.devDependencies = {};
			package.devDependencies["@types/express"] = "latest";
			package.devDependencies["@types/morgan"] = 'latest';
			package.devDependencies["@types/cookie-parser"] = 'latest';
			package.devDependencies["@types/http-errors"] = 'latest';
			package.devDependencies["@types/node-sass"] = 'latest';

			// Copy index route
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'routes', 'index.ts'), path.join(destinationPath, 'src', 'routes', 'index.ts'));

			// Make directory for views
			await mkdirAsync(path.join(destinationPath, 'src', 'views'));

			// Populate views directory based on views selected
			if (command.ejs) {
				// Add ejs as a dependency
				package.dependencies.ejs = 'latest';

				// Copy EJS app
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'app-ejs.ts'), path.join(destinationPath, 'src', 'app.ts'));

				// Copy EJS views
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'views', 'index.ejs'), path.join(destinationPath, 'src', 'views', 'index.ejs'));
			} else if (command.hbs) {
				// Add HandleBars as a dependency
				package.dependencies.hbs = 'latest';

				// Copy HandleBars' app
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'app-hbs.ts'), path.join(destinationPath, 'src', 'app.ts'));

				// Copy HandleBars' views
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'views', 'base.hbs'), path.join(destinationPath, 'src', 'views', 'base.hbs'));
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'views', 'index.hbs'), path.join(destinationPath, 'src', 'views', 'index.hbs'));
			} else {
				// Add Pug as a dependency
				package.dependencies.pug = 'latest';

				// Copy Pug's app
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'app-pug.ts'), path.join(destinationPath, 'src', 'app.ts'));

				// Copy Pug's views
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'views', 'base.pug'), path.join(destinationPath, 'src', 'views', 'base.pug'));
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'views', 'index.pug'), path.join(destinationPath, 'src', 'views', 'index.pug'));
			}

			// Make public folder
			await mkdirAsync(path.join(destinationPath, 'src', 'public'));

			// Populate sub-folders of public
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'fonts'));
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'images'));
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'javascripts'));
			// Push index.ts of javascripts sub-folder in public
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'public', 'javascripts', 'index.ts'), path.join(destinationPath, 'src', 'public', 'javascripts', 'index.ts'));

			// Make stylesheets
			await mkdirAsync(path.join(destinationPath, 'src', 'public', 'stylesheets'));

			// Populate stylesheets directory based on the stylesheet selected
			if (command.sass) {
				// Copy SASS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'public', 'stylesheets', 'style.sass'), path.join(destinationPath, 'src', 'public', 'stylesheets', 'style.sass'));
			} else if (command.css) {
				// Copy barebone CSS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'public', 'stylesheets', 'style.css'), path.join(destinationPath, 'src', 'public', 'stylesheets', 'style.css'));
			} else {
				// Copy SCSS styles (default)
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'express', 'public', 'stylesheets', 'style.scss'), path.join(destinationPath, 'src', 'public', 'stylesheets', 'style.scss'));
			}
		} else if (command.static) {
			// Copy the main file
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'main.ts'), path.join(destinationPath, 'src', 'main.ts'));

			// Copy the assets
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'index.html'), path.join(destinationPath, 'src', 'assets', 'index.html'));
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'index.ts'), path.join(destinationPath, 'src', 'assets', 'index.ts'));
			if (command.sass) {
				// Copy SASS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'style.sass'), path.join(destinationPath, 'src', 'assets', 'style.sass'));
			} else if (command.css) {
				// Copy barebone CSS styles
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'style.css'), path.join(destinationPath, 'src', 'assets', 'style.css'));
			} else {
				// Copy SCSS styles (default)
				await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'static-page', 'assets', 'style.scss'), path.join(destinationPath, 'src', 'assets', 'style.scss'));
			}
		} else {
			// Copy the main file
			await fs.copyAsync(path.join(__dirname, 'templates', 'typescript', 'main', 'main.ts'), path.join(destinationPath, 'src', 'main.ts'));
		}
	}

	await fs.writeFileAsync(path.join(destinationPath, 'src', 'package.json'), JSON.stringify(package, null, '\t'));
}

function createAppName(pathName) {
	return path.basename(pathName)
		.replace(/[^A-Za-z0-9.-]+/g, '-')
		.replace(/^[-_.]+|-+$/g, '')
		.toLowerCase()
}

async function mkdirAsync(dir) {
	if (await fs.existsAsync(dir) == false)
		await fs.mkdirAsync(dir);
}