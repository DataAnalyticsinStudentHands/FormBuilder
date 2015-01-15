/**
 * Created by Carl on 1/15/2015.
 */

var fbService = angular.module('formBuilderServiceModule', []);

fbService.factory('formService', ['Restangular', function(Restangular) {
    return {
        getForms:
            function(fid) {

            },
        newForm:
            function(form) {

            },
        updateForm:
            function(id, form) {

            },
        deleteForm:
            function(fid) {

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