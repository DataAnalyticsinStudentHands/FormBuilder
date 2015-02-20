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

fbService.factory('formService', ['Restangular', function(Restangular) {
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
                    form.questions.forEach(function(question){
                        service.processInQuestion(question);
                    });
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
                console.log(form_data);
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
        processOutQuestion:
            function(question) {
                if(!(typeof question.options == 'string' || question.options instanceof String))
                    question.options = JSON.stringify(angular.copy(question.options));
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
                    case "/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/":
                        question.validation = "PHONE";
                        break;
                    default:
                        question.validation = "NONE";
                }
                if(question.id) {
                    question.question_id = question.id;
                    delete question.id;
                }
                return question;
            },
        processInQuestion:
            function(question) {
                question.options = eval(question.options);
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
                        question.validation = "/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/";
                        break;
                    default:
                        question.validation = "/.*/";
                }
            }
    }
}]);

fbService.factory('responseService', ['Restangular', '$filter', function(Restangular, $filter) {
    return {
        getResponse:
            function(rid) {
                return Restangular.all("formResponses").get(rid).then(function(data){
                    return Restangular.stripRestangular(data);
                });
            },
        getResponsesByFormId:
            function(form_id){
                return Restangular.all("formResponses").all("byFormId").customGET(form_id, {numberOfFormResponses: 999999999}).then(function(data){
                    return Restangular.stripRestangular(data);
                });
            },
        getMyResponses:
            function(){
                return Restangular.all("formResponses").customGET("myFormResponses", {numberOfFormResponses: 999999999}).then(function(data){
                    return Restangular.stripRestangular(data);
                });
            },
        createResponse:
            function(fid) {
                return Restangular.all("formResponses").post({
                    "form_id": fid,
                    "owner_id": 1,
                    "entries": []
                }).then(function(data){
                    return eval(data);
                });
            },
        newResponse:
            function(input, fid) {
                var service = this;
                return this.createResponse(fid).then(function(id){
                    return service.getResponse(id).then(function(response){
                        response.entries.forEach(function(entryObj){
                            var inputObj = $filter('getById')(input, entryObj.question_id);
                            if(inputObj)
                                entryObj.value = inputObj.value;
                        });
                        return service.updateResponse(id, response).then(function(s){
                            console.log(s, "done");
                        });
                    })
                });
            },
        updateResponse:
            function(id, form) {
                return Restangular.all("formResponses").all(id).doPUT(form);
            },
        deleteResponse:
            function(rid) {
                return Restangular.all("formResponses").one(rid).remove(); //DO THIS NOW
            }
    }
}]);