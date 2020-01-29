# Ivory front office
Digital service to support the Ivory Act.

(Please note that this service is best installed as part of the [Ivory root project](https://github.com/DEFRA/ivory))

[![Build Status](https://travis-ci.com/DEFRA/ivory-front-office.svg?branch=master)](https://travis-ci.com/DEFRA/ivory-front-office)
[![Known Vulnerabilities](https://snyk.io/test/github/defra/ivory-front-office/badge.svg)](https://snyk.io/test/github/defra/ivory-front-office)
[![Code Climate](https://codeclimate.com/github/DEFRA/ivory-front-office/badges/gpa.svg)](https://codeclimate.com/github/DEFRA/ivory-front-office)
[![Test Coverage](https://codeclimate.com/github/DEFRA/ivory-front-office/badges/coverage.svg)](https://codeclimate.com/github/DEFRA/ivory-front-office/coverage)

## Development Team

This module was developed by the Ivory team as part of a digital transformation project at [DEFRA](https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs), a department of the UK government

## Prerequisites

Please make sure the following are installed:

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Node.js v10/Dubnuim](https://nodejs.org/en/) recommend
  installing nvm and using `nvm install 10`
- [StandardJS](https://standardjs.com/) using `npm install -g standard`

Check that your environment is running the correct versions of `node` and `npm`:
```bash
$ npm --version
6.13.4
$ node --version
v10.18.1
```
Please note that this project needs to be configured to access an instance of the [ivory-services](https://github.com/DEFRA/ivory-services) REST service

## Installation

The best way to work on this project is by installing the multi-project [ivory](https://github.com/DEFRA/ivory) with all three of the ivory services installed locally.

If you still want to work on this project individually then clone the repository and install its package
dependencies:

```bash
git clone https://github.com/DEFRA/ivory-front-office.git && cd ivory-front-office
npm install
```

# Setting up .env

Copy the `.env.example` file to `.env` and set it up for your
environment

```bash
cp .env.example .env
```

## Running the app

Make sure the [ivory-services](https://github.com/DEFRA/ivory-services) service is running prior to starting the app

Run the app using  **npm**

```bash
npm start
```

## Unit testing the app

Use the following **npm** task. This runs the **StandardJS**
linting as well as the unit tests to produce a `coverage.html`
report

```bash
npm test
```

Check the server is running by pointing your browser to `http://localhost:3000`

## Plugins

hapi has a powerful plugin system and as much server code as possible should be loaded in a plugin.

Plugins live in the `server/plugins` directory.

## Logging

The [good](https://github.com/hapijs/good) and [good-console](https://github.com/hapijs/good-console) plugins are included and configured in `server/plugins/logging`

The logging plugin is only registered in when `NODE_ENV=development`.

Error logging for production should use errbit.

## Views

The [hapi-govuk-frontend](https://github.com/DEFRA/hapi-govuk-frontend) plugin is used for GDS Design system nunjucks template rendering support.

The template engine used is nunjucks inline with the GDS Design System with support for view caching, layouts, partials and helpers.

## Static files

The [Inert](https://github.com/hapijs/inert) plugin is used for static file and directory handling in hapi.js.
Put all static assets in `server/public/static`.

Any build output should write to `server/public/build`. This path is in the `.gitignore` and is therefore not checked into source control.

## Routes and flow

Incoming requests are handled by the server via routes. 
Each route describes an HTTP endpoint with a path, method, and other properties.
The configuration for these routes can be found in `server/flow.yml`

The handlers for these routes are found within their relevant feature/module in the `server/modules` directory and loaded using the `server/plugins/flow.js` plugin.

See the [defra-hapi-route-flow](https://github.com/DEFRA/defra-hapi-route-flow) module/plugin, for more information

### Resources

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

Note that the `.labrc.js` file is configured to allow the test scripts to sit within the same directories as the js file they are testing.

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

