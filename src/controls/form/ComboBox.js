/**
 * Класс базового выподающего списка записей
 * для выбора значений
 *
 * @class ui.form.ComboBox
 * @extends ui.form.Field
 */
ui.define({
    name: 'ui.form.ComboBox',
    type: 'combo',
    base: 'field',
    data: {
        autoClose: true,
        readOnly: true,
        valueRenderer: null,
        closed: null,
        cls: 'ui-combo',

        init: function(config){
            ui.extend(config, {
                closed: true,
                dataLoaded: false
            });

            config.triggers = (config.triggers || []).concat({
                iconCls: 'icon_combo_open',
                handler: this.toggle,
                scope: this
            });

            this.base(config);
        },

        render: function(){
            this.base();

            this.view.on('click', function(){ this.readOnly && this.toggle(); }, this);

            this.container = ui.instance({
                type: 'element',
                parent: 'body',
                cls: this.cls + '-box',
                autoRender: false
            });

            if(this.autoClose){
                ui.EventsManager.on('mousedown', this.onDocumentClick, this);
            }
        },

        open: function(){
            this.fire('beforeOpen');

            if(!ui.isArrayHasElements(this.data)){
                return;
            }

            this.container.show();

            var o = this.offset(),
                h = this.el.outerHeight(),
                w = this.el.outerWidth();

            this.container.css({
                top: h + o.top,
                width: w,
                left: o.left
            });

            this.closed = false;

            if(!this.dataLoaded){
                ui.each(this.data, this.addValue, this);

                this.dataLoaded = true;
            }
        },

        addValue: function(val){
            var el = ui.instance({
                type: 'element',
                parent: this.container
            });

            if(ui.isFunction(this.valueRenderer)){
                this.valueRenderer(el, val);
            } else {
                el.setHtml(this.displayName ? val[this.displayName] : val);
                el.addClass('ui-combo-value');
            }

            el.on('click', function(){
                this.close();
                this.setValue(val);
            }, this);

            this.on('change', function(v){
                if(v === val){
                    el.addClass('active');
                } else {
                    el.removeClass('active');
                }
            }, this);

            if(this.value === val){
                el.addClass('active');
            }

            return el;
        },

        close: function(){
            this.fire('beforeClose');
            if(this.container){
                this.container.hide();
                this.closed = true;
            }
        },

        toggle: function(){
            if(this.closed){
                this.open();
            } else {
                this.close();
            }
        },

        onDocumentClick: function(e){
            if(!this.hasDom(e.target) && !this.container.hasDom(e.target)){
                this.close();
            }
        },

        setValue: function(val, ghost){
            if(this.dataIndex){
                ui.each(this.data, function(rec){
                    if(rec[this.dataIndex] === val){
                        val = rec;
                        return false;
                    }
                }, this);
            }

            this.base(val, ghost);
        },

        hasDom: function(dom){
            return this.base(dom) || this.container.hasDom(dom);
        },

        destroy: function(){
            this.container && this.container.destroy();
            this.base();
        }
    }
});