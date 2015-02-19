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
    'ngNotify',
    'angularFileUpload'
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
            state('secure.user_response', {
                url: "/user_response",
                templateUrl: "partials/userResponse.html",
                controller: 'userResponseCtrl',
                authenticate: true
            }).
            state('secure.response.detail', {
                url: "/detail/:rid",
                views: {
                    "@secure": {
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
            state('download', {
                url: "/file/:id",
                views: {
                    "app": {
                        templateUrl: "partials/file.html", controller: "fileDownloadCtrl"
                    }
                },
                authenticate: true
            }).
            state('form', {
                url: "/form/:id",
                views: {
                    "app": {
                        templateUrl: "partials/form.html",
                        controller: 'formCtrl'
                    }
                },
                resolve: {
                    form: function(formService, $stateParams) {
                        return formService.getForm($stateParams.id);
                    }
                },
                authenticate: false
            }).
            state('finished', {
                url: "/finish/:id",
                views: {
                    "app": {
                        templateUrl: "partials/finish.html", controller: "finishedCtrl"
                    }
                },
                resolve: {
                    form: function(formService, $stateParams) {
                        return formService.getForm($stateParams.id);
                    }
                },
                authenticate: false
            });
    });

databaseModule.run(['Restangular', '$rootScope', 'Auth', '$q', '$state', '$builder', 'userService',
    function(Restangular, $rootScope, Auth, $q, $state, $builder, userService) {
    Restangular.setBaseUrl("https://www.housuggest.org:8443/FormBuilder/");
    //Restangular.setBaseUrl("http://localhost:8080/RESTFUL-WS/");

    $rootScope.Restangular = function() {
        return Restangular;
    };
    $rootScope.isAuthenticated = function(authenticate) {
        userService.getMyUser().then(function (result) {
            $rootScope.uid = result.id.toString();
            $rootScope.uin = result.username.toString();
        }, function (error) {
            if (error.status === 0) { // NO NETWORK CONNECTION OR SERVER DOWN, WE WILL NOT LOG THEM OUT
                ngNotify.set("Internet or Server Unavailable", {type: "error", sticky: true});
            } else { //Most Likely a 403 - LOG THEM OUT
                if (authenticate) {
                    Auth.clearCredentials();
                    $state.go("login");
                    location.reload();
                }
            }
        });
        return Auth.hasCredentials();
    };
    $rootScope.$on("$stateChangeStart", function(event, toState){
        // User isn’t authenticated
        if(toState.name == "form"  && !Auth.hasCredentials()) {
            Auth.setCredentials("Visitor", "test");
        } else if (toState.authenticate && !$rootScope.isAuthenticated(toState.authenticate)){
            // User isn’t authenticated
            $state.go("login");
            //Prevents the switching of the state
            event.preventDefault();
        }
        $rootScope.isAuthenticated(false);
    });

    $builder.registerComponent('descriptionHorizontal', {
        group: 'Other',
        label: 'TextBlock 1',
        description: "This is a textblock.",
        required: false,
        arrayToText: true,
        templateUrl: "partials/component/tmplDescriptionHorizontal.html",
        popoverTemplateUrl: "partials/component/popDescriptionHorizontal.html"
    });
    $builder.registerComponent('description', {
        group: 'Other',
        label: 'TextBlock 2',
        description: "This is a textblock.",
        required: false,
        arrayToText: true,
        templateUrl: "partials/component/tmplDescription.html",
        popoverTemplateUrl: "partials/component/popDescription.html"
    });
    $builder.registerComponent('dateTimeInput', {
        group: 'Other',
        label: 'Date Time Picker',
        description: 'Choose a Date and Time',
        placeholder: '',
        required: false,
        templateUrl: 'partials/component/tmplDateTime.html',
        popoverTemplateUrl: 'partials/component/popDateTime.html'
    });
    $builder.registerComponent('dateInput', {
        group: 'Other',
        label: 'Date',
        description: 'Choose a Date',
        placeholder: '',
        required: false,
        templateUrl: 'partials/component/tmplDate.html',
        popoverTemplateUrl: 'partials/component/popDate.html'
    });
    $builder.registerComponent('phoneInput', {
        group: 'Common',
        label: 'Phone',
        description: 'Phone Number',
        validation: '/.*/',
        placeholder: 'placeholder',
        required: false,
        templateUrl: 'partials/component/tmplPhone.html',
        popoverTemplateUrl: 'partials/component/popPhone.html'
    });
    $builder.registerComponent('name', {
        group: 'Other',
        label: 'Name',
        required: false,
        arrayToText: true,
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Save'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
    });
    $builder.registerComponent('address', {
        group: 'Other',
        label: 'Address',
        required: false,
        arrayToText: true,
        templateUrl: "partials/component/tmplAddress.html",
        popoverTemplateUrl: "partials/component/popAddress.html"
    });
    $builder.registerComponent('section', {
        group: 'Other',
        label: 'Section/Page Name',
        description: 'Conditional Section/Page Description',
        placeholder: '',
        required: false,
        templateUrl: 'partials/component/tmplSection.html',
        popoverTemplateUrl: 'partials/component/popSection.html'
    });
    $builder.registerComponent('fileUpload', {
        group: 'Other',
        label: 'Upload a file',
        description: 'Upload a file',
        required: false,
        templateUrl: 'partials/component/tmplFileUpload.html',
        popoverTemplateUrl: 'partials/component/popFileUpload.html'
    });
}]);