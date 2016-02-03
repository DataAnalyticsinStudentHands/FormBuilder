/**
 * Created by Carl on 12/22/2015.
 */
angular.module('FormBuilder', [
    'FormData',
    'builder',
    'builder.components',
    'validator.rules',
    'ui.router'
]);

angular.module('FormBuilder').config(
    function ($stateProvider) {
        $stateProvider
            .state('secure.builder', {
                url: "/builder/:id",
                templateUrl: "modules/formBuilder/formbuilder.html",
                controller: 'builderCtrl',
                data: {pageTitle: 'Builder'},
                resolve: {
                    form: function (formService, $stateParams) {
                        if ($stateParams.id)
                            return formService.getForm($stateParams.id);
                    }
                },
                authenticate: true
            })
            .state('secure.form_settings', {
                url: "/form_settings/:id",
                templateUrl: "modules/formBuilder/formSettings.html",
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
            });
    });

angular.module('FormBuilder').controller('builderCtrl',
    function ($scope, $builder, $validator, formService, $stateParams, $filter, $state, ngNotify, form) {
        $scope.form_id = $stateParams.id;
        $scope.curState = $state.current.name;
        $builder.forms['default'] = null;

        //IF we are actually editing a previously saved form
        if ($scope.form_id) {
            $scope.form = form;
            var questions = form.questions;
            questions.forEach(function (question) {
                $builder.addFormObject('default', {
                    id: question.question_id,
                    component: question.component,
                    description: question.description,
                    label: question.label,
                    index: question.index,
                    placeholder: question.placeholder,
                    required: question.required,
                    options: question.options,
                    validation: question.validation,
                    settings: question.settings
                });
            });
        } else {
            $scope.form_id = 0;
            $builder.addFormObject('default', {
                component: "section",
                label: "First Section",
                index: 0,
                placeholder: "",
                required: true
            });
        }
        $scope.saveButton = function () {
            if ($scope.form_id !== 0 && form && form.enabled)
                bootbox.dialog({
                    title: "Save Form",
                    message: "Are you sure? Since this form is open, saving may cause problems with question integrity. <br/><br/> This form will be closed once saved.",
                    buttons: {
                        success: {
                            label: "Cancel",
                            className: "btn-default"
                        },
                        danger: {
                            label: "Save",
                            className: "btn-danger",
                            callback: function () {
                                form.enabled = false;
                                $scope.save();
                            }
                        }
                    }
                });
            else
                $scope.save();
        };
        $scope.save = function () {
            if (!$scope.form_id) {
                if (!$scope.form) {
                    ngNotify.set("Form Name is required!", { type: "error", duration: 10000});
                } else {
                    formService.newForm($scope.form.name, angular.copy($builder.forms['default'])).then(function (response) {
                        ngNotify.set("Form saved!", {type: "success", duration: 5000});
                        $scope.form_id = response.headers("ObjectId");
                        $state.go("secure.builder", {"id": $scope.form_id}, {"location": false});
                    });
                }
            } else {
                formService.updateForm($scope.form_id, $scope.form, angular.copy($builder.forms['default'])).then(function () {
                    ngNotify.set("Form saved!", {type: "success", duration: 5000});
                });
            }
        }
    });

