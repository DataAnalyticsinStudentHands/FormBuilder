/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormResponder', [
    'FormData',
    'ResponseData',
    'builder',
    'builder.components',
    'validator.rules',
    'ui.router'
]);

angular.module('FormResponder').config(
    function ($stateProvider) {
        $stateProvider
            .state('form', {
            url: "/form/:id",
            views: {
                "app": {
                    templateUrl: "modules/formResponder/form.html",
                    controller: 'formCtrl'
                }
            },
            resolve: {
                form: function (formService, $stateParams, $state) {
                    return formService.getForm($stateParams.id).then(function (data) {
                        return data;
                    }, function (data) {
                        if (new Date() > data.data.expiration_date) {
                            $state.go('closed', {id: $stateParams.id, form: JSON.stringify(data.data)});
                        } else if (data.status === 401 && data.data.enabled) {
                            $state.go('login', {form_id: $stateParams.id});
                        } else {
                            $state.go('closed', {id: $stateParams.id, form: JSON.stringify(data.data)});
                        }
                    });
                }
            },
            data: {pageTitle: 'Form'},
            authenticate: false
        })
            .state('finished', {
                url: "/finish/:id",
                views: {
                    "app": {
                        templateUrl: "modules/formResponder/finish.html", controller: "finishedCtrl"
                    }
                },
                resolve: {
                    form: function (formService, $stateParams) {
                        return formService.getForm($stateParams.id);
                    }
                },
                data: {pageTitle: 'Finished'},
                authenticate: false
            })
            .state('closed', {
            url: "/close/:id/:form",
            views: {
                "app": {
                    templateUrl: "modules/formResponder/closed.html", controller: "closedCtrl"
                }
            },
            authenticate: false
        });
    });


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
                ngNotify.set("E-Mail is required to receive receipt.", {type: "error", duration: 10000});
            } else {
                $validator.validate($scope, $scope.id).success(function () {
                    responseService.newResponse($scope.input, $scope.id, $scope.uid, $scope.responder_email).then(function () {
                        ngNotify.set("Form submission success!", {type: "success", duration: 5000});
                        $state.go("finished", {"id": $scope.form_obj.id});
                        $scope.input = null;
                    }, function () {
                        ngNotify.set("Submission failed!", {type: "error", duration: 10000});
                    });
                }).error(function () {
                    ngNotify.set("Form submission error, please verify form contents.", {type: "error", duration: 10000});
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