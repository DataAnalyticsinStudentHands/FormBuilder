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
    'ui.bootstrap.datetimepicker',
    'ui.bootstrap',
    'ngSanitize',
    'ngNotify'
]);

angular.module('FormBuilderCore').run(
    function (Restangular) {
        Restangular.setBaseUrl("https://housuggest.org:8443/FormBuilderBackendTest/");
    });