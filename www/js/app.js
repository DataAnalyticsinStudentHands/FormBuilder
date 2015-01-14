'use strict';

/* App Module */

var databaseModule = angular.module('databaseModule', ['restangular', 'databaseControllerModule', 'databaseServicesModule',  'ui.router']);

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

databaseModule.run(['Restangular', '$rootScope', 'Auth', '$q', '$state', function(Restangular, $rootScope, Auth, $q, $state) {
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
}]);