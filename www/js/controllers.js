'use strict';
/* Controllers */
var formBuilderController = angular.module('formBuilderControllerModule', []);

formBuilderController.controller('loginCtrl', ['$scope', 'Auth', '$state', 'ngNotify', '$stateParams',
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
    }]);

formBuilderController.controller('registerCtrl', ['$scope', '$state', 'Auth', 'ngNotify', '$stateParams',
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
        }
    }]);

formBuilderController.controller('homeCtrl', ['$scope', 'Auth', '$state', 'formService', 'ngNotify', 'forms',
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
    }]);

formBuilderController.controller('menuCtrl', ['$scope', 'Auth', 'ngNotify', '$state',
    function ($scope, Auth, ngNotify, $state) {
        $scope.logOut = function () {
            Auth.clearCredentials();
            ngNotify.set("Successfully logged out!", "success");
            $state.go('secure.home', {}, {reload: true});
        }
    }]);

formBuilderController.controller('responseCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', '$filter', 'responses', 'form',
    function ($scope, Auth, $state, formService, responseService, $stateParams, $filter, responses, form) {
        $scope.curState = $state.current.name;
        $scope.form_id = $stateParams.id;
        $scope.Delete = function (row) {
            var index = $scope.gridOptions.data.indexOf(row.entity);
            responseService.deleteResponse(responses[index].id);
            $scope.gridOptions.data.splice(index, 1);
            responses.splice(index, 1);
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
        buttons.width = 100;
        buttons.enableFiltering = false;
        buttons.enableSorting = false;
        buttons.cellTemplate = '<button type="button" class="btn btn-default" ng-click="grid.appScope.Delete(row)"><span class="glyphicon glyphicon-trash"></span></button>';
        $scope.columns.push(buttons);

        $scope.questions.forEach(function (q) {
            var q_obj = {};
            q_obj["displayName"] = q.label;
            q_obj["field"] = q.question_id.toString();
            q_obj["width"] = 200;
            //if(q.component !== "description" && q.component !== "section")
            if (q.component !== "description" && q.component !== "descriptionHorizontal") {
                $scope.columns.push(q_obj);
            }
        });

        var data = [];
        $scope.responses.forEach(function (response) {
            var entries = response.entries;
            var proc_entries = {};
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
        $scope.toPDF = function () {
            var table_loc = 0;
            var questions = $scope.form.questions;
            $scope.responses.forEach(function (response) {
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
            });
            pdfMake.createPdf(dd).download($scope.form.name + "_" + (new Date()).format('mdY\\_His') + ".pdf");
        }
    }]);

formBuilderController.controller('userResponseCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService',
    function ($scope, Auth, $state, formService, responseService) {
        responseService.getMyResponses($scope.id).then(function (data) {
            $scope.responses = data;
        });
    }]);

formBuilderController.controller('finishedCtrl', ['$scope', 'form', '$timeout',
    function ($scope, form, $timeout) {
        $scope.form = form;
        if ($scope.form.redirect_url) {
            $timeout(function () {
                location.replace(form.redirect_url);
            }, 5000)
        }
    }]);

formBuilderController.controller('closedCtrl', ['$scope', '$stateParams',
    function ($scope, $stateParams) {
        $scope.form = JSON.parse($stateParams.form);
    }]);

formBuilderController.controller('fileDownloadCtrl', ['$scope', '$stateParams', 'ngNotify', 'Restangular',
    function ($scope, $stateParams, ngNotify, Restangular) {
        $scope.id = $stateParams.id;

        $scope.download = function (id) {
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
        };

        $scope.download($scope.id);
    }]);

formBuilderController.controller('formSettingsCtrl', ['$rootScope', '$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', 'ngNotify', 'form', 'users',
    function ($rootScope, $scope, Auth, $state, formService, responseService, $stateParams, ngNotify, form, users) {
        $scope.id = $stateParams.id;
        $scope.form = form;
        $scope.form_id = $stateParams.id;
        $scope.curState = $state.current.name;
        $scope.users = users;

        if (new Date($scope.form.expiration_date).getTime() !== new Date(0).getTime()) {
            $scope.expiration_date = $scope.form.expiration_date;
        }
        $scope.formURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "#/form/" + $scope.id;

        $scope.deleteForm = function () {
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
                        callback: function () {
                            formService.deleteForm($scope.id).then(function () {
                                    ngNotify.set("Deleted!", "success");
                                    $state.go("secure.home");
                                },
                                function () {
                                    ngNotify.set("Error deleting!", "error");
                                });
                        }
                    }
                }
            });
        };
        $scope.duplicateForm = function () {
            bootbox.prompt({
                title: "Name of Duplicate Form",
                value: $scope.form.name,
                callback: function (result) {
                    if (result === null || result === "") {
                        ngNotify.set("New form must have name!", "error")
                    } else {
                        formService.duplicateForm($scope.form, result);
                        ngNotify.set("Form successfully duplicated!", "success")
                    }
                }
            });
        };
        $scope.save = function () {
            $scope.form.expiration_date = $scope.expiration_date;
            formService.updateForm(String($scope.form.id), $scope.form, $scope.form.questions).then(function () {
                ngNotify.set("Form saved!", "success");
            });
        };

        $scope.updatePermission = function (user, role) {
            formService.updateRoles(form.id, user, role);
        };
    }]);

