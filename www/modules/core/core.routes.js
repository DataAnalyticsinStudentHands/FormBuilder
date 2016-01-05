/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderCore').config(
    function ($urlRouterProvider) {
        $urlRouterProvider.otherwise("/login/");
    });