/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormData', []);

angular.module('FormData').factory('formService',
    function (Restangular, $filter) {
        return {
            getMyForms: function () {
                return Restangular.all("forms").customGET("myForms", {numberOfForms: 999999999}).then(function (data) {
                    data = data.plain();
                    var data_keys = Object.keys(data);
                    var output = [];
                    for (var i = 0; i < data_keys.length; i++) {
                        var form = JSON.parse(data_keys[i]);
                        form.perms = data_keys[i];
                        output.push(form);
                    }
                    return output;
                });
            },
            getForm: function (fid, perm) {
                var service = this;
                return Restangular.all("forms").one(fid).get({permissions: perm}).then(function (success) {
                    var form = Restangular.stripRestangular(success);
                    service.processInForm(form);
                    form.questions.forEach(function (question) {
                        service.processInQuestion(question);
                    });
                    form.expiration_date = new Date(form.expiration_date);
                    if (perm) {
                        var perm_keys = Object.keys(form.permissions);
                        for (var i = 0; i < perm_keys.length; i++) {
                            var p = form.permissions[perm_keys[i]];
                            var perm_role = "";
                            switch (p.toString()) {
                                case '1':
                                    perm_role = "Response Viewer";
                                    break;
                                case '4,2,1':
                                    perm_role = "Collaborator";
                                    break;
                                case '128,8,4,2,1':
                                    perm_role = "Owner";
                                    break;
                                case '4':
                                    perm_role = "Responder";
                                    break;
                                default:
                                    perm_role = "";
                                    break;
                            }
                            form.permissions[perm_keys[i]].perm_role = perm_role;
                        }
                    }
                    return form;
                });
            },
            newForm: function (form_name, questions) {
                var service = this;
                var newFormObj = {};
                newFormObj.name = form_name;
                newFormObj.questions = [];
                questions.forEach(function (question) {
                    delete question.id;
                    newFormObj.questions.push(service.processOutQuestion(question));
                });
                return Restangular.setFullResponse(true).all("forms").post(newFormObj).then(function (data) {
                    Restangular.setFullResponse(false);
                    return data;
                });
            },
            updateForm: function (id, form_data, form) {
                var service = this;
                form.forEach(function (question) {
                    service.processOutQuestion(question);
                });
                form_data.questions = form;
                delete form_data['permissions'];
                return Restangular.all("forms").one(id).doPUT(form_data);
            },
            deleteForm: function (fid) {
                return Restangular.all("forms").one(fid).remove();
            },
            processInForm: function (form) {
                form.questions = $filter('orderBy')(form.questions, 'index');
                if (!form.expiration_date)
                    form.expiration_date = null;
                form.permissions = this.processInPermissions(form.permissions);
            },
            processOutQuestion: function (question) {
                if (!(typeof question.options == 'string' || question.options instanceof String))
                    question.options = JSON.stringify(angular.copy(question.options));
                if (!(typeof question.settings == 'string' || question.settings instanceof String))
                    question.settings = JSON.stringify(angular.copy(question.settings));
                switch (question.validation) {
                    case "/.*/":
                        question.validation = "NONE";
                        break;
                    case "[number]":
                        question.validation = "NUMBER";
                        break;
                    case "[email]":
                        question.validation = "EMAIL";
                        break;
                    case "[url]":
                        question.validation = "URL";
                        break;
                    case "/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$|^$/":
                        question.validation = "PHONE";
                        break;
                    default:
                        question.validation = "NONE";
                }
                if (question.id || question.id === 0) {
                    question.question_id = question.id;
                }
                delete question.id;
                return question;
            },
            processInQuestion: function (question) {
                question.options = eval(question.options);
                if (question.settings)
                    question.settings = JSON.parse(question.settings);
                switch (question.validation) {
                    case "NONE":
                        question.validation = "/.*/";
                        break;
                    case "NUMBER":
                        question.validation = "[number]";
                        break;
                    case "EMAIL":
                        question.validation = "[email]";
                        break;
                    case "URL":
                        question.validation = "[url]";
                        break;
                    case "PHONE":
                        question.validation = "/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$|^$/";
                        break;
                    default:
                        question.validation = "/.*/";
                }
            },
            duplicateForm: function (form, new_name) {
                var form_duplicate = angular.copy(form);
                form_duplicate.questions.forEach(function (q) {
                    delete q.question_id;
                });
                this.newForm(new_name, form_duplicate.questions);
            },
            // Transforms permissions from the received JSON hash map into an array of user objects
            processInPermissions: function (permissions) {
                var newPermissions = [];
                for (var user in permissions) {
                    if (permissions.hasOwnProperty(user)) {
                        var newUser = {username: user, role: permissions[user]};
                        newPermissions.push(newUser);
                    }
                }
                return newPermissions;
            },
            // Send a POST request to update permissions for each user/collaborator
            updatePermission: function (fid, user) {
                // POST /forms/{fid}/PERMISSION?username={username}?permissionRole={role}
                // return Restangular.one("forms", fid).customPOST(null, "PERMISSION", {
                return Restangular.one("forms", fid).all("PERMISSION").post(null, {
                    username: user.username, permissionRole: user.role
                });
            },
            // Sends a DELETE request to remove a user's permissions
            removeUser: function (fid, user) {
                // DELETE /forms/{fid}/PERMISSION?username={username}
                // return Restangular.one("forms", fid).customDELETE("PERMISSION", {
                return Restangular.one("forms", fid).all("PERMISSION").remove({
                    username: user.username
                });
            }
        }
    });