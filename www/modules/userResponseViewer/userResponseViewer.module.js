/**
 * Created by Carl on 12/29/2015.
 */
angular.module('UserResponseViewer', [
    'builder',
    'builder.components',
    'validator.rules',
    'ui.router'
]);

angular.module('UserResponseViewer').config(
    function ($stateProvider) {
        $stateProvider
            .state('responseView', {
                url: "/view/:id/:view/:response_id",
                views: {
                    "app": {
                        templateUrl: "modules/userResponseViewer/responseView.html",
                        controller: 'responseViewCtrl'
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
                    },
                    response: function (responseService, $stateParams) {
                        return responseService.getResponse($stateParams.response_id, $stateParams.id);
                    }
                },
                data: {pageTitle: 'Form'},
                authenticate: false
            });
    });

angular.module('UserResponseViewer').controller('responseCtrl',
    function ($scope, Auth, $state, formService, responseService, $stateParams, $filter, responses, form, ngNotify) {
        $scope.curState = $state.current.name;
        $scope.form_id = $stateParams.id;
        $scope.delete = function (row) {
            bootbox.dialog({
                title: "Delete Response",
                message: "Are you sure? Deleting will cause data loss!",
                buttons: {
                    success: {
                        label: "Cancel",
                        className: "btn-default"
                    },
                    danger: {
                        label: "Delete",
                        className: "btn-danger",
                        callback: function () {
                            var index = $scope.gridOptions.data.indexOf(row.entity);
                            responseService.deleteResponse(responses[index].id);
                            $scope.gridOptions.data.splice(index, 1);
                            responses.splice(index, 1);
                            ngNotify.set("Response deleted successfully.", {
                                position: 'bottom',
                                type: 'success',
                                duration: 5000
                            });
                        }
                    }
                }
            });
        };
        $scope.showForm = function (row) {
            $state.go('responseView', {
                "view": true,
                "id": responses[$scope.gridOptions.data.indexOf(row.entity)].form_id,
                "response_id": responses[$scope.gridOptions.data.indexOf(row.entity)].id
            });
        };
        $scope.downloadForm = function (row) {
            var index = $scope.gridOptions.data.indexOf(row.entity);
            $scope.toPDF(responses[index].id);
        };
        $scope.id = $stateParams.id;
        $scope.responses = responses;
        $scope.form = form;

        dd.content = [];
        dd.content.push({});
        dd.content[0] = {text: "Form: " + form.name + "\n\n", alignment: 'center', bold: true};

        $scope.columns = [];
        $scope.filter_dict = {};
        $scope.questions = $scope.form.questions;

        var buttons = {};
        buttons.displayName = "Actions";
        buttons.enableColumnResizing = true;
        buttons.field = "0";
        buttons.width = 121;
        buttons.enableFiltering = false;
        buttons.enableSorting = false;
        buttons.cellTemplate =
            '<button type="button" class="btn btn-default" ng-click="grid.appScope.delete(row)"><span class="glyphicon glyphicon-trash"></span></button>' +
            '<button type="button" class="btn btn-default" ng-click="grid.appScope.showForm(row)"><span class="glyphicon glyphicon-folder-open"></span></button>' +
            '<button type="button" class="btn btn-default" ng-click="grid.appScope.downloadForm(row)"><span class="glyphicon glyphicon-download"></span></button>';
        $scope.columns.push(buttons);

        $scope.columns.push({"displayName": "Time", "field": "time-of-submission", "width": 120});
        $scope.columns.push({"displayName": "Study ID", "field": "study_id", "width": 120});

        $scope.questions.forEach(function (q) {
            var q_obj = {};
            q_obj["displayName"] = q.label;
            q_obj["field"] = q.question_id.toString();
            q_obj["width"] = 200;
            //if(q.components !== "description" && q.components !== "section")
            if (q.component !== "description" && q.component !== "descriptionHorizontal") {
                $scope.columns.push(q_obj);
            }
        });

        var data = [];
        $scope.responses.forEach(function (response) {
            var entries = response.entries;
            var proc_entries = {};
            proc_entries["time-of-submission"] = $filter('date')(response.insertion_date, "MM/dd/yy h:mma");
            proc_entries["study_id"] = response.study_id;
            entries.forEach(function (entry) {
                if (entry)
                    proc_entries[entry.question_id.toString()] = entry.value;
            });
            data.push(proc_entries);
        });
        $scope.data = data;

        $scope.gridOptions = {
            enableSorting: true,
            enableColumnResizing: true,
            enableFiltering: true,
            enableGridMenu: true,
            data: $scope.data,
            columnDefs: $scope.columns
        };

        $scope.getCSV = function () {
            $scope.CSVout = "";
            var questions = $scope.form.questions;
            var questionValueArray = [];
            questions.forEach(function (question) {
                questionValueArray.push(question.label);
            });
            $scope.CSVout += '"' + questionValueArray.join('","') + '"';
            $scope.responses.forEach(function (response) {
                var entries = [];
                questions.forEach(function (question) {
                    var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                    entries.push(entry.value.replace(/"/g, '""'));
                });
                $scope.CSVout += "\n" + '"' + entries.join('","') + '"';
            });

            var download_button = document.createElement('a');
            download_button.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.CSVout));
            download_button.setAttribute('download', $scope.form.name + "_" + (new Date()).format('mdY\\_His') + ".csv");
            download_button.click();
        };
        $scope.toPDF = function (responseId) {
            var table_loc = 0;
            var questions = $scope.form.questions;
            $scope.responses.forEach(function (response) {
                if (responseId && responseId == response.id) {
                    table_loc += 2;
                    dd.content.push("", {});
                    dd.content[table_loc - 1] = {text: "Response: #" + response.id, alignment: "center", bold: true};
                    if (table_loc != 2)
                        dd.content[table_loc - 1].pageBreak = 'before';
                    dd.content[table_loc].table = {};
                    dd.content[table_loc].table.widths = [150, '*'];
                    dd.content[table_loc].layout = 'noBorders';
                    dd.content[table_loc].table.body = [[{
                        text: "Questions",
                        alignment: "center",
                        bold: true
                    }, {text: "Responses", alignment: "center", bold: true}]];

                    questions.forEach(function (question) {
                        var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                        dd.content[table_loc].table.body.push([question.label, entry.value]);
                    });
                }
            });
            pdfMake.createPdf(dd).download($scope.form.name + "_" + (new Date()).format('mdY\\_His') + ".pdf");
        }
    });