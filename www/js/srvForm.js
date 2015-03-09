/**
 * Created by Carl on 1/15/2015.
 */

var fbService = angular.module('formBuilderServiceModule', []);

fbService.factory('userService', ['Restangular', '$q', '$filter', function(Restangular, $q, $filter) {
    return {
        getMyUser:
            function() {
                return Restangular.all("users").get("myUser");
            },
        getMyRole:
            function() {
                return Restangular.all("users").all("myRole").getList().then(function(success) { return success[0]; });
            }
    }
}]);

fbService.factory('formService', ['Restangular', '$filter', function(Restangular, $filter) {
    return {
        getMyForms:
            function() {
                return Restangular.all("forms").customGETLIST("myForms", {numberOfForms: 999999999}).then(function(data){
                    return data.plain();
                });
            },
        getForm:
            function(fid) {
                var service = this;
                return Restangular.all("forms").one(fid).get().then(function(success){
                    var form = Restangular.stripRestangular(success);
                    service.processInForm(form);
                    form.questions.forEach(function(question){
                        service.processInQuestion(question);
                    });
                    form.expiration_date = new Date(form.expiration_date);
                    return form;
                });
            },
        newForm:
            function(form_name, questions) {
                var service = this;
                var newFormObj = {};
                newFormObj.name = form_name;
                newFormObj.questions = [];
                questions.forEach(function(question){
                    delete question.id;
                    newFormObj.questions.push(service.processOutQuestion(question));
                });
                return Restangular.setFullResponse(true).all("forms").post(newFormObj).then(function(data){
                    Restangular.setFullResponse(false);
                    return data;
                });
            },
        updateForm:
            function(id, form_data, form) {
                var service = this;
                form.forEach(function(question){
                    service.processOutQuestion(question);
                });
                form_data.questions = form;
                return Restangular.all("forms").one(id).doPUT(form_data);
            },
        deleteForm:
            function(fid) {
                return Restangular.all("forms").one(fid).remove();
            },
        processInForm:
            function (form) {
            form.questions = $filter('orderBy')(form.questions, 'index');
        },
        processOutQuestion:
            function(question) {
                if(!(typeof question.options == 'string' || question.options instanceof String))
                    question.options = JSON.stringify(angular.copy(question.options));
                if(!(typeof question.settings == 'string' || question.settings instanceof String))
                    question.settings = JSON.stringify(angular.copy(question.settings));
                switch(question.validation){
                    case "/.*/":
                        question.validation = "NONE";
                        break;
                    case "[number]":
                        question.validation = "NUMBER";
                        break;
                    case "[email]":
                        question.validation = "EMAIL";
                        break;
                    case "[url]":
                        question.validation = "URL";
                        break;
                    case "/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$|^$/":
                        question.validation = "PHONE";
                        break;
                    default:
                        question.validation = "NONE";
                }
                if(question.id || question.id === 0) {
                    question.question_id = question.id;
                }
                delete question.id;
                return question;
            },
        processInQuestion:
            function(question) {
                question.options = eval(question.options);
                if(question.settings)
                    question.settings = JSON.parse(question.settings);
                switch(question.validation){
                    case "NONE":
                        question.validation = "/.*/";
                        break;
                    case "NUMBER":
                        question.validation = "[number]";
                        break;
                    case "EMAIL":
                        question.validation = "[email]";
                        break;
                    case "URL":
                        question.validation = "[url]";
                        break;
                    case "PHONE":
                        question.validation = "/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$|^$/";
                        break;
                    default:
                        question.validation = "/.*/";
                }
            },
        duplicateForm:
            function(form, new_name) {
                var form_duplicate = angular.copy(form);
                form_duplicate.questions.forEach(function(q){
                    delete q.question_id;
                });
                this.newForm(new_name, form_duplicate.questions);
            }
    }
}]);

fbService.factory('responseService', ['Restangular', '$filter', 'formService', function(Restangular, $filter, formService) {
    return {
        getResponse:
            function(rid) {
                return Restangular.all("formResponses").get(rid).then(function(data){
                    return Restangular.stripRestangular(data);
                });
            },
        getResponsesByFormId:
            function(form_id){
                var service = this;
                return Restangular.all("formResponses").all("byFormId").customGET(form_id, {numberOfFormResponses: 999999999}).then(function(data){
                    var responses = Restangular.stripRestangular(data);
                    return formService.getForm(form_id).then(function(data_form){
                        var form = Restangular.stripRestangular(data_form);
                        responses.forEach(function(response) {
                            service.processInResponse(response, form);
                            response.entries.forEach(function(entry, key){
                                if(entry)
                                    service.processInEntry(entry, $filter('getByQuestionId')(form.questions, entry.question_id));
                                else
                                    response.entries[key] = {value: ""};
                            });
                        });
                        return responses;
                    })
                });
            },
        getMyResponses:
            function(){
                return Restangular.all("formResponses").customGET("myFormResponses", {numberOfFormResponses: 999999999}).then(function(data){
                    return Restangular.stripRestangular(data);
                });
            },
        createResponse:
            function(fid, uid) {
                return Restangular.all("formResponses").post({
                    "form_id": fid,
                    "owner_id": uid,
                    "entries": []
                }).then(function(data){
                    return eval(data);
                });
            },
        newResponse:
            function(input, fid, uid) {
                var service = this;
                return this.createResponse(fid, uid).then(function(id){
                    return service.getResponse(id).then(function(response){
                        response.entries.forEach(function(entryObj){
                            var inputObj = $filter('getById')(input, entryObj.question_id);
                            if(inputObj)
                                entryObj.value = inputObj.value;
                        });
                        return service.updateResponse(id, response);
                    })
                });
            },
        updateResponse:
            function(id, form) {
                return Restangular.all("formResponses").all(id).doPUT(form);
            },
        deleteResponse:
            function(rid) {
                return Restangular.all("formResponses").one(rid).remove();
            },
        processInResponse:
            function(response, form){
                form.questions.forEach(function(question){
                    var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                    if(!entry){
                        response.entries.push({value: "", question_id: question.question_id})
                    }
                });
                response.entries = $filter('orderByIndexInQuestion')($filter('uniqueById')(response.entries, 'question_id'), form.questions);
                return response;
            },
        processInEntry:
            function(entry, question){
                switch(question.component){
                    case "fileUpload":
                        if(entry.value != "")
                            entry.value = window.location.protocol + "//" + window.location.host + window.location.pathname + "#/file/" + entry.value;
                        else
                            entry.value = "No File";
                        break;
                    case "dateTimeInput":
                        entry.value = $filter('date')(entry.value, 'MM-dd-yyyy HH:mm a');
                        break;
                    case "dateInput":
                        entry.value = $filter('date')(entry.value, 'MM-dd-yyyy');
                        break;
                }
                return entry;
            }
    }
}]);