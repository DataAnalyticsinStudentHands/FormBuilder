'use strict';
/* Controllers */
var formBuilderController = angular.module('formBuilderControllerModule', []);

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
            Auth.setCredentials("Visitor", "test");
            $scope.salt = "nfp89gpe";
            $scope.register.password = String(CryptoJS.SHA512($scope.password + $scope.register.username + $scope.salt));
            $scope.$parent.Restangular().all("users").post($scope.register).then(
                function() {
                    Auth.clearCredentials();
                    ngNotify.set("Registration success!", "success");
                    $state.go("login", {}, {reload: true});
                },function() {
                    ngNotify.set("Registration Failure!", "error");
                    Auth.clearCredentials();
                }, function() {
                    $scope.register = null;
                    $scope.password = null;
                }
            );
            Auth.clearCredentials();
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

formBuilderController.controller('responseDetailCtrl', ['$scope', 'Auth', '$state', '$stateParams', 'formService', '$builder', '$filter', '$timeout', 'form', 'response',
    function($scope, Auth, $state, $stateParams, formService, $builder, $filter, $timeout, form, response) {
        $scope.id = $stateParams.id;
        $scope.rid = $stateParams.rid;
        $scope.form = form;
        $builder.forms[$scope.id] = null;

        dd.content = [];
        dd.content.push({},{},{});
        dd.content[0].text = "Form: " + form.name;
        dd.content[1] = "Response: #" + $scope.rid;
        dd.content[2].style = 'tableExample';
        dd.content[2].table = {};
        dd.content[2].table.widths = [150, '*'];
        dd.content[2].table.body = [['Questions', 'Response']];
        dd.content[2].layout= 'noBorders';

        var questions = $filter('uniqueById')($filter('orderBy')(form.questions, "index", false), "question_id");
        response.entries = $filter('uniqueById')(response.entries, "question_id");
        questions.forEach(function(question){
            if($filter('getByQuestionId')(response.entries, question.question_id)) {
                dd.content[2].table.body.push([question.label, angular.copy($filter('getByQuestionId')(response.entries, question.question_id).value)]);
                if (question.component == "dateInput") {
                    $filter('getByQuestionId')(response.entries, question.question_id).value = new Date($filter('getByQuestionId')(response.entries, question.question_id).value);
                } else if (question.component == "name" || question.component == "address") {
                    $filter('getByQuestionId')(response.entries, question.question_id).value = $filter('getByQuestionId')(response.entries, question.question_id).value.split(", ");
                } else if (question.component == "checkbox") {
                    var checked = [];
                    $scope.checkBoxResponse = angular.copy($filter('getByQuestionId')(response.entries, question.question_id).value).split(", ");
                    eval(question.options).forEach(function (checkBoxItem) {
                        $scope.checkBoxResponse.forEach(function (checkedResponse) {
                            if (checkBoxItem.indexOf(checkedResponse) != -1) {
                                checked.push(true);
                            }
                        })
                    });
                    $filter('getByQuestionId')(response.entries, question.question_id).value = checked;
                }
                $builder.addFormObject($scope.id, {
                    id: question.question_id,
                    component: question.component,
                    description: question.description,
                    label: question.label,
                    index: question.index,
                    placeholder: question.placeholder,
                    required: question.required,
                    options: eval(question.options),
                    validation: question.validation
                });
            }
        });
        $scope.defaultValue = {};
        response.entries.forEach(function(entry){
            $scope.defaultValue[entry.question_id] = entry.value;
        });

        $scope.toPDF = function(){
            pdfMake.createPdf(dd).download();
        }
    }]);

