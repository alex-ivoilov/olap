/**
 * Класс базового поля для воода данных
 *
 * @class ui.form.Field
 * @extends ui.Control
 */
ui.define({
    name: 'ui.form.Field',
    type: 'field',
    base: 'control',
    data: {
        viewType: 'field.view',
        cls: 'ui-field',
        changeOnEnter: true,
        triggers: null,
        displayName: null,
        dataIndex: null,

        render: function(){
            this.base();

            this.view.on('blur', this.onBlur, this);
            this.view.on('keypress', this.onKeyPress, this);
            this.view.on('keyup', this.onKeyUp, this);

            this.setIcon(this.iconCls);
            this.setLabel(this.label);

            ui.each(this.triggers, this.addTrigger, this);

            this.view.setValue(this.getRawValue(this.value));
        },

        setFocus: function(){
            this.view.focus();
        },

        clearFocus: function(){
            this.view.blur();
        },

        addTrigger: function(cfg){
            cfg = ui.extend(cfg || {},{
                handler: ui.emptyFn,
                scope: this,
                name: 'trigger'
            }, false);

            this.view.addTrigger(cfg);
        },

        onBlur: function(el){
            this.fire('blur');
            this.onChange(el);
        },

        onChange: function(el){
            var val = this.view.getBox('input.el').el.val();
            this.setValue(val == "" ? null : val);
        },

        onKeyPress: function(el, e){
            this.fire('keyPress', [el, e]);
        },

        onKeyUp: function(el, e){
            if(this.changeOnEnter && e.keyCode == ui.key.Enter){
                this.onChange(el);
            }
            this.fire('keyUp', [el, e]);
        },

        setValue: function(value, ghost){
            if(ui.isEmpty(value)){
                value = undefined;
            }

            if(this.checkValue(value)){
                this.value = value;
                this.view.setValue(this.getRawValue(this.value));

                if(ghost !== true){
                    this.fire('change', [this.getValue(), this]);
                }
            }
        },

        checkValue: function(val){
            if(ui.isString(val)){
                return val !== this.getRawValue(this.value);
            }

            return this.value !== val;
        },

        getValue: function(){
            return this.dataIndex && this.value ? this.value[this.dataIndex] : this.value;
        },

        getRawValue: function(val){
            if(ui.isString(val) || ui.isEmpty(val)){
                return val;
            }

            var rawValue = this.displayName ? val[this.displayName] : val;

            return ui.isString(rawValue) ? rawValue : ui.toJson(rawValue);
        }
    }
});