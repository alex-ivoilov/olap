ui.define({
    name: 'ui.form.FieldView',
    type: 'field.view',
    base: 'view',
    data: {
        defaultTriggerIcon: '',
        defaultTag: 'input',
        defaultAttributes: {
            autocomplete: 'off'
        },

        init: function(control){
            this.tag = control.fieldTag || this.defaultTag;
            this.domAttributes = ui.extend(control.fieldAttributes || this.defaultAttributes, {
                name: control.fieldName,
                type: control.password ? 'password' : 'text'
            });

            this.base(control);
        },

        viewConfig: function() {
            return [
                {
                    name: 'input',
                    listeners: {
                        click: this.onClick
                    },
                    items:[
                        {
                            name: 'el',
                            tag: this.tag,
                            domAttributes: this.domAttributes,
                            listeners: {
                                focus: this.onFocus,
                                blur: this.onBlur,
                                keyup: this.onKeyUp,
                                keypress: this.onKeyPress
                            }
                        }
                    ]
                }
            ];
        },

        setReadOnly: function(readOnly){
            this.base(readOnly);
            this.getBox('input.el').attr('readonly', readOnly);
        },

        setLabel: function(text){
            if(text){
                this.getBox('label', true).setHtml(text);
                this.control.addClass('has-label');
            } else {
                this.removeBox('label');
                this.control.removeClass('has-label');
            }
        },

        setDisabled: function(disabled){
            this.base(disabled);
            this.getBox('input.el').attr('disabled', disabled);
        },

        setValue: function(text){
            this.getBox('input.el').el.val(text);
        },

        getValue: function(){
            return this.getBox('input.el').el.val();
        },

        onClick: function(el, e){
            if(this.disabled !== true){
                this.fire('click');
            }
        },

        onKeyUp: function(el, e){
            if(this.readOnly !== true){
                this.fire('keyup', [el, e]);
            }
        },

        onKeyPress: function(el, e){
            if(this.readOnly !== true){
                this.fire('keypress', [el, e]);
            }
        },

        focus: function(){
            this.getBox('input.el').focus();
        },

        blur: function(){
            this.getBox('input.el').blur();
        },

        onFocus: function(el, e){
            this.fire('focus', [el, e]);
            this.parent.addClass(this.cls+'-focus');
        },

        onBlur: function(el, e){
            this.parent.removeClass(this.cls+'-focus');
            this.fire('blur', [el, e]);
        },

        updateTriggers: function(){
            var triggerBox = this.getBox('triggers'),
                triggersWidth = 0;

            if(triggerBox){
                triggersWidth = triggerBox.outerWidth();
            }

            this.getBox('input.el').setRight(triggersWidth);
        },

        addTrigger: function(config){
            var onClickTrigger = function(el, e){
                if(ui.isFunction(config.handler)){
                    config.handler.delegate(config.scope, [el, e])();
                }

                this.fire('triggerClick', [config.name, el, e]);
            };

            var box = this.getBox('triggers', true);

            this.setBox({
                items:[{ name: 'trigger-icon', cls: this.cls + '-trigger-icon ' + (config.iconCls || this.defaultTriggerIcon) }],
                name: config.name,
                cls: this.cls+'-trigger',
                style: config.style,
                domAttributes: config.domAttributes,
                listeners: { click: onClickTrigger }
            }, box, config.name);

            this.updateTriggers();
        },

        setIcon: function(iconCls){
            this.parent.removeClass(this.cls+'-has-icon');
            this.removeBox('icon');

            if(iconCls){
                var box = this.getBox('icon', true);

                this.parent.addClass(this.cls+'-has-icon');
                box.addClass(iconCls);
            }
        }
    }
});