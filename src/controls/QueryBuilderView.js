
ui.define({
    name: 'ui.QueryBuilderView',
    type: 'queryBuilder.view',
    base: 'view',
    data: {
        init: function(cfg){
            this._groups = {};
            this.base(cfg);
        },

        viewConfig: function(){
            return [
                'body',
                'menu'
            ];
        },

        getField: function(item, gr){
            var builder = this.control,
                me = this,
                title = builder.getFieldTitle ? builder.getFieldTitle(item.field) : item.field,
                el = $('<span class="field">'+title+'</span>');

            return el.click(function(){
                var menu = [];

                builder.getFields().each(function(i){
                    menu.push({
                        text: builder.getFieldTitle ? builder.getFieldTitle(i) : i,
                        handler: function(){
                            item.field = i;
                            builder.redraw();
                        }
                    });
                });

                me.showMenu(el, menu, true);
            });
        },

        getValue: function(item){
            var builder = this.control,
                me = this,
                el = $('<span class="value">'+item.value+'</span>');

            return el.click(function(e){
                if(e.target !== el.get(0)) return;

                var input = $('<input type="text"/>').val(item.value),
                    endEdit = function(){
                        item.value = input.val();
                        builder.redraw();
                    },
                    drawMenu = function(){
                        var menu=[],
                            field = builder.getField(item.field);

                        if(field && field.area == 'data'){
                            return false;
                        }

                        me.getGroups(item.field, input.val(), function(i){
                            menu.push({
                                text: i,
                                handler: function(){
                                    item.value = i;
                                    builder.redraw();
                                }
                            });
                        });

                        if(menu.length){
                            me.showMenu(el, menu, false);
                        } else {
                            me.getBox('menu').hide();
                        }
                    };

                input.bind('keyup', function(e){
                    if(e.keyCode == ui.key.Enter) endEdit();
                    else if(e.keyCode == ui.key.Esc) {
                        input.remove();
                        me.getBox('menu').hide();
                    }
                    else drawMenu();
                });

                input.appendTo(el).focus();
                drawMenu();

                var evt = ui.EventsManager.on('mouseup', function(e){
                    if(e.target !== input.get(0) && e.target !== el.get(0) && !me.getBox('menu').hasDom(e.target)){
                        ui.EventsManager.un('mouseup', evt);
                        endEdit();
                    }
                    if(me.getBox('menu').hasDom(e.target)){
                        ui.EventsManager.un('mouseup', evt);
                    }
                });
            });
        },

        getGroups: function(code, val, callback){
            var queryFn = function(item){
                return item.toString().toLowerCase().indexOf(val.toString().toLowerCase()) >= 0;
            };

            this.control.getGroups(code, function(groups){ ui.array(groups).find(queryFn, callback); });
        },

        getCondition: function(op, item){
            var builder = this.control,
                ops = builder.operands,
                me = this,
                el = $('<span class="cnd">'+op+'</span>');

            return el.click(function(){
                var menu = [],
                    items = builder.getOperands ? builder.getOperands(item.field) : me.defaultOperands;

                items.each(function(i){
                    menu.push({
                        text: ops[i].view,
                        icon: ops[i].icon,
                        handler: function(){
                            item.op = i;
                            builder.redraw();
                        }
                    });
                });

                me.showMenu(el, menu, true);
            });
        },

        getOperand: function(op, data, dataGr){
            var builder = this.control,
                me = this,
                ops = builder.operands,
                el = $('<span class="operand">['+ops[op].view+']</span>'),
                removeFn = function(){
                    delete data[op];
                    if(dataGr && !data.AND && !data.OR) dataGr.remove(data);
                    builder.redraw();
                };

            if(dataGr) $('<div class="ui-close"/>').click(removeFn).appendTo(el);

            return el.click(function(){
                var menu = [
                    {
                        text: ops[op == 'AND' ? 'OR' : 'AND'].view,
                        handler: function(){
                            data[op == 'AND' ? 'OR' : 'AND'] = data[op];
                            delete data[op];
                            builder.redraw();
                        }
                    },
                    '-',
                    {
                        text: 'Добавить "И"',
                        handler: function(){
                            data[op].push({ AND: [] });
                            builder.redraw();
                        }
                    },
                    {
                        text: 'Добавить "ИЛИ"',
                        handler: function(){
                            data[op].push({ OR: [] });
                            builder.redraw();
                        }
                    },
                    {
                        text: 'Добавить условие',
                        handler: function(){
                            data[op].push({
                                field: builder.getFields()[0],
                                value: '',
                                op: 'EQ'
                            });
                            builder.redraw();
                        }
                    }
                ];

                if(dataGr){
                    menu.push('-');
                    menu.push({
                        text: 'Удалить',
                        handler: removeFn
                    });
                }

                me.showMenu(el, menu, true);
            });
        },

        showMenu: function(el, items, autoHide){
            var menu = this.getBox('menu');

            if(autoHide !== false){
                ui.EventsManager.on('mouseup', function(e){
                    if(menu.hasDom(e.target) === false && el.get(0) !== e.target && menu.css('display') != 'none'){
                        menu.hide();
                        ui.EventsManager.un(menu);
                    }
                });
            }

            menu.appendTo(el);
            menu.empty();
            menu.show();

            items.each(function(item){
                if(item == '-'){
                    menu.append('<div class="sep"></div>');
                } else {
                    menu.append($('<div class="item"><span>'+(item.icon||'')+'</span>'+item.text+'</div>').click(function(){ item.handler(); menu.hide(); }));
                }
            });
        }
    }
});