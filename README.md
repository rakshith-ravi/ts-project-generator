# TypeScript Project Generator

This is a simple project to generate TypeScript project templates from the command line.  
The tool is capable of generating the following templates:

* Express Project
* Static HTTP server
* Console application

## Installation

`npm install -g ts-project-generator`

## Usage

`ts-project [options] [project-name]`

Options can be of the following project types:

* `--main (default)` The tool generates a simple "hello world!" console application
* `--express` The tool generates an express template
* `--static` The tool generates a static HTTP server template

The view engine for express can be of the following types:

* `--pug (default)` The view engine is set to pug (formerly known as jade)(Express only)
* `--ejs` The view engine is set to EJS (Express only)
* `--hbs` The view engine is set to HandleBars (Express only)

The stylesheets can be of the following types (only works on `express` / `static` project types):

* `--scss (default)` The stylesheet is of type SCSS
* `--sass` The stylesheet is of type SASS
* `--css` The stylesheet is barebone CSS

The options can be of the following generic types:

* `--version` Prints the version of the tool
* `--no-git` The tool does not add a `.gitignore` file (automatically adds it by default)
* `--no-eslint` The tool does not add a `.eslintrc` file (automatically adds it by default)
* `--javascript, --js` The tool generates a JavaScript template instead of a TypeScript template

## Example usage

```sh
ts-project landing-page --express --pug
cd landing-page
npm install
```

or

```sh
mkdir landing-page
cd landing-page
ts-project . --express --pug
npm install
```

## Running

Once a project template is generated, the project is automatically configured to use `Gulp`.  
To set it up, simply run `npm install` on the root project. This will automatically install all dependencies on all 3 projects (root, source, compressed binaries).

If you need to install any new dependencies, simply run `npm install` on the root directory.

Moreover, when you run `npm start` on the root directory, the template will make `bin/main.js` executable (`chmod +x`) and execute it. So you can either do `npm start` on the root directory __or__ just execute it like any other executable (assuming you have the appropriate NodeJS installed) using `./bin/main.js`.

## Why this is better

The biggest advantage of this system is to separate the source code and the executable binaries as separate projects. This gives the project a root project to execute gulp tasks, build the binaries, etc, a source project containing the TypeScript code and any other assets in a prettified fashion and a 'binary' project contains all the assets in a minified and uglified fashion.

When it comes to production code, the project contained in the `bin` folder is distributed, which has all the code minifed and uglified, while debugging becomes easier with the project in the `src` folder, which has all the TypeScript code for type checking, prettified and all the bells and whistles.

## License

This piece of code is distributed under the GNU GPLv3 License.  
If you are using this software, please give due credits to the authors.