'use strict';

/* App Module */

var databaseModule = angular.module('databaseModule', [
    'restangular',
    'formBuilderControllerModule',
    'formBuilderServiceModule',
    'databaseServicesModule',
    'builder',
    'builder.components',
    'validator.rules',
    'ui.router',
    'ngSanitize',
    'ngNotify'
]);

databaseModule.config(
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");
        $stateProvider.
            state('login', {
                url: "/login",
                views: {
                    "app": { templateUrl: "partials/login.html", controller: "loginCtrl"}
                },
                authenticate: false
            }).
            state('register', {
                url: "/register",
                views: {
                    "app": { templateUrl: "partials/register.html", controller: "registerCtrl"}
                },
                authenticate: false
            }).
            state('secure', {
                url: "/secure",
                views: {
                    "menu_view@secure": { templateUrl: "partials/menuBar.html", controller: "homeCtrl"},
                    "app": { templateUrl: "partials/home.html"}
                },
                abstract: true
            }).
            state('secure.home', {
                url: "/home",
                templateUrl: "partials/form_home.html",
                controller: 'homeCtrl',
                authenticate: true
            }).
            state('secure.builder', {
                url: "/builder/:id",
                templateUrl: "partials/formbuilder.html",
                controller: 'builderCtrl',
                authenticate: true
            }).
            state('secure.form_settings', {
                url: "/form_settings/:id",
                templateUrl: "partials/formSettings.html",
                controller: 'formSettingsCtrl',
                authenticate: true
            }).
            state('secure.response', {
                url: "/response/:id",
                templateUrl: "partials/response.html",
                controller: 'responseCtrl',
                authenticate: true
            }).
            state('secure.response.detail', {
                url: "/detail/:rid",
                views: {
                    "@": {
                        templateUrl: "partials/responseDetail.html",
                        controller: 'responseDetailCtrl'
                    }
                },
                resolve: {
                    form: function(formService, $stateParams) {
                        return formService.getForm($stateParams.id);
                    },
                    response: function(responseService, $stateParams) {
                        return responseService.getResponse($stateParams.rid);
                    }
                },
                authenticate: true
            }).
            state('form', {
                url: "/form/:id",
                templateUrl: "partials/form.html",
                controller: 'formCtrl',
                resolve: {
                    form: function(formService, $stateParams) {
                        return formService.getForm($stateParams.id);
                    }
                },
                authenticate: false
            }).
            state('finished', {
                url: "/finish",
                templateUrl: "partials/finish.html",
                authenticate: false
            });
    });

databaseModule.run(['Restangular', '$rootScope', 'Auth', '$q', '$state', '$builder', function(Restangular, $rootScope, Auth, $q, $state, $builder) {
    //Restangular.setBaseUrl("https://www.housuggest.org:8443/FormBuilder/");
    Restangular.setBaseUrl("http://localhost:8080/RESTFUL-WS/");
    $rootScope.Restangular = function() {
        return Restangular;
    };
    $rootScope.isAuthenticated = function() {
        return Auth.hasCredentials();
    };
    $rootScope.$on("$stateChangeStart", function(event, toState){
        // User isn’t authenticated
        if(toState.name == "form"  && !Auth.hasCredentials()) {
            Auth.setCredentials("Visitor", "test");
        } else if (toState.authenticate && !$rootScope.isAuthenticated()){
            $state.go("login");
            event.preventDefault();
        }
    });

    $builder.registerComponent('description', {
        group: 'Utilities',
        label: 'TextBlock',
        description: "This is a textblock.",
        required: false,
        arrayToText: true,
        templateUrl: "partials/component/tmplDescription.html",
        popoverTemplateUrl: "partials/component/popDescription.html"
    });

    $builder.registerComponent('dateInput', {
        group: 'Utilities',
        label: 'Date',
        description: 'Choose a Date',
        placeholder: '',
        required: false,
        templateUrl: 'partials/component/tmplDate.html',
        popoverTemplateUrl: 'partials/component/popDate.html'
    });

    $builder.registerComponent('section', {
        group: 'Utilities',
        label: 'Section/Page Name',
        description: 'Conditional Section/Page Description',
        placeholder: '',
        required: false,
        templateUrl: 'partials/component/tmplSection.html',
        popoverTemplateUrl: 'partials/component/popSection.html'
    });
}]);