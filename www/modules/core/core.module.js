/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderCore', [
    'FormBuilderHome',
    'FormBuilder',
    'FormResponder',
    'FormBuilderComponents',
    'Login',
    'UserResponseViewer',
    'FormResponseViewer',
    'Study',
    'restangular',
    'ui.router',
    'ui.bootstrap', //Needs to be moved to specific module(s) that needs this
    'ui.bootstrap.datetimepicker', //Needs to be moved to specific module(s) that needs this
    'ngSanitize', //Needs to be moved to specific module(s) that needs this
    'ngNotify' //Needs to be moved to specific module(s) that needs this
    //'FormBuilderUtil', //Has been moved to modules that directly need it, but may not be complete.
]);

angular.module('FormBuilderCore').run(
    function (Restangular) {
        //Restangular.setBaseUrl("http://f9c8d765.ngrok.io/RESTFUL-WS/");
        Restangular.setBaseUrl("https://hnetdev.hnet.uh.edu:8443/FormBuilder/");
        //Restangular.setBaseUrl("https://housuggest.org:8443/FormBuilder/");
        //Restangular.setBaseUrl("https://housuggest.org:8443/FormBuilderBackendTest/");
    });