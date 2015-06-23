/**
 * Created by Carl on 3/2/2015.
 */
databaseModule.directive('title', ['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        return {
            link: function () {
                var listener = function (event, toState) {
                    $timeout(function () {
                        $rootScope.title = (toState.data && toState.data.pageTitle)
                            ? toState.data.pageTitle
                            : '';
                    });
                };
                $rootScope.$on('$stateChangeSuccess', listener);
            }
        };
    }
]);