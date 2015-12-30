/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormResponseViewer', [
    'ui.grid',
    'ui.grid.resizeColumns'
]);

angular.module('FormResponseViewer').config(
    function ($stateProvider) {
        $stateProvider
            .state('secure.response', {
                url: "/response/:id",
                templateUrl: "/modules/formResponseViewer/response.html",
                controller: 'responseCtrl',
                resolve: {
                    form: function (formService, $stateParams) {
                        return formService.getForm($stateParams.id);
                    },
                    responses: function (responseService, $stateParams) {
                        return responseService.getResponsesByFormId($stateParams.id);
                    }
                },
                data: {pageTitle: 'Responses'},
                authenticate: true
            });
    });

angular.module('FormResponseViewer').controller('responseViewCtrl',
    function ($scope, $builder, $validator, $stateParams, form, $filter, $state, ngNotify, response) {
        $scope.id = $stateParams.id;
        $scope.receipt_required = form.send_receipt;
        $scope.send_receipt = form.send_receipt;
        $scope.$parent.form_obj = form;
        $builder.forms[$scope.id] = null;

        form.questions.forEach(function (question) {
            if (question.component != "section" && question.component != "descriptionHorizontal") {
                question.component = "description";
            }
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
        $scope.defaultValue = {};
        response.entries.forEach(function (response) {
            $scope.defaultValue[response.question_id] = response.value;
        });

        $scope.form = $builder.forms[$scope.id];
    });