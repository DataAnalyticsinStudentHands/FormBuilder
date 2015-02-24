'use strict';
/* Controllers */
var formBuilderController = angular.module('formBuilderControllerModule', ['ngTable']);

formBuilderController.controller('loginCtrl', ['$scope', 'Auth', '$state', 'ngNotify',
    function($scope, Auth, $state, ngNotify) {
        if($scope.isAuthenticated() === true) {
            //Point 'em to logged in page of app
            $state.go('secure.home');
        }

        //we need to put the salt on server + client side and it needs to be static
        $scope.salt = "nfp89gpe"; //PENDING
        $scope.submit = function() {
            if ($scope.userName && $scope.passWord) {
                $scope.passWordHashed = String(CryptoJS.SHA512($scope.passWord + $scope.userName + $scope.salt));
                Auth.setCredentials($scope.userName, $scope.passWordHashed);
                $scope.loginResultPromise = $scope.Restangular().all("users").one("myUser").get();
                $scope.loginResultPromise.then(function(result) {
                    $scope.loginResult = result;
                    ngNotify.set("Login success!", "success");
                    Auth.confirmCredentials();
                    $state.go('secure.home');
                }, function() {
                    ngNotify.set("Login failure, please try again!", "error");
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

formBuilderController.controller('registerCtrl', ['$scope', '$state', 'Auth', 'ngNotify',
    function($scope, $state, Auth, ngNotify) {
        $scope.registerUser = function() {
            var errorMSG;
            if($scope.password.pw == $scope.password.pwc) {
                Auth.setCredentials("Visitor", "test");
                $scope.salt = "nfp89gpe";
                $scope.register.password = String(CryptoJS.SHA512($scope.password.pw + $scope.register.username + $scope.salt));
                $scope.$parent.Restangular().all("users").post($scope.register).then(
                    function () {
                        Auth.clearCredentials();
                        ngNotify.set("Registration success!", "success");
                        $state.go("login", {}, {reload: true});
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
        }
    }]);

formBuilderController.controller('homeCtrl', ['$scope', 'Auth', '$state', 'formService', 'ngNotify',
    function($scope, Auth, $state, formService, ngNotify) {
        $scope.state = $state;
        formService.getMyForms().then(function(data){
            $scope.myForms = data;
        });
        $scope.logOut = function() {
            Auth.clearCredentials();
            ngNotify.set("Successfully logged out!", "success");
            $state.go('secure.home',{},{reload: true});
        }
    }]);

formBuilderController.controller('responseCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', '$filter', 'ngTableParams', 'responses', 'form',
    function($scope, Auth, $state, formService, responseService, $stateParams, $filter, ngTableParams, responses, form) {
        $scope.id = $stateParams.id;
        $scope.responses = responses;
        $scope.form = form;

        dd.content = [];
        dd.content.push({});
        dd.content[0] = {text: "Form: " + form.name + "\n\n", alignment: 'center', bold: true};

        $scope.columns = [];
        $scope.filter_dict = {};
        $scope.questions = $scope.form.questions;
        $scope.questions.forEach(function(q){
            var q_obj = {};
            q_obj["title"] = q.label;
            q_obj["field"] = q.question_id;
            q_obj["visible"] = true;
            $scope.columns.push(q_obj);
        });
        var data = [];

        $scope.responses.forEach(function(response){
            var entries = response.entries;
            var proc_entries = {};
            entries.forEach(function(entry){
                if(entry)
                    proc_entries[entry.question_id] = entry.value;
            });
            data.push(proc_entries);
        });
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page,
        }, {
            total: data.length, // length of data
            getData: function($defer, params) {
                // use build-in angular filter
                var filteredData = $scope.filter_dict ?
                    $filter('filter')(data, $scope.filter_dict) :
                    data;

                var orderedData = params.sorting() ?
                    $filter('orderBy')(filteredData, params.orderBy()) :
                    filteredData;

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.$watch("filter_dict", function () {
            if($scope.filter_dict && $scope.tableParams){
                $scope.tableParams.reload();
            }
        }, true);

        $scope.getCSV = function(){
            $scope.CSVout = "";
            var questions = $scope.form.questions;
            var questionValueArray = [];
            questions.forEach(function(question){
                questionValueArray.push(question.label);
            });
            $scope.CSVout += '"' + questionValueArray.join('","') + '"';
            $scope.responses.forEach(function(response){
                var entries = [];
                questions.forEach(function(question){
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
        $scope.toPDF = function(){
            var table_loc = 0;
            var questions = $scope.form.questions;
            $scope.responses.forEach(function(response){
                table_loc+=2;
                dd.content.push("",{});
                dd.content[table_loc - 1] = {text: "Response: #" + response.id, alignment: "center", bold: true};
                if(table_loc != 2)
                    dd.content[table_loc - 1].pageBreak = 'before';
                dd.content[table_loc].table = {};
                dd.content[table_loc].table.widths = [150, '*'];
                dd.content[table_loc].layout= 'noBorders';
                dd.content[table_loc].table.body = [[{text: "Questions", alignment: "center", bold: true}, {text: "Responses", alignment: "center", bold: true}]];

                questions.forEach(function(question){
                    var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                    dd.content[table_loc].table.body.push([question.label, entry.value]);
                });
            });
            pdfMake.createPdf(dd).download($scope.form.name + "_" + (new Date()).format('mdY\\_His') + ".pdf");
        }
    }]);

formBuilderController.controller('userResponseCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService',
    function($scope, Auth, $state, formService, responseService) {
        responseService.getMyResponses($scope.id).then(function(data){
            $scope.responses = data;
        });
    }]);

formBuilderController.controller('finishedCtrl', ['$scope', 'form', '$timeout',
    function($scope, form, $timeout) {
        $scope.form = form;
        if($scope.form.redirect_url){
            $timeout(function(){
                location.replace(form.redirect_url);
            }, 5000)
        }
    }]);

formBuilderController.controller('fileDownloadCtrl', ['$scope', '$stateParams', 'ngNotify', 'Restangular',
    function($scope, $stateParams, ngNotify, Restangular) {
        $scope.id = $stateParams.id;

        $scope.download = function(id) {
            Restangular.setFullResponse(true);
            Restangular.all("fileUploads")
                .withHttpConfig({responseType: 'arraybuffer'}).customGET(id)
                .then(
                function (success) {
                    var blob = new Blob([success.data], {
                        type: success.headers("content-type")
                    });
                    saveAs(blob, success.headers("file_name"));
                    Restangular.setFullResponse(false);
                },
                function () {
                    ngNotify.set("Something went wrong while getting the uploaded file!", {position: 'bottom', type: 'error'});
                    Restangular.setFullResponse(false);
                }
            );
        };

        $scope.download($scope.id);
    }]);

formBuilderController.controller('formSettingsCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', 'ngNotify',
    function($scope, Auth, $state, formService, responseService, $stateParams, ngNotify) {
        $scope.id = $stateParams.id;
        formService.getForm($scope.id).then(function(data) {
            $scope.form = data;
        });
        $scope.formURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "#/form/" + $scope.id;
        $scope.deleteForm = function() {
            bootbox.dialog({
                title: "Delete Form",
                message: "Are you sure? Deleting will cause data loss!",
                buttons: {
                    success: {
                        label: "Cancel",
                        className: "btn-default"
                    },
                    danger: {
                        label: "Delete",
                        className: "btn-danger",
                        callback: function() {
                            formService.deleteForm($scope.id).then(function(){
                                    ngNotify.set("Deleted!", "success");
                                    $state.go("secure.home");
                                },
                                function(){
                                    ngNotify.set("Error deleting!", "error");
                                });
                        }
                    }
                }
            });
        };
        $scope.duplicateForm = function() {
            bootbox.prompt({
                title: "Name of Duplicate Form",
                value: $scope.form.name,
                callback: function(result) {
                    if (result === null || result === "") {
                        ngNotify.set("New form must have name!", "error")
                    } else {
                        formService.duplicateForm($scope.form, result);
                        ngNotify.set("Form successfully duplicated!", "success")
                    }
                }
            });
        };

        $scope.save = function(){
            formService.updateForm(String($scope.form.id), $scope.form, $scope.form.questions).then(function () {
                ngNotify.set("Form saved!", "success");
            });
        }
    }]);

formBuilderController.controller('builderCtrl', ['$scope', '$builder', '$validator', 'formService', '$stateParams', '$filter', '$state', 'ngNotify',
    function($scope, $builder, $validator, formService, $stateParams, $filter, $state, ngNotify) {
        $scope.form_id = $stateParams.id;
        $builder.forms['default'] = null;

        //IF we are actually editing a previously saved form
        if($scope.form_id) {
            formService.getForm($scope.form_id).then(function(data){
                $scope.form_data = data;
                var questions = data.questions;
                questions.forEach(function(question){
                    $builder.addFormObject('default', {
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
            });
        } else {
            $scope.form_id = 0;
            $builder.addFormObject('default', {
                component: "section",
                label: "First Section",
                index: 0,
                placeholder: "",
                required: true
            });
        }
        $scope.save = function() {
            if(!$scope.form_id) {
                if(!$scope.form_data) {
                    ngNotify.set("Form Name is required!", "error");
                } else {
                    formService.newForm($scope.form_data.name, angular.copy($builder.forms['default'])).then(function (response) {
                        ngNotify.set("Form saved!", "success");
                        $scope.form_id = response.headers("ObjectId");
                        $state.go("secure.builder", {"id": $scope.form_id}, {"location": false});
                    });
                }
            } else {
                formService.updateForm($scope.form_id, $scope.form_data, angular.copy($builder.forms['default'])).then(function () {
                    ngNotify.set("Form saved!", "success");
                });
            }
        }
    }]);

formBuilderController.controller('formCtrl', ['$scope', '$builder', '$validator', '$stateParams', 'form', '$filter', 'responseService', '$state', 'ngNotify',
    function($scope, $builder, $validator, $stateParams, form, $filter, responseService, $state, ngNotify) {
        $scope.id = $stateParams.id;
        $scope.$parent.form_obj = form;
        $builder.forms[$scope.id] = null;

        form.questions.forEach(function(question){
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
        $scope.submit = function() {
            $validator.validate($scope, $scope.id).success(function() {
                responseService.newResponse($scope.input, $scope.id).then(function(){
                    ngNotify.set("Form submission success!", "success");
                    $state.go("finished", {"id": $scope.form_obj.id});
                    $scope.input = null;
                }, function(){
                    ngNotify.set("Submission failed!", "error");
                });
            }).error(function() {
                ngNotify.set("Form submission error, please verify form contents.", "error");
            });
        };
    }]);

formBuilderController.controller('uploadCtrl',
    function ($filter, $scope, $http, $timeout, $upload, $stateParams, Restangular, ngNotify, $rootScope) {
        $scope.uploadRightAway = true;

        $scope.hasUploader = function (index) {
            return $scope.upload[index] !== null;
        };
        $scope.abort = function (index) {
            $scope.upload[index].abort();
            $scope.upload[index] = null;
        };
        $scope.onFileSelect = function ($files, param) {
            $scope.selectedFiles = [];
            $scope.progress = [];
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i = 0; i < $scope.upload.length; i++) {
                    if ($scope.upload[i] !== null) {
                        $scope.upload[i].abort();
                    }
                }
            }
            $scope.upload = [];
            $scope.uploadResult = [];
            $scope.selectedFiles = $files;
            $scope.dataUrls = [];
            for (i = 0; i < $files.length; i++) {
                var $file = $files[i];
                $scope.fileName = param + $file.name;
                $scope.name = $file.name;
                $scope.progress[i] = -1;
                if ($scope.uploadRightAway) {
                    $scope.start(i);
                }
            }
        };

        $scope.start = function (index) {
            $scope.progress[index] = 0;
            $scope.errorMsg = null;
            var uploadUrl = Restangular.configuration.baseUrl + '/fileUploads?user_id=' + $rootScope.uid + '&form_id=' + $rootScope.form_obj.id + '&content_type=' + $scope.selectedFiles[index].type;
            $scope.upload[index] = $upload.upload({
                url: uploadUrl,
                file: $scope.selectedFiles[index],
                fileName: $scope.fileName
            });
            $scope.upload[index].then(function (response) {
                $scope.$parent.inputText = response.headers("ObjectId");
                $scope.inputId = response.headers("ObjectId");
                $timeout(function () {
                    $scope.uploadResult.push(response.data);
                });
            }, function (response) {
                if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
            $scope.upload[index].xhr(function (xhr) { });
        };

        $scope.deleteFile = function (id) {
            Restangular.all("fileUploads").one(id).remove({}).then(
                function () {
                    $scope.inputId = null;
                    $scope.inputText = null;
                    $scope.$parent.inputText = null;
                    ngNotify.set("Deleted!", {position: 'bottom', type: 'success'});
                },
                function () {
                    ngNotify.set("Could not delete your file on server.", {position: 'bottom', type: 'error'});
                }
            );
        };

        $scope.download = function(id) {
            if(id.toString() === "[object File]"){
                id = $scope.inputId;
            }
            Restangular.setFullResponse(true);
            Restangular.all("fileUploads")
                .withHttpConfig({responseType: 'arraybuffer'}).customGET(id)
                .then(
                function (success) {
                    var blob = new Blob([success.data], {
                        type: success.headers("content-type")
                    });
                    saveAs(blob, success.headers("file_name"));
                    Restangular.setFullResponse(false);
                },
                function () {
                    ngNotify.set("Something went wrong while getting the uploaded file!", {
                        position: 'bottom',
                        type: 'error'
                    });
                    Restangular.setFullResponse(false);
                }
            );
        }
    });