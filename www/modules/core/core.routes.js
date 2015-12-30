/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderCore').config(
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login/");
        $stateProvider.
        state('login', {
            url: "/login/:form_id",
            views: {
                "app": {templateUrl: "/modules/login/login.html", controller: "loginCtrl"}
            },
            data: {pageTitle: 'Login'},
            authenticate: false
        }).
        state('register', {
            url: "/register/:form_id",
            views: {
                "app": {templateUrl: "/modules/login/register.html", controller: "registerCtrl"}
            },
            data: {pageTitle: 'Register'},
            authenticate: false
        }).
        state('secure', {
            url: "/secure",
            views: {
                "menu_view@secure": {templateUrl: "/modules/core/menuBar.html", controller: "menuCtrl"},
                "app": {templateUrl: "/modules/core/home.html"}
            },
            data: {pageTitle: 'Home'},
            abstract: true
        }).
        state('secure.home', {
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
        }).
        state('secure.builder', {
            url: "/builder/:id",
            templateUrl: "/modules/formBuilder/formbuilder.html",
            controller: 'builderCtrl',
            data: {pageTitle: 'Builder'},
            resolve: {
                form: function (formService, $stateParams) {
                    if ($stateParams.id)
                        return formService.getForm($stateParams.id);
                }
            },
            authenticate: true
        }).
        state('secure.form_settings', {
            url: "/form_settings/:id",
            templateUrl: "/modules/formBuilder/formSettings.html",
            controller: 'formSettingsCtrl',
            data: {pageTitle: 'Settings'},
            resolve: {
                form: function (formService, $stateParams) {
                    return formService.getForm($stateParams.id, true);
                },
                users: function (userService) {
                    return userService.getAllUsers();
                }
            },
            authenticate: true
        }).
        state('secure.form_studies', {
            url: "/studies/:id",
            templateUrl: "/modules/study/studies.html",
            controller: 'studiesCtrl',
            resolve: {
                form: function (formService, $stateParams) {
                    return formService.getForm($stateParams.id);
                },
                users: function (userService) {
                    return userService.getAllUsers();
                },
                studies: function (studyService, $stateParams) {
                    return studyService.getStudiesByFormId($stateParams.id);
                }
            },
            data: {pageTitle: 'Studies'},
            authenticate: true
        }).
        state('secure.response', {
            url: "/response/:id",
            templateUrl: "/modules/formResponseViewer/response.html",
            controller: 'responseCtrl',
            resolve: {
                form: function (formService, $stateParams) {
                    return formService.getForm($stateParams.id);
                },
                responses: function (responseService, $stateParams) {
                    return responseService.getResponsesByFormId($stateParams.id);
                }
            },
            data: {pageTitle: 'Responses'},
            authenticate: true
        }).
        state('download', {
            url: "/file/:id",
            views: {
                "app": {
                    templateUrl: "/modules/components/fileUpload/file.html", controller: "fileDownloadCtrl"
                }
            },
            data: {pageTitle: 'Download'},
            authenticate: true
        }).
        state('form', {
            url: "/form/:id",
            views: {
                "app": {
                    templateUrl: "/modules/formResponder/form.html",
                    controller: 'formCtrl'
                }
            },
            resolve: {
                form: function (formService, $stateParams, $state) {
                    return formService.getForm($stateParams.id).then(function (data) {
                        return data;
                    }, function (data) {
                        if (new Date() > data.data.expiration_date) {
                            $state.go('closed', {id: $stateParams.id, form: JSON.stringify(data.data)});
                        } else if (data.status === 401 && data.data.enabled) {
                            $state.go('login', {form_id: $stateParams.id});
                        } else {
                            $state.go('closed', {id: $stateParams.id, form: JSON.stringify(data.data)});
                        }
                    });
                }
            },
            data: {pageTitle: 'Form'},
            authenticate: false
        }).
        state('responseView', {
            url: "/view/:id/:view/:response_id",
            views: {
                "app": {
                    templateUrl: "/modules/userResponseViewer/responseView.html",
                    controller: 'responseViewCtrl'
                }
            },
            resolve: {
                form: function (formService, $stateParams, $state) {
                    return formService.getForm($stateParams.id).then(function (data) {
                        return data;
                    }, function (data) {
                        if (new Date() > data.data.expiration_date) {
                            $state.go('closed', {id: $stateParams.id, form: JSON.stringify(data.data)});
                        } else if (data.status === 401 && data.data.enabled) {
                            $state.go('login', {form_id: $stateParams.id});
                        } else {
                            $state.go('closed', {id: $stateParams.id, form: JSON.stringify(data.data)});
                        }
                    });
                },
                response: function (responseService, $stateParams) {
                    return responseService.getResponse($stateParams.response_id, $stateParams.id);
                }
            },
            data: {pageTitle: 'Form'},
            authenticate: false
        }).
        state('finished', {
            url: "/finish/:id",
            views: {
                "app": {
                    templateUrl: "/modules/formResponder/finish.html", controller: "finishedCtrl"
                }
            },
            resolve: {
                form: function (formService, $stateParams) {
                    return formService.getForm($stateParams.id);
                }
            },
            data: {pageTitle: 'Finished'},
            authenticate: false
        }).
        state('closed', {
            url: "/close/:id/:form",
            views: {
                "app": {
                    templateUrl: "/modules/formResponder/closed.html", controller: "closedCtrl"
                }
            },
            authenticate: false
        });
    });