formBuilderController.controller('studiesCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', 'ngNotify', 'form', 'users', 'studyService', 'studies',
    function ($scope, Auth, $state, formService, responseService, $stateParams, ngNotify, form, users, studyService, studies) {
        $scope.form_id = $stateParams.id;
        $scope.curState = $state.current.name;
        $scope.form = form;
        $scope.users = users;
        $scope.studyService = studyService;
        $scope.studies = (studies) ? studies : [];
        $scope.saveStudies = function () {
            studyService.newStudies(studies).then(function(s){
                $state.reload();
            });
        }
    }]);

formBuilderController.controller('builderCtrl', ['$scope', '$builder', '$validator', 'formService', '$stateParams', '$filter', '$state', 'ngNotify', 'form',
    function ($scope, $builder, $validator, formService, $stateParams, $filter, $state, ngNotify, form) {
        $scope.form_id = $stateParams.id;
        $scope.curState = $state.current.name;
        $builder.forms['default'] = null;

        //IF we are actually editing a previously saved form
        if ($scope.form_id) {
            $scope.form_data = form;
            var questions = form.questions;
            questions.forEach(function (question) {
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
        $scope.saveButton = function () {
            if ($scope.form_id !== 0 && form && form.enabled)
                bootbox.dialog({
                    title: "Save Form",
                    message: "Are you sure? Since this form is open, saving may cause problems with question integrity. <br/><br/> This form will be closed once saved.",
                    buttons: {
                        success: {
                            label: "Cancel",
                            className: "btn-default"
                        },
                        danger: {
                            label: "Save",
                            className: "btn-danger",
                            callback: function () {
                                form.enabled = false;
                                $scope.save();
                            }
                        }
                    }
                });
            else
                $scope.save();
        };
        $scope.save = function () {
            if (!$scope.form_id) {
                if (!$scope.form_data) {
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
        }
    }]);

formBuilderController.controller('uploadCtrl',
    function ($filter, $scope, $http, $timeout, $upload, $stateParams, Restangular, ngNotify, $rootScope) {
        $scope.uploadRightAway = true;
        $scope.objJoin = function (obj) {

            var retArr = [];
            for (var item in obj) {

                if (obj[item] != '')
                    retArr.push(obj[item]);
            }

            return retArr;
        };

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
            $scope.upload[index].xhr(function (xhr) {
            });
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

        $scope.download = function (id) {
            if (id.toString() === "[object File]") {
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

formBuilderController.controller('scannerCtrl',
    function($scope, $rootScope, $cordovaBarcodeScanner) {
        $scope.scan = function(){
            $cordovaBarcodeScanner
                .scan()
                .then(function(result) {
                    $scope.$parent.inputText = result.text;
                }, function(error) {

                });
        };
});