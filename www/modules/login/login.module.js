/**
 * Created by Carl on 12/29/2015.
 */
angular.module('Login', []);

angular.module('Login').controller('loginCtrl',
    function ($scope, Auth, $state, ngNotify, $stateParams) {
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
                $scope.loginResultPromise = $scope.Restangular().all("users").one("myUser").get();
                $scope.loginResultPromise.then(function (result) {
                    $scope.loginResult = result;
                    ngNotify.set("Login success!", "success");
                    Auth.confirmCredentials();
                    if ($scope.form_id) $state.go('form', {id: $scope.form_id}); else $state.go('secure.home');
                }, function () {
                    ngNotify.set("Login failure, please try again!", "error");
                    $scope.loginMsg = "Arghhh, matey! Check your username or password.";
                    Auth.clearCredentials();
                });
                $scope.userName = '';
                $scope.passWord = '';
            } else if (!$scope.userName && !$scope.passWord) {
                $scope.loginMsg = "You kiddin' me m8? No username or password?";
            } else if (!$scope.userName) {
                $scope.loginMsg = "No username? Tryina hack me?";
                $scope.loginResult = "";
            } else if (!$scope.passWord) {
                $scope.loginMsg = "What? No password!? Where do you think you're going?";
                $scope.loginResult = "";
            }
        };
    });

angular.module('Login').controller('registerCtrl',
    function ($scope, $state, Auth, ngNotify, $stateParams) {
        $scope.registerUser = function () {
            var errorMSG;
            if ($scope.password.pw == $scope.password.pwc) {
                Auth.setCredentials("Visitor", "test");
                $scope.salt = "nfp89gpe";
                $scope.register.password = String(CryptoJS.SHA512($scope.password.pw + $scope.register.username + $scope.salt));
                $scope.$parent.Restangular().all("users").post($scope.register).then(
                    function () {
                        Auth.clearCredentials();
                        ngNotify.set("Registration success!", "success");
                        $state.go("login", {"form_id": $stateParams.form_id}, {reload: true});
                    }, function (error) {
                        errorMSG = "Registration Failure!";
                        if (error.status == 409)
                            errorMSG = "Account with e-mail address already exists!";
                        ngNotify.set(errorMSG, "error");
                        Auth.clearCredentials();
                    }, function () {
                        $scope.register = null;
                        $scope.password = null;
                    }
                );
                Auth.clearCredentials();
            } else {
                errorMSG = "Passwords do not match.";
                ngNotify.set(errorMSG, "error");
            }
        };
        $scope.cancel = function () {
            $state.go('login');
        }
    });
