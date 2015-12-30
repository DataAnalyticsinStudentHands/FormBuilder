/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderHome').config(
    function ($stateProvider) {
        $stateProvider
            .state('secure', {
                url: "/secure",
                views: {
                    "menu_view@secure": {templateUrl: "/modules/home/menuBar.html", controller: "menuCtrl"},
                    "app": {templateUrl: "/modules/home/home.html"}
                },
                data: {pageTitle: 'Home'},
                abstract: true
            })
            .state('secure.home', {
                url: "/home",
                templateUrl: "/modules/home/form_home.html",
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