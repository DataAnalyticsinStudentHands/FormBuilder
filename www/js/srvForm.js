/**
 * Created by Carl on 1/15/2015.
 */

var fbService = angular.module('formBuilderServiceModule', []);

fbService.factory('formService', ['Restangular', function(Restangular) {
    return {
        getForms:
            function(fid) {
                Restangular.all("forms").getList();
            },
        getForm:
            function(fid) {
                return Restangular.all("forms").one(fid).get().then(function(success){
                    var form = Restangular.stripRestangular(success);
                    /** PROCESS HERE ***/
                    return form;
                });
            },
        newForm:
            function(form) {
                Restangular.all("forms").post(form);
            },
        updateForm:
            function(id, form) {
                Restangular.all("forms").one(id).put(form);
            },
        deleteForm:
            function(fid) {
                Restangular.all("forms").one(fid).delete();
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
            function(fid, uid) {
                return Restangular.all("formResponses").post({
                    "form_id": fid,
                    "owner_id": 14,
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
            function(fid) {

            }
    }
}]);