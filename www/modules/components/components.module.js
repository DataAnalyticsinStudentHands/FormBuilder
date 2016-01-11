/**
 * Created by Carl on 12/29/2015.
 */
angular.module('FormBuilderComponents', [
    'angularFileUpload',
    'signature',
    'ui.router',
    'restangular'
]);

angular.module('FormBuilderComponents').config(
    function ($stateProvider) {
        $stateProvider
            .state('download', {
                url: "/file/:id",
                views: {
                    "app": {
                        templateUrl: "modules/components/fileUpload/file.html", controller: "fileDownloadCtrl"
                    }
                },
                data: {pageTitle: 'Download'},
                authenticate: true
            })
    });

angular.module('FormBuilderComponents').run(
    function ($builder) {
        $builder.registerComponent('descriptionHorizontal', {
            group: 'Other',
            label: 'TextBlock 1',
            description: "This is a textblock.",
            required: false,
            arrayToText: false,
            templateUrl: "modules/components/descriptionHorizontal/tmplDescriptionHorizontal.html",
            popoverTemplateUrl: "modules/components/descriptionHorizontal/popDescriptionHorizontal.html"
        });
        $builder.registerComponent('description', {
            group: 'Other',
            label: 'TextBlock 2',
            description: "This is a textblock.",
            required: false,
            arrayToText: false,
            templateUrl: "modules/components/description/tmplDescription.html",
            popoverTemplateUrl: "modules/components/description/popDescription.html"
        });
        $builder.registerComponent('dateTimeInput', {
            group: 'Other',
            label: 'Date Time Picker',
            description: 'Choose a Date and Time',
            placeholder: '',
            required: false,
            templateUrl: 'modules/components/dateTime/tmplDateTime.html',
            popoverTemplateUrl: 'modules/components/dateTime/popDateTime.html'
        });
        $builder.registerComponent('dateInput', {
            group: 'Other',
            label: 'Date',
            description: 'Choose a Date',
            placeholder: '',
            required: false,
            templateUrl: 'modules/components/date/tmplDate.html',
            popoverTemplateUrl: 'modules/components/date/popDate.html'
        });
        $builder.registerComponent('phoneInput', {
            group: 'Default',
            label: 'Phone',
            description: 'Phone Number',
            validation: '/^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$|^$/',
            placeholder: '###-###-####',
            required: false,
            templateUrl: 'modules/components/phone/tmplPhone.html',
            popoverTemplateUrl: 'modules/components/phone/popPhone.html'
        });
        $builder.registerComponent('signaturePad', {
            group: 'Default',
            label: 'Signature Pad',
            description: 'Canvas to accept signature as mouse input.',
            required: false,
            templateUrl: 'modules/components/signaturePad/tmplSignature.html',
            popoverTemplateUrl: 'modules/components/signaturePad/popSignature.html'
        });
        $builder.registerComponent('name', {
            group: 'Other',
            label: 'Name',
            required: false,
            arrayToText: true,
            template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-md-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-md-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[0]\"\n                class=\"form-control\" id=\"{{formName+index}}-0\"/>\n            <p class='help-block'>First name</p>\n        </div>\n        <div class=\"col-sm-6\" style=\"padding-left: 0;\">\n            <input type=\"text\"\n                ng-model=\"inputArray[1]\"\n                class=\"form-control\" id=\"{{formName+index}}-1\"/>\n            <p class='help-block'>Last name</p>\n        </div>\n    </div>\n</div>",
            popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Close'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
        });
        $builder.registerComponent('address', {
            group: 'Other',
            label: 'Address',
            required: false,
            arrayToText: true,
            templateUrl: "modules/components/address/tmplAddress.html",
            popoverTemplateUrl: "modules/components/address/popAddress.html"
        });
        $builder.registerComponent('section', {
            group: 'Other',
            label: 'Section/Page Name',
            description: 'Conditional Section/Page Description',
            placeholder: '',
            required: false,
            templateUrl: 'modules/components/section/tmplSection.html',
            popoverTemplateUrl: 'modules/components/section/popSection.html'
        });
        $builder.registerComponent('fileUpload', {
            group: 'Other',
            label: 'Upload a file',
            required: false,
            templateUrl: 'modules/components/fileUpload/tmplFileUpload.html',
            popoverTemplateUrl: 'modules/components/fileUpload/popFileUpload.html'
        });
        $builder.registerComponent('QRscanner', {
            group: 'Other',
            label: 'Scan A QR Code',
            required: false,
            templateUrl: 'modules/components/QRScanner/tmplQRscanner.html',
            popoverTemplateUrl: 'modules/components/QRScanner/popQRscanner.html'
        });
    });

