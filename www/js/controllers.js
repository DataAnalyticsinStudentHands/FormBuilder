'use strict';
/* Controllers */
var databaseController = angular.module('databaseControllerModule', []);

databaseController.controller('loginCtrl', ['$scope', 'Auth', '$state',
 function($scope, Auth, $state) {
     if($scope.isAuthenticated() === true) {
         //Point 'em to logged in page of app
         $state.go('secure.home');
     }
     
     //we need to put the salt on server + client side and it needs to be static
     $scope.salt = "nfp89gpe"; //PENDING
     
     $scope.submit = function() {
         if ($scope.userName && $scope.passWord) {
             $scope.passWordHashed = new String(CryptoJS.SHA512($scope.passWord + $scope.userName + $scope.salt));
//             console.log($scope.passWordHashed);
             Auth.setCredentials($scope.userName, $scope.passWordHashed);
//             $scope.loginResult = $scope.Restangular.get();
             $scope.loginResultPromise = $scope.Restangular().all("users").one("myUser").get();
             $scope.loginResultPromise.then(function(result) {
                $scope.loginResult = result;
                $scope.loginMsg = "You have logged in successfully! Status 200OK technomumbojumbo";
                Auth.confirmCredentials();
                $state.go('secure.home');
             }, function(error) {
                $scope.loginMsg = "Arghhh, matey! Check your username or password.";
                Auth.clearCredentials();
             });
             $scope.userName = '';
             $scope.passWord = '';
         } else if(!$scope.userName && !$scope.passWord) {
             $scope.loginMsg = "You kiddin' me m8? No username or password?";
         } else if (!$scope.userName) {
             $scope.loginMsg = "No username? Tryina hack me?";
             $scope.loginResult = "";
         } else if (!$scope.passWord) {
             $scope.loginMsg = "What? No password!? Where do you think you're going?";
             $scope.loginResult = "";
         }
     };
 }]);

databaseController.controller('registerCtrl', ['$scope', '$state', 'Auth',
    function($scope, $state, Auth) {
    $scope.registerUser = function() {
        Auth.setCredentials("Visitor", "test");
        $scope.salt = "nfp89gpe";
        $scope.register.password = new String(CryptoJS.SHA512($scope.register.password + $scope.register.username + $scope.salt));
        $scope.$parent.Restangular().all("users").post($scope.register).then(
            function(success) {
                Auth.clearCredentials();
                console.log("USER CREATED");
                $state.go("login", {}, {reload: true});
            },function(fail) {
                Auth.clearCredentials();
                console.log("REGISTRATION FAILURE");
        });

        Auth.clearCredentials();
    }
}]);

databaseController.controller('secureCtrl', ['$scope', 'Auth', '$state',
  function($scope, Auth, $state) {
      //nothing to see here, move along
      $scope.logOut = function() {
          console.log('loggedout');
          Auth.clearCredentials();
          $state.go('secure.home',{},{reload: true});
      }
  }]);

databaseController.controller('builderCtrl', ['$scope', '$builder', '$validator', 'formService',
    function($scope, $builder, $validator, formService) {
      $builder.forms['default'] = null;

      $scope.input = [];
      $scope.submit = function() {
        return $validator.validate($scope, 'default').success(function() {
          return console.log('success');
        }).error(function() {
          return console.log('error');
        });
      };
      $scope.save = function() {
          formService.newForm(angular.copy($builder.forms['default']));
      }
    }]);

databaseController.controller('formCtrl', ['$scope', '$builder', '$validator', '$stateParams', 'form', '$filter', 'responseService', '$state',
    function($scope, $builder, $validator, $stateParams, form, $filter, responseService, $state) {
      $scope.id = $stateParams.id;
      $scope.form_obj = form;
      $builder.forms[$scope.id] = null;

        var questions = $filter('orderBy')(form.questions, "index", false);
        questions.forEach(function(question){
            console.log(question);
            $builder.addFormObject($scope.id, {
                id: question.question_id,
                component: question.component,
                description: question.description,
                label: question.label,
                index: question.index,
                placeholder: question.placeholder,
                required: question.required,
                options: eval(question.options)
            });
        });

      $scope.form = $builder.forms[$scope.id];
      $scope.input = [];
      $scope.defaultValue = {};
      return $scope.submit = function() {
        return $validator.validate($scope, $scope.id).success(function() {
            responseService.newResponse($scope.input, $scope.id).then(function(){
                $state.go("finished");
                $scope.input = null;
            });
            return console.log('success');
        }).error(function() {
          return console.log('error');
        });
      };
    }]);