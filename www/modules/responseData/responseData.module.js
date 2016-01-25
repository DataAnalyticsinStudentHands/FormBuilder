/**
 * Created by Carl on 12/29/2015.
 */
angular.module('ResponseData', [
    'restangular',
    'FormBuilderUtil'
]);

angular.module('ResponseData').factory('responseService',
    function (Restangular, $filter, formService) {
        return {
            getResponse: function (rid, fid) {
                return Restangular.all("formResponses").get(rid, {"formId": fid}).then(function (data) {
                    return Restangular.stripRestangular(data);
                });
            },
            getResponsesByFormId: function (form_id) {
                var service = this;
                return Restangular.all("formResponses").all("byFormId").customGET(form_id, {numberOfFormResponses: 999999999}).then(function (data) {
                    var responses = Restangular.stripRestangular(data);
                    return formService.getForm(form_id).then(function (data_form) {
                        var form = Restangular.stripRestangular(data_form);
                        responses.forEach(function (response) {
                            service.processInResponse(response, form);
                            response.entries.forEach(function (entry, key) {
                                if (entry)
                                    service.processInEntry(entry, $filter('getByQuestionId')(form.questions, entry.question_id));
                                else
                                    response.entries[key] = {value: ""};
                            });
                        });
                        return responses;
                    })
                });
            },
            getMyResponses: function () {
                return Restangular.all("formResponses").customGET("myFormResponses", {numberOfFormResponses: 999999999}).then(function (data) {
                    return Restangular.stripRestangular(data);
                });
            },
            createResponse: function (fid, uid) {
                if(!uid) uid = 1;
                return Restangular.all("formResponses").post({
                    "form_id": fid,
                    "owner_id": uid,
                    "entries": []
                }).then(function (data) {
                    return eval(data);
                });
            },
            processOutResponse: function (input) {
                input.forEach(function (inputItem) {
                    if (isDate(inputItem.value)) {
                        inputItem.value = $filter('date')(Date.parse(inputItem.value), 'yyyy-MM-ddTHH:mmZ');
                    }
                });
                return input;
            },
            newResponse: function (input, fid, uid, rem) {
                var service = this;
                return this.createResponse(fid, uid).then(function (id) {
                    return service.getResponse(id, fid).then(function (response) {
                        if (rem) {
                            response.responder_email = rem;
                            response.send_receipt = true;
                        }
                        response.is_complete = true;
                        input = service.processOutResponse(input);
                        response.entries.forEach(function (entryObj) {
                            var inputObj = $filter('getById')(input, entryObj.question_id);
                            if (inputObj)
                                entryObj.value = inputObj.value;
                        });
                        return service.updateResponse(id, response);
                    })
                });
            },
            updateResponse: function (id, form) {
                return Restangular.all("formResponses").all(id).doPUT(form);
            },
            deleteResponse: function (rid) {
                return Restangular.all("formResponses").all(rid).remove();
            },
            processInResponse: function (response, form) {
                form.questions.forEach(function (question) {
                    var entry = $filter('getByQuestionId')(response.entries, question.question_id);
                    if (!entry) {
                        response.entries.push({value: "", question_id: question.question_id})
                    }
                });
                response.entries = $filter('orderByIndexInQuestion')($filter('uniqueById')(response.entries, 'question_id'), form.questions);
                return response;
            },
            processInEntry: function (entry, question) {
                switch (question.component) {
                    case "fileUpload":
                        if (entry.value != "")
                            entry.value = window.location.protocol + "//" + window.location.host + window.location.pathname + "#/file/" + entry.value;
                        else
                            entry.value = "No File";
                        break;
                    case "dateTimeInput":
                        entry.value = $filter('date')(entry.value, 'MM-dd-yyyy HH:mm a');
                        break;
                    case "dateInput":
                        entry.value = $filter('date')(entry.value, 'MM-dd-yyyy');
                        break;
                }
                return entry;
            }
        }
    });