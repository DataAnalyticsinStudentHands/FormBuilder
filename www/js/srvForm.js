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
                Restangular.all("forms").one(id).post(form);
            },
        deleteForm:
            function(fid) {
                Restangular.all("forms").one(fid).delete();
            }
    }
}]);

fbService.factory('responseService', ['Restangular', function(Restangular) {
    return {
        getResponse:
            function(fid) {

            },
        newResponse:
            function(form) {

            },
        updateResponse:
            function(id, form) {

            },
        deleteResponse:
            function(fid) {

            }
    }
}]);