angular.module('FormBuilderComponents').controller('fileDownloadCtrl',
    function ($scope, $stateParams, ngNotify, Restangular) {
        $scope.id = $stateParams.id;

        $scope.download = function (id) {
            Restangular.setFullResponse(true);
            Restangular.all("fileUploads")
                .withHttpConfig({responseType: 'arraybuffer'}).customGET(id)
                .then(
                    function (success) {
                        var blob = new Blob([success.data], {
                            type: success.headers("content-type")
                        });
                        saveAs(blob, success.headers("file_name"));
                        Restangular.setFullResponse(false);
                    },
                    function () {
                        ngNotify.set("Something went wrong while getting the uploaded file!", {
                            position: 'bottom',
                            type: 'error',
                            duration: 10000
                        });
                        Restangular.setFullResponse(false);
                    }
                );
        };

        $scope.download($scope.id);
    });

angular.module('FormBuilderComponents').controller('uploadCtrl',
    function ($filter, $scope, $http, $timeout, $upload, $stateParams, Restangular, ngNotify, $rootScope) {
        $scope.uploadRightAway = true;
        $scope.objJoin = function (obj) {

            var retArr = [];
            for (var item in obj) {

                if (obj[item] != '')
                    retArr.push(obj[item]);
            }

            return retArr;
        };

        $scope.hasUploader = function (index) {
            return $scope.upload[index] !== null;
        };
        $scope.abort = function (index) {
            $scope.upload[index].abort();
            $scope.upload[index] = null;
        };
        $scope.onFileSelect = function ($files, param) {
            $scope.selectedFiles = [];
            $scope.progress = [];
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i = 0; i < $scope.upload.length; i++) {
                    if ($scope.upload[i] !== null) {
                        $scope.upload[i].abort();
                    }
                }
            }
            $scope.upload = [];
            $scope.uploadResult = [];
            $scope.selectedFiles = $files;
            $scope.dataUrls = [];
            for (i = 0; i < $files.length; i++) {
                var $file = $files[i];
                $scope.fileName = param + $file.name;
                $scope.name = $file.name;
                $scope.progress[i] = -1;
                if ($scope.uploadRightAway) {
                    $scope.start(i);
                }
            }
        };

        $scope.start = function (index) {
            $scope.progress[index] = 0;
            $scope.errorMsg = null;
            var uploadUrl = Restangular.configuration.baseUrl + '/fileUploads?user_id=' + $rootScope.uid + '&form_id=' + $rootScope.form_obj.id + '&content_type=' + $scope.selectedFiles[index].type;
            $scope.upload[index] = $upload.upload({
                url: uploadUrl,
                file: $scope.selectedFiles[index],
                fileName: $scope.fileName
            });
            $scope.upload[index].then(function (response) {
                $scope.$parent.inputText = response.headers("ObjectId");
                $scope.inputId = response.headers("ObjectId");
                $timeout(function () {
                    $scope.uploadResult.push(response.data);
                });
            }, function (response) {
                if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
            $scope.upload[index].xhr(function (xhr) {
            });
        };

        $scope.deleteFile = function (id) {
            Restangular.all("fileUploads").one(id).remove({}).then(
                function () {
                    $scope.inputId = null;
                    $scope.inputText = null;
                    $scope.$parent.inputText = null;
                    ngNotify.set("Deleted!", {position: 'bottom', type: 'success', duration: 5000});
                },
                function () {
                    ngNotify.set("Could not delete your file on server.", {position: 'bottom', type: 'error', duration: 10000});
                }
            );
        };

        $scope.download = function (id) {
            if (id.toString() === "[object File]") {
                id = $scope.inputId;
            }
            Restangular.setFullResponse(true);
            Restangular.all("fileUploads")
                .withHttpConfig({responseType: 'arraybuffer'}).customGET(id)
                .then(
                    function (success) {
                        var blob = new Blob([success.data], {
                            type: success.headers("content-type")
                        });
                        saveAs(blob, success.headers("file_name"));
                        Restangular.setFullResponse(false);
                    },
                    function () {
                        ngNotify.set("Something went wrong while getting the uploaded file!", {
                            position: 'bottom',
                            type: 'error',
                            duration: 10000
                        });
                        Restangular.setFullResponse(false);
                    }
                );
        }
    });