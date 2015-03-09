angular.module 'builder.components', ['builder', 'validator.rules']
.config ['$builderProvider', ($builderProvider) ->
    # ----------------------------------------
    # text input
    # ----------------------------------------
    $builderProvider.registerComponent 'textInput',
        group: 'Default'
        label: 'Text Input'
        description: ''
        placeholder: 'placeholder'
        required: no
        validationOptions: [
            {label: 'none', rule: '/.*/'}
            {label: 'number', rule: '[number]'}
            {label: 'email', rule: '[email]'}
            {label: 'url', rule: '[url]'}
        ]
        template:
            """
            <div class="form-group">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class='{{settings.boxSize ? settings.boxSize : "col-sm-8"}}'>
                    <input type="text" maxlength='{{settings.charLimit}}' ng-trim="false" ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}" id="{{formName+index}}" class="form-control" placeholder="{{placeholder}}"/>
                    <p class="help-block">{{description}}</p>
                    <p class="help-block pull-right" ng-show="settings.charLimit_show === true">{{settings.charLimit - inputText.length}} characters remaining</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class="control-label">Label</label>
                    <input type="text" ng-model="label" validator="[required]" class="form-control"/>
                </div>
                <div class="form-group">
                    <label class="control-label">Description</label>
                    <input type="text" ng-model="description" class="form-control"/>
                </div>
                <div class="form-group">
                    <label class="control-label">Placeholder</label>
                    <input type="text" ng-model="placeholder" class="form-control"/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" ng-model="required" />
                        Required</label>
                </div>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" ng-model="settings.charLimit_show" />
                        Character Limit</label>
                </div>
                <div class="form-group" ng-show="settings.charLimit_show === true">
                    <label class="control-label">Character Limit</label>
                    <input type="number" ng-model="settings.charLimit" class="form-control"/>
                </div>
                <div class="form-group" ng-if="validationOptions.length > 0">
                    <label class="control-label">Validation</label>
                    <select ng-model="$parent.validation" class="form-control" ng-options="option.rule as option.label for option in validationOptions"></select>
                </div>
                <div class="form-group">
                    <label class="control-label">Size</label>
                    <select ng-init="settings.boxSize = settings.boxSize || 'col-sm-8'" ng-model="settings.boxSize" class="form-control" ng-options="size.value as size.label for size in [{'value':'col-sm-8','label':'Large'},{'value':'col-sm-3','label':'Medium'},{'value':'col-sm-2','label':'Small'}]">
                    </select>
                </div>

                <hr/>
                <div class="form-group">
                    <input type="submit" ng-click="popover.save($event)" class="btn btn-primary" value="Close"/>
                    <input type="button" ng-click="popover.cancel($event)" class="btn btn-default" value="Cancel"/>
                    <input type="button" ng-click="popover.remove($event)" class="btn btn-danger" value="Delete"/>
                </div>
            </form>
            """

    # ----------------------------------------
    # Text area
    # ----------------------------------------
    $builderProvider.registerComponent 'textArea',
        group: 'Default'
        label: 'Text Area'
        description: ''
        placeholder: 'placeholder'
        required: no
        template:
            """
            <div class="form-group">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <textarea maxlength='{{settings.charLimit}}' ng-trim="false" type="text" ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}" id="{{formName+index}}" class="form-control" rows="6" placeholder="{{placeholder}}"/>
                    <p class="help-block pull-right" ng-show="settings.charLimit_show === true">{{settings.charLimit - inputText.length}} characters remaining</p>
                    <p class="help-block">{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class="control-label">Label</label>
                    <input type="text" ng-model="label" validator="[required]" class="form-control"/>
                </div>
                <div class="form-group">
                    <label class="control-label">Description</label>
                    <input type="text" ng-model="description" class="form-control"/>
                </div>
                <div class="form-group">
                    <label class="control-label">Placeholder</label>
                    <input type="text" ng-model="placeholder" class="form-control"/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" ng-model="required" />
                        Required</label>
                </div>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" ng-model="settings.charLimit_show" />
                        Character Limit</label>
                </div>
                <div class="form-group" ng-show="settings.charLimit_show === true">
                    <label class="control-label">Character Limit</label>
                    <input type="number" ng-model="settings.charLimit" class="form-control"/>
                </div>
                <hr/>
                <div class="form-group">
                    <input type="submit" ng-click="popover.save($event)" class="btn btn-primary" value="Close"/>
                    <input type="button" ng-click="popover.cancel($event)" class="btn btn-default" value="Cancel"/>
                    <input type="button" ng-click="popover.remove($event)" class="btn btn-danger" value="Delete"/>
                </div>
            </form>
            """

    # ----------------------------------------
    # checkbox
    # ----------------------------------------
    $builderProvider.registerComponent 'checkbox',
        group: 'Default'
        label: 'Checkbox'
        description: ''
        placeholder: 'placeholder'
        required: no
        options: ['option one', 'option two']
        arrayToText: yes
        template:
            """
            <div class="form-group">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <input type="hidden" ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                    <div class="checkbox" ng-init="$parent.inputArray = settings[index].default || $parent.inputArray" ng-repeat="item in options track by $index">
                        <label><input type="checkbox" ng-model="$parent.inputArray[$index]" value="item"/>
                            {{item}}
                        </label>
                    </div>
                    <p class="help-block">{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class="control-label">Label</label>
                    <input type="text" ng-model="label" validator="[required]" class="form-control"/>
                </div>
                <div class="form-group">
                    <label class="control-label">Description</label>
                    <input type="text" ng-model="description" class="form-control"/>
                </div>
                <div class="form-group">
                    <label class="control-label">Options</label>
                    <textarea class="form-control" rows="3" ng-model="optionsText"/>
                </div>
                <div class="checkbox">
                    <label>
                        <input type="checkbox" ng-model="required" />
                        Required
                    </label>
                </div>

                <div class="form-group">
                    <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">Defaults</label>
                    <div class="col-sm-8">
                        <input type="hidden" ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                        <div class="checkbox" ng-repeat="item in options track by $index">
                            <label><input type="checkbox" ng-model="$parent.inputArray[$index]" value="item" ng-change="settings.default[index] = $parent.inputArray"/>
                                {{item}}
                            </label>
                        </div>
                    </div>
                </div>

                <hr/>
                <div class="form-group">
                    <input type="submit" ng-click="popover.save($event)" class="btn btn-primary" value="Close"/>
                    <input type="button" ng-click="popover.cancel($event)" class="btn btn-default" value="Cancel"/>
                    <input type="button" ng-click="popover.remove($event)" class="btn btn-danger" value="Delete"/>
                </div>
            </form>
            """

    # ----------------------------------------
    # radio
    # ----------------------------------------
    $builderProvider.registerComponent 'radio',
        group: 'Default'
        label: 'Radio'
        description: ''
        placeholder: 'placeholder'
        required: no
        options: ['option one', 'option two']
        template:
            """
            <div class="form-group">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <input type='hidden' ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                    <div class='radio' ng-repeat="item in options track by $index">
                        <label>
                            <input name='{{formName+index}}' ng-model="$parent.inputText" validator-group="{{formName}}" value='{{item}}' type='radio'/>
                            {{item}}
                        </label>
                    </div>
                    <p class='help-block'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Options</label>
                    <textarea class="form-control" rows="3" ng-model="optionsText"/>
                 <div class="checkbox">
                    <label>
                        <input type='checkbox' ng-model="required" />
                        Required
                    </label>
                </div></div>

                <div class="form-group">
                    <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">Defaults</label>
                    <div class="col-sm-8">
                        <input type='hidden' ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                        <div class='radio' ng-repeat="item in options track by $index">
                            <label>
                                <input name='{{formName+index}}' ng-model="$parent.inputText" validator-group="{{formName}}" value='{{item}}' type='radio'/>
                                {{item}}
                            </label>
                        </div>
                        <p class='help-block'>{{description}}</p>
                    </div>
                </div>

                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Close'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """

    # ----------------------------------------
    # select
    # ----------------------------------------
    $builderProvider.registerComponent 'select',
        group: 'Default'
        label: 'Select'
        description: ''
        placeholder: 'placeholder'
        required: no
        options: ['option one', 'option two']
        template:
            """
            <div class="form-group">
                <label for="{{formName+index}}" class="col-sm-4 control-label" ng-class="{'fb-required':required}">{{label}}</label>
                <div class="col-sm-8">
                    <input type='hidden' ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                    <select ng-options="value for value in options" id="{{formName+index}}" class="form-control" ng-model="inputText" validator-required="{{required}}" validator-group="{{formName}}"/>
                    <p class='help-block'>{{description}}</p>
                </div>
            </div>
            """
        popoverTemplate:
            """
            <form>
                <div class="form-group">
                    <label class='control-label'>Label</label>
                    <input type='text' ng-model="label" validator="[required]" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Description</label>
                    <input type='text' ng-model="description" class='form-control'/>
                </div>
                <div class="form-group">
                    <label class='control-label'>Options</label>
                    <textarea class="form-control" rows="3" ng-model="optionsText"/>
                </div>

                <label>
                        <input type='checkbox' ng-model="required" />
                        Required
                </label>
                <hr/>
                <div class='form-group'>
                    <input type='submit' ng-click="popover.save($event)" class='btn btn-primary' value='Close'/>
                    <input type='button' ng-click="popover.cancel($event)" class='btn btn-default' value='Cancel'/>
                    <input type='button' ng-click="popover.remove($event)" class='btn btn-danger' value='Delete'/>
                </div>
            </form>
            """
]
