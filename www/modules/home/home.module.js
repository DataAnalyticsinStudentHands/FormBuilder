'use strict';

/* App Module */
angular.module('FormBuilderHome', [
    'FormData',
    'ui.router',
    'ui.bootstrap.datetimepicker',
    'ui.bootstrap',
    'ngSanitize',
    'ngNotify'
]);

angular.module('FormBuilderHome').controller('homeCtrl',
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

angular.module('FormBuilderHome').controller('menuCtrl',
    function ($scope, Auth, ngNotify, $state) {
        $scope.logOut = function () {
            Auth.clearCredentials();
            ngNotify.set("Successfully logged out!", {type: "success", duration: 5000});
            $state.go('secure.home', {}, {reload: true});
        }
    });
