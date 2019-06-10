# Ivory
Digital service to support the Ivory Act. 

# Prerequisites

Node v10+

# TODO 
- [ ] Add the build status badges to this file
- [ ] Logging
- [ ] Error handling
- [ ] Model setup
- [ ] Lots more no doubt...

# Running the application

First build the application using:

`$ npm run build`

This builds the `govuk-frontend` sass.  Going forwards this may be extended to include other build tasks as needed (e.g. client-side js using browserify or webpack etc.)

Now the application is ready to run:

`$ node index`

Check the server is running by pointing your browser to `http://localhost:3000`

## Project structure

Here's the default structure for your project files.

* **bin** (build tasks)
* **client** (client js/sass code)
* **server**
  * **models**
  * **modules** (Feature based modules that include routes and views)
  * **plugins** (Hapi and custom plugins)
  * **public**  (This folder is publicly served)
    * **static** (Put all static assets in here)
    * **build** (This contains the build output files (js/css etc.) and is not checked-in)
  * config.js
  * index.js (Exports a function that creates a server)
* **test**
* LICENCE
* README.md
* index.js (startup server)

## Config

The configuration file for the server is found at `server/config.js`.
This is where to put any config.  All environment-specific config should be read from the environment (or a `.env` file)

# Environment variables

| name                      | description      | required | default      |            valid            | notes |
|---------------------------|------------------|:--------:|---------     |:---------------------------:|-------|
| NODE_ENV                  | Node environment |    no    | development  | development,test,production |       |
| PORT                      | Port number      |    no    | 3000         |                             |       |

TODO: Add the address lookup variables; ADDRESS_LOOKUP_URI 
ADDRESS_LOOKUP_USERNAME, 
ADDRESS_LOOKUP_PASSWORD, 
ADDRESS_LOOKUP_KEY, 
ADDRESS_LOOKUP_STUB

## Plugins

hapi has a powerful plugin system and all server code should be loaded in a plugin.

Plugins live in the `server/plugins` directory.

## Logging

The [good](https://github.com/hapijs/good) and [good-console](https://github.com/hapijs/good-console) plugins are included and configured in `server/plugins/logging`

The logging plugin is only registered in when `NODE_ENV=development`.

Error logging for production should use errbit.

## Views

The [vison](https://github.com/hapijs/vision) plugin is used for template rendering support.

The template engine used in nunjucks inline with the GDS Design System with support for view caching, layouts, partials and helpers.

## Static files

The [Inert](https://github.com/hapijs/inert) plugin is used for static file and directory handling in hapi.js.
Put all static assets in `server/public/static`.

Any build output should write to `server/public/build`. This path is in the `.gitignore` and is therefore not checked into source control.

## Routes

Incoming requests are handled by the server via routes. 
Each route describes an HTTP endpoint with a path, method, and other properties.

Routes are found within their relevant feature/module in the `server/modules` directory and loaded using the `server/plugins/router.js` plugin.

There are lots of [route options](http://hapijs.com/api#route-options), here's the documentation on [hapi routes](http://hapijs.com/tutorials/routing)

## Tasks

Build tasks are created using simple shell scripts or node.js programs.
The default ones are found in the `bin` directory.

The task runner is simply `npm` using `npm-scripts`.

We chose to use this for simplicity but there's nothing to stop you adding `gulp`, `grunt` or another task runner if you prefer. 

The predefined tasks are:

- `npm run build` (Runs all build sub-tasks)
- `npm run build:css` (Builds the client-side sass)
- `npm run lint` (Runs the lint task using standard.js)
- `npm run unit-test` (Runs the `lab` tests in the `/test` folder)
- `npm test` (Runs the `lint` task then the `unit-tests`)

### Resources

For more information around using `npm-scripts` as a build tool:

- http://substack.net/task_automation_with_npm_run
- http://ponyfoo.com/articles/choose-grunt-gulp-or-npm
- http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/
- http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/

## Testing

[lab](https://github.com/hapijs/lab) and [code](https://github.com/hapijs/code) are used for unit testing.

See the `/test` folder for more information.

## Linting

[standard.js](http://standardjs.com/) is used to lint both the server-side and client-side javascript code.

It's defined as a build task and can be run using `npm run lint`.

## License

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government license v3

### About the license

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

