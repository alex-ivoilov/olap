/**
 * @class ui.olap.plugins.QueryBuilder
 * @extends ui.Base
 *
 * Плагин для OLAP куба
 *
 *      var olap = ui.instance({
 *          type: 'olap',
 *          parent: 'body',
 *          width: 800,
 *          height: 500,
 *          ...
 *          plugins: ['olap.queryBuilder']
 *      });
 */
ui.define({
    name: 'ui.olap.plugins.QueryBuilder',
    type: 'olap.queryBuilder',
    base: 'base',
    data: {
        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации плагина
         */
        init: function(config){
            this.base(config);

            this.component.on('renderEnd', this.onRenderEnd, this);
            this.component.on('redraw', this.onRedraw, this);
            this.component.on('beforefilter', this.onBeforeFilter, this);
            this.component.on('layout', this.onLayout, this);
        },

        /**
         * Показать построитель запросов
         */
        show: function(){
            if(this.builder){
                this.builder.doRender();
                this.builder.modal.show();
                this.builder.query = ui.clone(this.query || { AND:[] });
                this.builder.redraw();
            } else {
                this.create();
            }
        },

        /**
         * Включить/Выключить построитель запросов
         */
        toggle: function(){
            this.enabled = !this.enabled;
            this.component.filter();
        },

        /**
         * Создать построитель запросов
         * @param {Boolean} autoRender Создавать контрол построителя запросов
         */
        create: function(autoRender){
            var olap = this.component,
                me = this,
                modal = $('<div class="ui-modal"/>'),
                buttons = $('<div class="ui-buttons"/>'),
                query = this.query || { AND:[] };

            this.builder = ui.instance({
                type: 'queryBuilder',
                query: query,
                left: 50,
                top: 50,
                right: 50,
                bottom: 50,
                parent: modal,
                modal: modal,
                autoRender: autoRender,
                getField: function(code){
                    return olap.fields.findOne({ dataIndex: code });
                },
                getFieldTitle: function(code){
                    var field = olap.fields.findOne({ dataIndex: code });

                    if(field && field.header) return field.header;

                    return code;
                },
                getOperands: function(code){
                    var field = olap.fields.findOne({ dataIndex: code }),
                        items =  ['EQ','NOT'];

                    switch(field.type){
                        case 'int':
                            items = items.concat(['LT','LTR','GT','GTR']);
                            break;
                    }

                    return items;
                },
                getFields: function(){
                    return olap.fields.map('dataIndex');
                },
                getGroups: function(code, callback){
                    return olap.store.getGroups(code, callback);
                },
                listeners: {
                    renderEnd: function(){
                        $('<div class="ui-btn"><span class="text">Принять</span></div>').click(function(){
                            me.enabled = true;
                            me.query = ui.clone(me.builder.query);
                            olap.filter();
                            modal.hide()
                        }).appendTo(buttons);

                        $('<div class="ui-btn"><span class="text">Отмена</span></div>').click(function(){
                            modal.hide();
                        }).appendTo(buttons);

                        buttons.appendTo(this.el);
                        modal.appendTo(olap.el);
                        modal.click(function(e){ if(e.target === modal.get(0)) modal.hide(); });
                    }
                }
            });
        },

        /**
         * Обработчик события готовности менеджера представлений OLAP куба
         * @param {ui.olap.Layout} layout Менеджер представлений OLAP куба
         */
        onLayout: function(layout){
            layout.on('update', function(data){
                if(!this.builder){
                    this.create(false);
                }

                this.builder.query = ui.clone(data.q);
                this.enabled = !!data.qe;
            }, this);

            layout.on('get', function(data){
                if(this.builder){
                    data.qe = this.enabled ? 1 : 0;
                    data.q = ui.clone(this.builder.query);
                }
            }, this);

            layout.on('clear', function(){
                this.query = { AND:[] };
                this.enabled = false;

                if(this.builder) {
                    this.builder.query = { AND:[] };
                }
            }, this);
        },

        /**
         * Обработчик события начала фильтрации OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Object} options Описание фильтров
         */
        onBeforeFilter: function(olap, options){
            if(this.enabled && this.builder){
                var q = this.builder.query,
                    tmp = {},
                    fn = this.builder.getQueryFunction();

                this.query = ui.clone(q);

                if(fn){
                    q['AND'] = q['AND'] || [];

                    olap.fields.each(function(f){
                        var key = f.dataIndex;

                        ui.each(f.filter, function(v){
                            if(!tmp[key]){
                                tmp[key] = { OR: [] };
                                q['AND'].push(tmp[key]);
                            }

                            tmp[key]['OR'].push({
                                value: v,
                                op: 'EQ',
                                field: key
                            });
                        });
                    });

                    options.filters = this.builder.getQueryFunction();
                    this.builder.query = this.query;
                }
            }
        },

        /**
         * Обработчик события перерисовки OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         */
        onRedraw: function(olap){
            var query = olap.view.getBox('filter.builder-query'),
                queryChk = olap.view.getBox('filter.builder-on');

            if(this.builder && this.builder.getQueryFunction()){
                query.setHtml(this.builder.getQueryString('html'));
                queryChk.show();
            } else {
                query.setHtml(null);
                queryChk.hide();
            }

            queryChk[this.enabled ? 'removeClass' : 'addClass']('disabled');
        },

        /**
         * Обработчик события создания OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         */
        onRenderEnd: function(olap){
            var view = olap.view;

            view.setBox({
                name: 'filter',
                items: [
                    'builder-on',
                    'builder-query',
                    {
                        name: 'builder-link',
                        extraCls: 'ui-btn',
                        html: '<span class="text">Показать фильтр</span>'
                    }
                ]
            });

            view.getBox('filter.builder-link').on('click', this.show, this);
            view.getBox('filter.builder-on').on('click', this.toggle, this);

            view.on('updateSize', this.onOlapUpdateSize, this);
        },

        /**
         * Обработчик события изменения размеров OLAP куба
         */
        onOlapUpdateSize: function(){
            var olap = this.component,
                view = olap.view,
                border = view.getBox('border'),
                dataBody = view.getBox('data'),
                rowsBody = view.getBox('rows'),
                bottom = view.getBox('filter').outerHeight();

            border.css({ bottom: bottom });
            dataBody.css({ bottom: bottom });
            rowsBody.css({ bottom: bottom });
        }
    }
});