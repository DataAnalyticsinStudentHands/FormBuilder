'use strict';

/* App Module */

var databaseModule = angular.module('databaseModule', ['restangular', 'databaseControllerModule', 'databaseServicesModule',  'ui.router', 'builder', 'builder.components', 'validator.rules']);

databaseModule.config(
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    $stateProvider.
      state('loggedout', {
        abstract: true,
        template: "<ui-view>"
      }).
      state('login', {
          url: "/login",
          templateUrl: "partials/login.html",
          controller: 'loginCtrl',
          authenticate: false
      });
    $stateProvider.
      state('register', {
          url: "/register",
          templateUrl: "partials/register.html",
          controller: 'registerCtrl',
          authenticate: false
      });

    $stateProvider.
      state('loggedin', {
          abstract: true,
          template: "<ui-view>"
      }).
      state('secure', {
          url: "/secure",
          templateUrl: "partials/formbuilder.html",
          controller: 'secureCtrl',
          authenticate: true
      });
  });

databaseModule.run(['Restangular', '$rootScope', 'Auth', '$q', '$state', '$builder', function(Restangular, $rootScope, Auth, $q, $state, $builder) {
//    Restangular.setBaseUrl("http://localhost:8080/RESTFUL-WS/services/");
    Restangular.setBaseUrl("https://www.housuggest.org:8443/FormBuilder/");
    $rootScope.Restangular = function() {
        return Restangular;
    }
    $rootScope.isAuthenticated = function() {
        return Auth.hasCredentials();
    }
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
      console.log("$stateChangeStart");
      console.log($rootScope.isAuthenticated());
      if (toState.authenticate && !$rootScope.isAuthenticated()){
        console.log("non-authed");
        // User isn’t authenticated
        $state.go("login");
        //What?
        event.preventDefault(); 
      } else console.log("authed");
    });
    
        
      $builder.registerComponent('sampleInput', {
        group: 'from html',
        label: 'Sample',
        description: 'From html template',
        placeholder: 'placeholder',
        required: false,
        validationOptions: [
          {
            label: 'none',
            rule: '/.*/'
          }, {
            label: 'number',
            rule: '[number]'
          }, {
            label: 'email',
            rule: '[email]'
          }, {
            label: 'url',
            rule: '[url]'
          }
        ],
        templateUrl: 'partials/template.html',
        popoverTemplateUrl: 'partials/popoverTemplate.html'
      });
    
      return $builder.registerComponent('name', {
        group: 'Default',
        label: 'Name',
        required: false,
        arrayToText: true,
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Save'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
      });
}]);