FormBuilder
===========

FormBuilder is a dynamic form building web application that works with dynamic forms and provides sharing functionality. It communicates to a Java Backend located in FormBuilderBackend repo. FormBuilder allows users to dynamically generate, respond to, and process responses to forms. FormBuilder is the portion of the application that is deployed to the online website, it is not intended to run in a mobile environment; use FormViewer applications for mobile usage.

It is built from the [angular-form-builder](https://github.com/kelp404/angular-form-builder) and therefore the internal structure and workings of the module can be difficult to work with as they not well documented and are written in CoffeeScript. It is recommended to become familiar with `angular-form-builder` documentation before working with FormBuilder.

### Documentation Contents
- [FormBuilder File Structure](https://github.com/DataAnalyticsinStudentHands/DASH-Documentation/blob/master/Code%20Development/Frontend/FormBuilder/FormBuilder-File-Structure.md)
- [Working with `angular-form-builder` Core Module](https://github.com/DataAnalyticsinStudentHands/DASH-Documentation/blob/master/Code%20Development/Frontend/FormBuilder/FormBuilder-Core.md)
- [FormBuilder Modules](https://github.com/DataAnalyticsinStudentHands/DASH-Documentation/blob/master/Code%20Development/Frontend/FormBuilder/FormBuilder-Modules.md)
- [Components](https://github.com/DataAnalyticsinStudentHands/DASH-Documentation/blob/master/Code%20Development/Frontend/FormBuilder/FormBuilder-Component.md)

### Development Prerequisites
- bower `npm install -g bower`
- gulp `npm install -g gulp`
- npm packages `npm install`

### Getting Started
1. Run `npm install`. This uses `package.js` to install local dependencies.
2. Run `gulp setup`. This runs common setup tasks, especially `bower install` using bower.json.
2. Run `ionic serve`. This uses `ionic.xml` and will serve as local node server. Live updates when you make changes to the code.

### Gulpfile
This repository is configured to deploy to Housuggest `gulp deploy-prod` and HnetDev `gulp deploy-dev` remote sites. Additional documentation [here](https://github.com/DataAnalyticsinStudentHands/DASH-Documentation/blob/master/Code%20Development/Frontend/App-Deployment-to-web-server.md).

### NOTE
This application is not intended to be deployed as a mobile application. Please use [Form Viewer App](https://github.com/DataAnalyticsinStudentHands/FormViewerApp) instead.