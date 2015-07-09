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

databaseModule.module('siApp.services').directive('postRepeatDirective', 
  ['$timeout', '$log',  'TimeTracker', 
  function($timeout, $log, TimeTracker) {
    return function(scope, element, attrs) {
      if (scope.$last){
         $timeout(function(){
             var timeFinishedLoadingList = TimeTracker.reviewListLoaded();
             var ref = new Date(timeFinishedLoadingList);
             var end = new Date();
             $log.debug("## DOM rendering list took: " + (end - ref) + " ms");
         });
       }
    };
  }
]);