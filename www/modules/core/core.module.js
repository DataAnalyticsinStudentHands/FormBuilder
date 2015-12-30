'use strict';

/* App Module */
angular.module('FormBuilderCore', [
    'FormBuilder',
    'FormResponder',
    'FormBuilderComponents',
    'Login',
    'UserResponseViewer',
    'FormResponseViewer',
    'Study',
    'formBuilderServiceModule',
    'restangular',
    'databaseServicesModule',
    'builder',
    'builder.components',
    'validator.rules',
    'ui.router',
    'ngSanitize',
    'ngNotify',
    'angularFileUpload',
    'ui.bootstrap.datetimepicker',
    'ui.grid',
    'ui.grid.resizeColumns',
    'ui.bootstrap',
    'signature'
]);

angular.module('FormBuilderCore').run(
    function (Restangular, $rootScope, Auth, $q, $state, userService, ngNotify) {
        Restangular.setBaseUrl("https://housuggest.org:8443/FormBuilderBackendTest/");

        $rootScope.Restangular = function () {
            return Restangular;
        };

        $rootScope.isAuthenticated = function (authenticate) {
            var notAuthenticatedCallback = function (error) {
                if (error.status === 0) { // NO NETWORK CONNECTION OR SERVER DOWN, WE WILL NOT LOG THEM OUT
                    ngNotify.set("Internet or Server Unavailable", {type: "error", sticky: true});
                } else { //Most Likely a 403 - LOG THEM OUT
                    if (authenticate) {
                        Auth.clearCredentials();
                        $state.go("login");
                        location.reload();
                    }
                }
            };
            if (!Auth.hasCredentials()) {
                return false;
                notAuthenticatedCallback();
            }
            userService.getMyUser().then(function (result) {
                $rootScope.uid = result.id.toString();
                $rootScope.uin = result.username.toString();
            }, notAuthenticatedCallback);
            return Auth.hasCredentials();
        };
        $rootScope.$on("$stateChangeStart", function (event, toState) {
            $('*').popover('hide'); //hide ALL the popovers (on state change)
            $('body').removeClass('loaded');
            // User isn’t authenticated
            if (toState.name == "form" && !Auth.hasCredentials()) {
                Auth.setCredentials("Visitor", "test");
            } else if (toState.authenticate && !$rootScope.isAuthenticated(toState.authenticate)) {
                // User isn’t authenticated
                $state.go("login");
                //Prevents the switching of the state
                event.preventDefault();
            }
            $rootScope.isAuthenticated(false);
        });
        $rootScope.$on("$stateChangeSuccess", function () {
            $('body').addClass('loaded');
        });
        $rootScope.$on("$stateChangeError", function () {
            $('body').addClass('loaded');
        });
    });

angular.module('FormBuilderCore').controller('homeCtrl',
    function ($scope, Auth, $state, formService, ngNotify, forms) {
        $scope.state = $state;
        $scope.myForms = forms;
        $scope.filterByQuestion = function (inForm) {
            if ($scope.query) {
                // Filters by name
                var matchArr = inForm.name.toLowerCase().match($scope.query.toLowerCase());
                if (matchArr && (matchArr.length > 0))
                    return true;
                // Filters by subtitle
                if (inForm.subtitle)
                    matchArr = inForm.subtitle.toLowerCase().match($scope.query.toLowerCase());
                if (matchArr && (matchArr.length > 0))
                    return true;
                for (var i = 0; i < inForm.questions.length; i++) {
                    // Filters by question label
                    if (inForm.questions[i].label)
                        matchArr = inForm.questions[i].label.toLowerCase().match($scope.query.toLowerCase());
                    if (matchArr && (matchArr.length > 0))
                        return true;
                    // Filters by question description
                    if (inForm.questions[i].description)
                        matchArr = inForm.questions[i].description.toLowerCase().match($scope.query.toLowerCase());
                    if (matchArr && (matchArr.length > 0))
                        return true;
                }
                return false;
            }
            else
                return true;
        }
    });

angular.module('FormBuilderCore').controller('menuCtrl',
    function ($scope, Auth, ngNotify, $state) {
        $scope.logOut = function () {
            Auth.clearCredentials();
            ngNotify.set("Successfully logged out!", "success");
            $state.go('secure.home', {}, {reload: true});
        }
    });
