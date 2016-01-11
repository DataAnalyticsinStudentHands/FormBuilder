/**
 * Created by Carl on 12/29/2015.
 */
angular.module('Login', [
    'databaseServicesModule',
    'ui.router'
]);

angular.module('Login').config(
    function ($stateProvider) {
        $stateProvider
            .state('login', {
                url: "/login/:form_id",
                views: {
                    "app": {templateUrl: "modules/login/login.html", controller: "loginCtrl"}
                },
                data: {pageTitle: 'Login'},
                authenticate: false
            })
            .state('register', {
                url: "/register/:form_id",
                views: {
                    "app": {templateUrl: "modules/login/register.html", controller: "registerCtrl"}
                },
                data: {pageTitle: 'Register'},
                authenticate: false
            });
    });

angular.module('Login').run(
    function ($rootScope, Auth, $q, $state, userService, ngNotify) {
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

angular.module('Login').controller('loginCtrl',
    function ($scope, Auth, $state, ngNotify, $stateParams, Restangular) {
        $scope.form_id = $stateParams.form_id;
        if ($scope.isAuthenticated() === true) {
            //Point 'em to logged in page of app
            $state.go('secure.home');
        }

        //we need to put the salt on server + client side and it needs to be static
        $scope.salt = "nfp89gpe"; //PENDING
        $scope.submit = function () {
            if ($scope.userName && $scope.passWord) {
                $scope.passWordHashed = String(CryptoJS.SHA512($scope.passWord + $scope.userName + $scope.salt));
                Auth.setCredentials($scope.userName, $scope.passWordHashed);
                $scope.loginResultPromise = Restangular.all("users").one("myUser").get();
                $scope.loginResultPromise.then(function (result) {
                    $scope.loginResult = result;
                    ngNotify.set("Login success!", {type: "success", duration: 5000});
                    Auth.confirmCredentials();
                    if ($scope.form_id) $state.go('form', {id: $scope.form_id}); else $state.go('secure.home');
                }, function (failure) {
                    console.log(failure);
                    if (failure.status = 501 && failure.data.message) {
                        ngNotify.set(failure.data.message, {type: "success", duration: 5000});
                    } else {
                        ngNotify.set("Please check username and password entered.", {
                            type: "error",
                            duration: 10000
                        });
                    }
                    Auth.clearCredentials();
                });
                $scope.userName = '';
                $scope.passWord = '';
            }
        };
    });

angular.module('Login').controller('registerCtrl',
    function ($scope, $state, Auth, ngNotify, $stateParams, Restangular) {
        $scope.registerUser = function () {
            var errorMSG;
            if ($scope.password.pw == $scope.password.pwc) {
                Auth.setCredentials("Visitor", "test");
                $scope.salt = "nfp89gpe";
                $scope.register.password = String(CryptoJS.SHA512($scope.password.pw + $scope.register.username + $scope.salt));
                Restangular.all("users").post($scope.register).then(
                    function () {
                        Auth.clearCredentials();
                        ngNotify.set("Registration success, please check your email to activate account.", {type: "success", duration: 5000});
                        $state.go("login", {"form_id": $stateParams.form_id}, {reload: true});
                    }, function (error) {
                        errorMSG = "Registration Failure!";
                        if (error.status == 409)
                            errorMSG = "Account with e-mail address already exists!";
                        ngNotify.set(errorMSG, {type: "error", duration: 10000});
                        Auth.clearCredentials();
                    }, function () {
                        $scope.register = null;
                        $scope.password = null;
                    }
                );
                Auth.clearCredentials();
            } else {
                errorMSG = "Passwords do not match.";
                ngNotify.set(errorMSG, {type: "error", duration: 10000});
            }
        };
        $scope.cancel = function () {
            $state.go('login');
        }
    });

angular.module('Login').factory('userService',
    function (Restangular) {
        return {
            getMyUser: function () {
                return Restangular.all("users").get("myUser");
            },
            getMyRole: function () {
                return Restangular.all("users").all("myRole").getList().then(function (success) {
                    return success[0];
                });
            },
            getAllUsers: function () {
                return Restangular.all("users").getList().then(function (success) {
                    return success.plain();
                })
            }
        }
    });