angular.module('FormBuilder').controller('formSettingsCtrl',
    function ($rootScope, $scope, Auth, $state, formService, $stateParams, ngNotify, form, users, $q) {
        $scope.id = $stateParams.id;
        $scope.form = form;
        $scope.form_id = $stateParams.id;
        $scope.curState = $state.current.name;
        $scope.users = users;
        $scope.addingUser = false;
        $scope.removingUser = null;

        if (new Date($scope.form.expiration_date).getTime() !== new Date(0).getTime()) {
            $scope.expiration_date = $scope.form.expiration_date;
        }
        $scope.formURL = window.location.protocol + "//" + window.location.host + window.location.pathname + "#/form/" + $scope.id;

        $scope.deleteForm = function () {
            bootbox.dialog({
                title: "Delete Form",
                message: "Are you sure? Deleting will cause data loss!",
                buttons: {
                    success: {
                        label: "Cancel",
                        className: "btn-default"
                    },
                    danger: {
                        label: "Delete",
                        className: "btn-danger",
                        callback: function () {
                            formService.deleteForm($scope.id).then(function () {
                                    ngNotify.set("Successfully deleted form.", {type: "success", duration: 5000});
                                    $state.go("secure.home");
                                },
                                function () {
                                    ngNotify.set("Error deleting form!", {type: "error", duration: 10000});
                                });
                        }
                    }
                }
            });
        };
        $scope.duplicateForm = function () {
            bootbox.prompt({
                title: "Name of Duplicate Form",
                value: $scope.form.name,
                callback: function (result) {
                    if (result === null || result === "") {
                        ngNotify.set("New form must have a name!", {type: "error", duration: 10000})
                    } else {
                        formService.duplicateForm($scope.form, result);
                        ngNotify.set("Form successfully duplicated.", {type: "success", duration: 5000})
                    }
                }
            });
        };
        $scope.save = function () {
            $scope.form.expiration_date = $scope.expiration_date;
            formService.updateForm(String($scope.form.id), $scope.form, $scope.form.questions).then(function () {
                ngNotify.set("Form saved!", {type: "success", duration: 5000});
            }, function () {
                // Show error message if unsuccessful
                ngNotify.set("Error saving form!", {type: "error", duration: 10000});
            });
        };
        // This is currently unused because the server cannot handle multiple
        // permission updates at the same time
        $scope.updateAllPermissions = function (currentUser) {
            var promises = [];
            $scope.updatingPermissions = true;
            $scope.form.permissions.forEach(function (user) {
                // Skip current user
                if (user.username === currentUser) return;
                // Remember Restangular response promise
                promises.push(formService.updatePermission(String($scope.form.id), user));
            });
            // Execute callback when all requests have been returned
            $q.all(promises).then(function () {
                $scope.updatingPermissions = false;
                ngNotify.set("Form permissions successfully updated.", {type: "success", duration: 5000})
            }, function (response) {
                $scope.updatingPermissions = false;
                // console.error(response);
                ngNotify.set("An error occurred while updating form permissions.", {type: "error", duration: 10000})
            });
        };
        $scope.updatePermission = function (user, currentUser) {
            $scope.updatingPermissions = true;
            // Make request to server
            formService.updatePermission(String($scope.form.id), user)
                .then(function () {
                    $scope.updatingPermissions = false;
                    ngNotify.set("Form permissions successfully updated.", {type: "success", duration: 5000})
                }, function (response) {
                    $scope.updatingPermissions = false;
                    // console.error(response);
                    ngNotify.set("An error occurred while updating form permissions.", {type: "error", duration: 10000})
                });
        };
        $scope.addUser = function (username, role, currentUser) {
            if (typeof username !== 'undefined' &&
                (typeof role !== 'undefined' && role.length > 0)) {

                // Do not add current user
                if (username === currentUser) {
                    ngNotify.set("You cannot add yourself as a user.", {type: "warning", duration: 10000});
                    return;
                }
                var user = {username: username, role: role};
                $scope.updatePermission(user, currentUser);
                // Add user to local angular model
                $scope.form.permissions.push(user);
                // Clear out username and role form fields
                $scope.perm_username = null;
                $scope.perm_role = '';
            }
        };
        $scope.removeUser = function (user) {
            $scope.removingUser = user.username;
            // TODO: Check to make sure we aren't removing permissions for the current user
            // Make request to server to remove user's permissions
            formService.removeUser(String($scope.form.id), user).then(function () {
                // Remove user from this form's permissions within Angular
                // delete $scope.form.permissions[username];
                // $scope.form.permissions = $filter('filter')(
                //     $scope.form.permissions, { username: user.username });
                $scope.form.permissions = $scope.form.permissions.filter(function (perm) {
                    return perm.username !== user.username;
                });
                $scope.removingUser = null;
                ngNotify.set("Successfully removed " + user.username + ".", {type: "success", duration: 5000});
            }, function (response) {
                // Show error message if unsuccessful
                $scope.removingUser = null;
                ngNotify.set("Error removing user!", {type: "error", duration: 10000});
            });
        };
    });