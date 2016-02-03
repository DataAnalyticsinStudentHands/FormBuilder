/**
 * Created by Carl on 12/29/2015.
 */
angular.module('Study', [
    'FormData',
    'ResponseData',
    'ui.router',
    'ui.bootstrap.datetimepicker', //Needs to be moved to specific module(s) that needs this
    'restangular'
]);

angular.module('Study').config(
    function ($stateProvider) {
        $stateProvider
            .state('secure.form_studies', {
                url: "/studies/:id",
                templateUrl: "modules/study/studies.html",
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
            });
    });

angular.module('Study').controller('studiesCtrl',
    function ($scope, Auth, $state, formService, responseService, $stateParams, ngNotify, form, users, studyService, studies) {
        $scope.form_id = $stateParams.id;
        $scope.state = $state;
        $scope.curState = $state.current.name;
        $scope.form = form;
        $scope.users = users;
        $scope.usersMapKeyedByUsername = _.indexBy(users, 'username');
        $scope.studyService = studyService;
        $scope.studies = (studies) ? studies : [];
        $scope.editStudy = null;
        $scope.editing = false;
        $scope.time_fixed = (new Date(0)).toISOString();

        $scope.addStudy = function () {
            var study = {
                studyName: '',
                formId: $scope.form.id,
                participants: [],
                fixedTimes: [],
                startDate: new Date(),
                endDate: new Date(),
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
                duration: 3
            };
            $scope.currentStudy = study;
            $scope.editing = true;
            $scope.studies.push(study);
        };
        $scope.editStudy = function (study) {
            $scope.time_fixed = (new Date(0)).toISOString();
            $scope.currentStudy = study;
            $scope.editing = true;
        };
        $scope.cancelEdit = function () {
            $scope.currentStudy = null;
            $scope.editing = false;
            $state.reload();
        };
        $scope.saveStudies = function () {
            studyService.newStudies(studies).then(function (s) {
                $state.reload();
            });
        };
        $scope.replaceParticipants = function (study) {
            var newParticipants = study.participants_txt.split('\n');
            study.participants = newParticipants;
            study.participants_txt = '';
        };
        $scope.appendParticipants = function (study) {
            var newParticipants = study.participants_txt.split('\n');
            var notAddedParticipants = [];
            newParticipants.forEach(function (participant) {
                var usersMapKeyedByUsername = _.indexBy(users, 'username');
                if (!usersMapKeyedByUsername.hasOwnProperty(participant)) {
                    newParticipants = _.without(newParticipants, _.findWhere(newParticipants, participant));
                    notAddedParticipants.push(participant);
                }
            });
            newParticipants = _.uniq(newParticipants);
            notAddedParticipants = _.uniq(notAddedParticipants);
            if (notAddedParticipants.length > 0) {
                bootbox.alert("The following participants were not added because they don't have valid user accounts. <br/><br/><div style='text-align: center;'>" + notAddedParticipants.join("<br/>") + "</div>");
            }
            study.participants = study.participants.concat(newParticipants);
            study.participants_txt = '';
        };
        $scope.exportParticipants = function () {
            var CSVout = "";
            var formName = $scope.form.name;
            var study = $scope.currentStudy;
            var participants = study.participants;
            var currentDate = (new Date()).format('Ymd-His');
            var fileName = formName + ' - ' + study.studyName + ' - ' + currentDate + '.csv';

            // Index the users array by username for quick lookup
            var usersMapKeyedByUsername = _.indexBy(users, 'username');

            // Header row
            CSVout += 'Email,User ID';

            // Add row for each participant
            var user_id;
            participants.forEach(function (participant) {
                // Check if this participant is a registered user
                if (usersMapKeyedByUsername.hasOwnProperty(participant)) {
                    user_id = String(usersMapKeyedByUsername[participant].id);
                } else {
                    user_id = 'N/A';
                }
                CSVout += '\n' + participant + ',' + user_id;
            });

            // Force download by creating a fake link
            var download_button = document.createElement('a');
            download_button.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(CSVout));
            download_button.setAttribute('download', fileName);
            download_button.click();
        };
    });

angular.module('Study').factory('studyService',
    function (Restangular, $filter) {
        return {
            getStudiesByFormId: function (fid) {
                return Restangular.all("studies").all("getstudiesform").one(fid).getList().then(function (s) {
                    return s.plain();
                });
            },
            getStudyById: function (sid) {
                return Restangular.all("studies").get(sid);
            },
            newStudies: function (studies) {
                var srv = this;
                studies.forEach(function (study) {
                    srv.processOutStudy(study);
                });
                return Restangular.all("studies").all('updatestudies').customPUT(studies);
            },
            updateStudies: function (studies) {
                return Restangular.all("studies").all('updatestudies').put(studies);
            },
            deleteStudy: function (sid) {
                return Restangular.all("studies").all(sid).remove();
            },
            processOutStudy: function (study) {
                if (study.startDate && isDate(study.startDate)) study.startDate = $filter('date')(Date.parse(study.startDate), 'yyyy-MM-ddTHH:mmZ');
                if (study.endDate && isDate(study.endDate)) study.endDate = $filter('date')(Date.parse(study.endDate), 'yyyy-MM-ddTHH:mmZ');
                var times = [];
                if (study.fixedTimes) {
                    study.fixedTimes.forEach(function (time) {
                        if (time && isDate(time)) times.push($filter('date')(Date.parse(time), 'yyyy-MM-ddTHH:mmZ'));
                    });
                    study.fixedTimes = times;
                }
                delete study['participants_txt'];
            }
        }
    });
