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
    'ui.bootstrap.datetimepicker', //Needs to moved to specific module(s) that needs this
    'ui.bootstrap', //Needs to moved to specific module(s) that needs this
    'ngSanitize', //Needs to moved to specific module(s) that needs this
    'ngNotify' //Needs to moved to specific module(s) that needs this
]);

angular.module('FormBuilderCore').run(
    function (Restangular) {
        Restangular.setBaseUrl("https://housuggest.org:8443/FormBuilderBackendTest/");
    });