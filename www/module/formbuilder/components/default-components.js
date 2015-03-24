// Generated by CoffeeScript 1.9.1
(function() {
  angular.module('builder.components', ['builder', 'validator.rules']).config([
    '$builderProvider', function($builderProvider) {
      $builderProvider.registerComponent('textInput', {
        group: 'Default',
        label: 'Text Input',
        description: '',
        placeholder: 'placeholder',
        required: false,
        validationOptions: [
          {
            label: 'none',
            rule: '/.*/'
          }, {
            label: 'number',
            rule: '[number]'
          }, {
            label: 'email',
            rule: '[email]'
          }, {
            label: 'url',
            rule: '[url]'
          }
        ],
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class='{{settings.boxSize ? settings.boxSize : \"col-sm-8\"}}' ng-init=\"settings.setDefaults ? ($parent.inputText = settings.default || $parent.inputText) : $parent.inputText = null\">\n        <input type=\"text\" maxlength='{{settings.charLimit}}' ng-trim=\"false\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\" id=\"{{formName+index}}\" class=\"form-control\" placeholder=\"{{placeholder}}\"/>\n        <p class=\"help-block\">{{description}}</p>\n        <p class=\"help-block pull-right\" ng-show=\"settings.charLimit_show === true\">{{settings.charLimit - inputText.length}} characters remaining</p>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Label</label>\n        <input type=\"text\" ng-model=\"label\" validator=\"[required]\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Description</label>\n        <input type=\"text\" ng-model=\"description\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Placeholder</label>\n        <input type=\"text\" ng-model=\"placeholder\" class=\"form-control\"/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"required\" />\n            Required</label>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"settings.charLimit_show\" />\n            Character Limit</label>\n    </div>\n    <div class=\"form-group\" ng-show=\"settings.charLimit_show === true\">\n        <label class=\"control-label\">Character Limit</label>\n        <input type=\"number\" ng-model=\"settings.charLimit\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\" ng-if=\"validationOptions.length > 0\">\n        <label class=\"control-label\">Validation</label>\n        <select ng-model=\"$parent.validation\" class=\"form-control\" ng-options=\"option.rule as option.label for option in validationOptions\"></select>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Size</label>\n        <select ng-init=\"settings.boxSize = settings.boxSize || 'col-sm-8'\" ng-model=\"settings.boxSize\" class=\"form-control\" ng-options=\"size.value as size.label for size in [{'value':'col-sm-8','label':'Large'},{'value':'col-sm-3','label':'Medium'},{'value':'col-sm-2','label':'Small'}]\">\n        </select>\n    </div>\n\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"settings.setDefaults\" ng-change=\"resetInputText()\" />\n            Set Defaults</label>\n    </div>\n\n    <div class=\"form-group\" ng-show=\"settings.setDefaults\">\n        <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">Defaults</label>\n        <div class='{{settings.boxSize ? settings.boxSize : \"col-sm-8\"}}'>\n            <input type=\"text\" maxlength='{{settings.charLimit}}' ng-trim=\"false\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\" id=\"{{formName+index}}\" class=\"form-control\" placeholder=\"{{placeholder}}\" ng-change=\"settings.default = inputText\"/>\n            <p class=\"help-block\">{{description}}</p>\n            <p class=\"help-block pull-right\" ng-show=\"settings.charLimit_show === true\">{{settings.charLimit - inputText.length}} characters remaining</p>\n        </div>\n    </div>\n\n    <hr/>\n    <div class=\"form-group\">\n        <input type=\"submit\" ng-click=\"popover.save($event)\" class=\"btn btn-primary\" value=\"Close\"/>\n        <input type=\"button\" ng-click=\"popover.cancel($event)\" class=\"btn btn-default\" value=\"Cancel\"/>\n        <input type=\"button\" ng-click=\"popover.remove($event)\" class=\"btn btn-danger\" value=\"Delete\"/>\n    </div>\n</form>"
      });
      $builderProvider.registerComponent('textArea', {
        group: 'Default',
        label: 'Text Area',
        description: '',
        placeholder: 'placeholder',
        required: false,
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <textarea maxlength='{{settings.charLimit}}' ng-trim=\"false\" type=\"text\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\" id=\"{{formName+index}}\" class=\"form-control\" rows=\"6\" placeholder=\"{{placeholder}}\"/>\n        <p class=\"help-block pull-right\" ng-show=\"settings.charLimit_show === true\">{{settings.charLimit - inputText.length}} characters remaining</p>\n        <p class=\"help-block\">{{description}}</p>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Label</label>\n        <input type=\"text\" ng-model=\"label\" validator=\"[required]\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Description</label>\n        <input type=\"text\" ng-model=\"description\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Placeholder</label>\n        <input type=\"text\" ng-model=\"placeholder\" class=\"form-control\"/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"required\" />\n            Required</label>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"settings.charLimit_show\" />\n            Character Limit</label>\n    </div>\n    <div class=\"form-group\" ng-show=\"settings.charLimit_show === true\">\n        <label class=\"control-label\">Character Limit</label>\n        <input type=\"number\" ng-model=\"settings.charLimit\" class=\"form-control\"/>\n    </div>\n    <hr/>\n    <div class=\"form-group\">\n        <input type=\"submit\" ng-click=\"popover.save($event)\" class=\"btn btn-primary\" value=\"Close\"/>\n        <input type=\"button\" ng-click=\"popover.cancel($event)\" class=\"btn btn-default\" value=\"Cancel\"/>\n        <input type=\"button\" ng-click=\"popover.remove($event)\" class=\"btn btn-danger\" value=\"Delete\"/>\n    </div>\n</form>"
      });
      $builderProvider.registerComponent('checkbox', {
        group: 'Default',
        label: 'Checkbox',
        description: '',
        placeholder: 'placeholder',
        required: false,
        options: ['option one', 'option two'],
        arrayToText: true,
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <input type=\"hidden\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class=\"checkbox\" ng-init=\"settings.setDefaults ? ($parent.inputArray = settings.default || $parent.inputArray) : $parent.inputArray = []\" ng-repeat=\"item in options track by $index\">\n            <label><input type=\"checkbox\" ng-model=\"$parent.inputArray[$index]\" value=\"item\"/>\n                {{item}}\n            </label>\n        </div>\n        <p class=\"help-block\">{{description}}</p>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Label</label>\n        <input type=\"text\" ng-model=\"label\" validator=\"[required]\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Description</label>\n        <input type=\"text\" ng-model=\"description\" class=\"form-control\"/>\n    </div>\n    <div class=\"form-group\">\n        <label class=\"control-label\">Options</label>\n        <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>\n    </div>\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"required\" />\n            Required\n        </label>\n    </div>\n\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"settings.setDefaults\" ng-change=\"resetInputArray()\" />\n            Set Defaults</label>\n    </div>\n\n    <div class=\"form-group\" ng-show=\"settings.setDefaults\">\n        <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">Defaults</label>\n        <div class=\"col-sm-8\">\n            <input type=\"hidden\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n            <div class=\"checkbox\" ng-repeat=\"item in options track by $index\">\n                <label><input type=\"checkbox\" ng-model=\"$parent.inputArray[$index]\" value=\"item\" ng-change=\"settings.default = $parent.inputArray\"/>\n                    {{item}}\n                </label>\n            </div>\n        </div>\n    </div>\n\n    <hr/>\n    <div class=\"form-group\">\n        <input type=\"submit\" ng-click=\"popover.save($event)\" class=\"btn btn-primary\" value=\"Close\"/>\n        <input type=\"button\" ng-click=\"popover.cancel($event)\" class=\"btn btn-default\" value=\"Cancel\"/>\n        <input type=\"button\" ng-click=\"popover.remove($event)\" class=\"btn btn-danger\" value=\"Delete\"/>\n    </div>\n</form>"
      });
      $builderProvider.registerComponent('radio', {
        group: 'Default',
        label: 'Radio',
        description: '',
        placeholder: 'placeholder',
        required: false,
        options: ['option one', 'option two'],
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <div class='radio' ng-repeat=\"item in options track by $index\" ng-init=\"settings.setDefaults ? ($parent.inputText = settings.default || $parent.inputText) : $parent.inputText = null\">\n            <label>\n                <input name='{{formName+index}}' ng-model=\"$parent.inputText\" validator-group=\"{{formName}}\" value='{{item}}' type='radio'/>\n                {{item}}\n            </label>\n        </div>\n        <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"form-group\">\n        <label class='control-label'>Description</label>\n        <input type='text' ng-model=\"description\" class='form-control'/>\n    </div>\n    <div class=\"form-group\">\n        <label class='control-label'>Options</label>\n        <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>\n     <div class=\"checkbox\">\n        <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n        </label>\n    </div></div>\n\n    <div class=\"checkbox\">\n        <label>\n            <input type=\"checkbox\" ng-model=\"settings.setDefaults\" ng-change=\"resetInputText()\" />\n            Set Defaults</label>\n    </div>\n\n    <div class=\"form-group\" ng-show=\"settings.setDefaults\">\n        <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">Defaults</label>\n        <div class=\"col-sm-8\">\n            <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n            <div class='radio' ng-repeat=\"item in options track by $index\">\n                <label>\n                    <input name='{{formName+index}}' ng-model=\"$parent.inputText\" validator-group=\"{{formName}}\" value='{{item}}' type='radio' ng-change=\"settings.default = $parent.inputText\"/>\n                    {{item}}\n                </label>\n            </div>\n            <p class='help-block'>{{description}}</p>\n        </div>\n    </div>\n\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Close'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
      });
      return $builderProvider.registerComponent('select', {
        group: 'Default',
        label: 'Select',
        description: '',
        placeholder: 'placeholder',
        required: false,
        options: ['option one', 'option two'],
        template: "<div class=\"form-group\">\n    <label for=\"{{formName+index}}\" class=\"col-sm-4 control-label\" ng-class=\"{'fb-required':required}\">{{label}}</label>\n    <div class=\"col-sm-8\">\n        <input type='hidden' ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <select ng-options=\"value for value in options\" id=\"{{formName+index}}\" class=\"form-control\" ng-model=\"inputText\" validator-required=\"{{required}}\" validator-group=\"{{formName}}\"/>\n        <p class='help-block'>{{description}}</p>\n    </div>\n</div>",
        popoverTemplate: "<form>\n    <div class=\"form-group\">\n        <label class='control-label'>Label</label>\n        <input type='text' ng-model=\"label\" validator=\"[required]\" class='form-control'/>\n    </div>\n    <div class=\"form-group\">\n        <label class='control-label'>Description</label>\n        <input type='text' ng-model=\"description\" class='form-control'/>\n    </div>\n    <div class=\"form-group\">\n        <label class='control-label'>Options</label>\n        <textarea class=\"form-control\" rows=\"3\" ng-model=\"optionsText\"/>\n    </div>\n\n    <label>\n            <input type='checkbox' ng-model=\"required\" />\n            Required\n    </label>\n    <hr/>\n    <div class='form-group'>\n        <input type='submit' ng-click=\"popover.save($event)\" class='btn btn-primary' value='Close'/>\n        <input type='button' ng-click=\"popover.cancel($event)\" class='btn btn-default' value='Cancel'/>\n        <input type='button' ng-click=\"popover.remove($event)\" class='btn btn-danger' value='Delete'/>\n    </div>\n</form>"
      });
    }
  ]);

}).call(this);

//# sourceMappingURL=default-components.js.map
