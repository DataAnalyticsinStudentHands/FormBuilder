/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderCore').config(
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login/");
        $stateProvider
            .state('secure', {
            url: "/secure",
            views: {
                "menu_view@secure": {templateUrl: "/modules/core/menuBar.html", controller: "menuCtrl"},
                "app": {templateUrl: "/modules/core/home.html"}
            },
            data: {pageTitle: 'Home'},
            abstract: true
        })
            .state('secure.home', {
            url: "/home",
            templateUrl: "/modules/core/form_home.html",
            controller: 'homeCtrl',
            data: {pageTitle: 'Home'},
            resolve: {
                forms: function (formService) {
                    return formService.getMyForms();
                }
            },
            authenticate: true
        });
    });