/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderHome').config(
    function ($urlRouterProvider) {
        $urlRouterProvider.otherwise("/login/");
    });