formBuilderController.controller('responseCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', '$filter',
    function($scope, Auth, $state, formService, responseService, $stateParams, $filter) {
        $scope.id = $stateParams.id;

        responseService.getResponsesByFormId($scope.id).then(function(data){
            $scope.responses = data;
        });
        formService.getForm($scope.id).then(function(data) {
            $scope.form = data;
            dd.content = [];
            dd.content.push({});
            dd.content[0] = {text: "Form: " + data.name, alignment: 'center', bold: true};
        });

        $scope.getCSV = function(){
            $scope.CSVout = "";
            var questions = $filter('orderBy')($scope.form.questions, "index", false);
            var questionValueArray = [];
            questions.forEach(function(question){
                questionValueArray.push(question.label);
            });
            $scope.CSVout += '"' + questionValueArray.join('","') + '"';
            $scope.responses.forEach(function(response){
                var entries = [];
                questions.forEach(function(question){
                    var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                    if(entry)
                        entries.push(entry.value.replace(/"/g, '""'));
                    else
                        entries.push("");
                });
                $scope.CSVout += "\n" + '"' + entries.join('","') + '"';
            });

            var download_button = document.createElement('a');
            download_button.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent($scope.CSVout));
            download_button.setAttribute('download', $scope.form.name + "_responses.csv");
            download_button.click();
        };
        $scope.toPDF = function(){
            var table_loc = 0;
            var questions = $filter('orderBy')($scope.form.questions, "index", false);
            $scope.responses.forEach(function(response){
                table_loc+=2;
                dd.content.push("",{});
                if (table_loc == 2) {
                    dd.content[table_loc - 1] = {text: "\n Response: #" + response.id, alignment: "center", bold: true};
                } else {
                    dd.content[table_loc - 1] = {text: "Response: #" + response.id, alignment: "center", bold: true};
                    dd.content[table_loc - 1].pageBreak = 'before';
                }
                dd.content[table_loc].table = {};
                dd.content[table_loc].table.widths = [150, '*'];
                dd.content[table_loc].layout= 'noBorders';
                dd.content[table_loc].table.body = [[{text: "Questions", alignment: "center", bold: true}, {text: "Responses", alignment: "center", bold: true}]];

                questions.forEach(function(question){
                    var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                    if(entry)
                        dd.content[table_loc].table.body.push([question.label, entry.value]);
                    else
                        dd.content[table_loc].table.body.push([question.label, ""]);
                });
            });
            pdfMake.createPdf(dd).download();
        }
    }]);

formBuilderController.controller('formSettingsCtrl', ['$scope', 'Auth', '$state', 'formService', 'responseService', '$stateParams', 'ngNotify',
    function($scope, Auth, $state, formService, responseService, $stateParams, ngNotify) {
        $scope.id = $stateParams.id;
        formService.getForm($scope.id).then(function(data) {
            $scope.form = data;
        });
        $scope.formURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "/#/form/" + $scope.id;
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
                var questions = $filter('orderBy')(data.questions, "index", false);
                questions.forEach(function(question){
                    $builder.addFormObject('default', {
                        id: question.question_id,
                        component: question.component,
                        description: question.description,
                        label: question.label,
                        index: question.index,
                        placeholder: question.placeholder,
                        required: question.required,
                        options: eval(question.options),
                        validation: question.validation
                    });
                });
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
        $scope.form_obj = form;
        $builder.forms[$scope.id] = null;

        var questions = $filter('orderBy')(form.questions, "index", false);

        var questionPageArray = [];
        var page_number = 0;
        questions.forEach(function(question){
            var pageArray = questionPageArray[page_number];
            if(!pageArray)
                pageArray = [];
            if (question.component != "section") {
                pageArray.push(question);
                questionPageArray[page_number] = pageArray;
            } else {
                page_number++;
                pageArray = questionPageArray[page_number];
                if(!pageArray)
                    pageArray = [];
                pageArray.push(question);
                questionPageArray[page_number] = pageArray;
            }
        });
        //console.log(questionPageArray);

        questions.forEach(function(question){
            if(question.component == "section"){
                question.pageBreak = question.required;
                question.required = false;
            }
            $builder.addFormObject($scope.id, {
                id: question.question_id,
                component: question.component,
                description: question.description,
                label: question.label,
                index: question.index,
                placeholder: question.placeholder,
                required: question.required,
                options: eval(question.options),
                validation: question.validation
            });
        });

        $scope.form = $builder.forms[$scope.id];
        $scope.input = [];
        return $scope.submit = function() {
            return $validator.validate($scope, $scope.id).success(function() {
                responseService.newResponse($scope.input, $scope.id).then(function(){
                    ngNotify.set("Form submission success!", "success");
                    $state.go("finished");
                    $scope.input = null;
                });
            }).error(function() {
                ngNotify.set("Form submission error, please verify form contents.", "error");
            });
        };
    }]);