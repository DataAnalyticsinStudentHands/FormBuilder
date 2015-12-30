/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormResponder', []);

angular.module('FormResponder').controller('formCtrl',
    function ($scope, $builder, $validator, $stateParams, form, $filter, responseService, $state, ngNotify) {
        $scope.id = $stateParams.id;
        $scope.receipt_required = form.send_receipt;
        $scope.send_receipt = form.send_receipt;
        $scope.$parent.form_obj = form;
        $builder.forms[$scope.id] = null;
        form.questions.forEach(function (question) {
            $builder.addFormObject($scope.id, {
                id: question.question_id,
                component: question.component,
                description: question.description,
                label: question.label,
                index: question.index,
                placeholder: question.placeholder,
                required: question.required,
                options: question.options,
                validation: question.validation,
                settings: question.settings
            });
        });

        $scope.form = $builder.forms[$scope.id];
        $scope.input = [];
        $scope.submit = function () {
            if ($scope.send_receipt && !$scope.responder_email) {
                ngNotify.set("E-Mail is required to receive receipt.", "error");
            } else {
                $validator.validate($scope, $scope.id).success(function () {
                    console.log($scope.input);
                    responseService.newResponse($scope.input, $scope.id, $scope.uid, $scope.responder_email).then(function () {
                        ngNotify.set("Form submission success!", "success");
                        $state.go("finished", {"id": $scope.form_obj.id});
                        $scope.input = null;
                    }, function () {
                        ngNotify.set("Submission failed!", "error");
                    });
                }).error(function () {
                    ngNotify.set("Form submission error, please verify form contents.", "error");
                });
            }
        };
    });

angular.module('FormResponder').controller('finishedCtrl',
    function ($scope, form, $timeout) {
        $scope.form = form;
        if ($scope.form.redirect_url) {
            $timeout(function () {
                location.replace(form.redirect_url);
            }, 5000)
        }
    });

angular.module('FormResponder').controller('closedCtrl',
    function ($scope, $stateParams) {
        $scope.form = JSON.parse($stateParams.form);
    });