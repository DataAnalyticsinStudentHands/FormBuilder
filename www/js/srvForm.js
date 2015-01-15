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
                console.log("test");
                return Restangular.all("forms").one(fid).get();
            },
        newForm:
            function(form) {
                Restangular.all("forms").post(form);
            },
        updateForm:
            function(id, form) {
                Restangular.all("forms").one(id).post(form);
            },
        processIncomingForm:
            function(form) {
                return form;
            },
        deleteForm:
            function(fid) {
                Restangular.all("forms").one(fid).delete();
            }
    }
}]);

fbService.factory('entryService', ['Restangular', function(Restangular) {
    return {
        getEntry:
            function(fid) {

            },
        newEntry:
            function(form) {

            },
        updateEntry:
            function(id, form) {

            },
        deleteEntry:
            function(fid) {

            }
    }
}]);