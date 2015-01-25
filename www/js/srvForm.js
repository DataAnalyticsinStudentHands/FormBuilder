/**
 * Created by Carl on 1/15/2015.
 */

var fbService = angular.module('formBuilderServiceModule', []);

fbService.factory('formService', ['Restangular', function(Restangular) {
    return {
        getForms:
            function() {
                return Restangular.all("forms").getList();
            },
        getMyForms:
            function() {
                return Restangular.all("forms").all("myForms").getList().then(function(data){
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
            function(questions) {
                var service = this;
                var newFormObj = {};
                newFormObj.name = "New Test Form";
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
                form.forEach(function(question){
                    service.processOutQuestion(question);
                });
                form_data.questions = form;
                return Restangular.all("forms").one(id).doPUT(form_data);
            },
        deleteForm:
            function(fid) {
                return Restangular.all("forms").one(fid).delete();
            },
        processOutQuestion:
            function(question) {
                question.options = JSON.stringify(question.options);
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
                console.log(rid);
                return Restangular.all("formResponses").get(rid).then(function(data){
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
                    service.getResponse(id).then(function(response){
                        console.log(response);
                        response.entries.forEach(function(entryObj){
                            var inputObj = $filter('getById')(input, entryObj.question_id);
                            entryObj.value = inputObj.value;
                        });
                        service.updateResponse(id, response).then(function(s){
                            console.log(s, "done");
                        });
                        return "";
                    })
                });
            },
        updateResponse:
            function(id, form) {
                return Restangular.all("formResponses").all(id).doPUT(form);
            },
        deleteResponse:
            function(rid) {
                return Restangular.all("formResponses").one(rid).delete();
            }
    }
}]);