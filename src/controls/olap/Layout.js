/**
 * Базовый класс менеджера представлений OLAP куба
 * @class ui.olap.Layout
 * @extends ui.Base
 */
ui.define({
    name: 'ui.olap.Layout',
    type: 'olap.Layout',
    base: 'base',
    data: {
        areas: ['filter', 'data', 'rows', 'columns'],
        sorts: ['ASC', 'DESC'],

        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации
         */
        init: function(config){
            this.base(config);
        },

        /**
         * Обновить представление OLAP куба
         * @param {Object} data Данные представления
         */
        update: function (data) {
            var olap = this.olap,
                fields = olap.fields,
                viewFields = ui.array(data.f),
                areas = this.areas,
                sorts = this.sorts;

            data = data || this.data;
            this.data = data;
            this._eg = data.e || [];

            fields.each(function (field) {
                var view = viewFields.findOne({ c: field.dataIndex });

                if (view) {
                    field.filter = view.f;
                    field.sort = view.s >= 0 ? sorts[view.s] : null;
                    field.area = view.a >= 0 ? areas[view.a] : 'filter';
                    field.width = view.w;
                } else {
                    delete field.filter;
                    delete field.sort;
                    delete field.width;

                    field.area = 'filter';
                }
            });

            olap.on('redraw', function(){
                this._eg.reverse();
                ui.each(this._eg, this.expandNodeByPath, this);
                olap.view.updateSize();
                olap.dataScroll();
            }, this);

            this.fire('update', [data]);

            olap.filter.defer(1, olap);
        },

        /**
         * Открыть группу по идентификатору
         * @param {String} path идентификатор группы
         */
        expandNodeByPath: function(path){
            var olap = this.olap,
                groups = olap.rootColumns.concat(olap.rootRows),
                isFind = false,
                owner = null;

            ui.each(path.split('::'), function(item){
                var p = item.split(':'),
                    key = p[0],
                    val = p[1];

                ui.each(owner ? owner.groups : groups, function(gr){
                    if(gr.field.code == key && gr.title == val){
                        isFind = true;
                        owner = gr;
                        return false;
                    }
                });

                if(!owner) {
                    isFind = false;
                    return false;
                }
            });

            if(isFind) {
                if(!owner.parentGroup){
                    owner.expand(true, true);
                } else {
                    var evt = owner.parentGroup.on('silent_expand', function(expand){
                         if(expand){
                             owner.parentGroup.un('silent_expand', evt);
                             owner.expand(true, true);
                         }
                    });
                }
            }
        },

        /**
         * Получить данные текущего представления
         * @returns {Object} Данные текущего представления
         */
        getLayout: function(){
            var olap = this.olap,
                data = { f: [], e: this._eg };

            olap.fields.each(function(field){
                var fieldView = {
                    c: field.dataIndex,
                    a: this.areas.contains(field.area)
                };

                if(field.width)
                    fieldView.w = field.width;

                if(field.sort)
                    fieldView.s = this.sorts.contains(field.sort.toUpperCase());

                if(field.filter && field.filter.length)
                    fieldView.f = field.filter;


                data.f.push(fieldView);
            }, this);

            this.fire('get', data);

            return data;
        },

        /**
         * Сбросить текущее представление
         */
        clear: function(){
            var olap = this.olap;

            this._eg = [];

            olap.fields = [];
            olap.defaultFields.each(function(f){ olap.fields.push(ui.clone(f))});

            this.fire('clear');

            olap.filter();
        },

        /**
         * Восстановить представление по умолчанию
         */
        restore: function(){
            var layout = this.olap.defaultLayout;

            if(layout){
                this.setLayout(layout);
            } else {
                this.clear();
            }
        },

        setLayout: function(layout){
            if(ui.isString(layout)){
                var layouts = this.getLayouts();
                layout = layouts[layout];
            }

            if(layout){
                this.update(layout);
                return true;
            }

            return false;
        },

        removeLayout: function(name){
            var layouts = this.getLayouts(),
                key = this.getKey();

            delete layouts[name];

            localStorage.setItem(key, JSON.stringify(layouts));
        },

        getKey: function(){
            return 'olap.' + this.olap.stateId + '.layouts';
        },

        save: function(name){
            var key = 'olap.' + this.olap.stateId + '.layouts',
                value = this.getLayout(),
                layouts = this.getLayouts();

            layouts[name] = value;

            localStorage.setItem(key, JSON.stringify(layouts));
        },

        getLayouts: function(){
            var val = localStorage.getItem('olap.' + this.olap.stateId + '.layouts');

            return val ? JSON.parse(val) : {};
        },

        /** @private */
        onGroupExpand: function(group, expand){
            if(group.summary || group.mainColumnSummary) return;

            var path = group.getPath();

            if(!this._eg) this._eg = [];

            if(expand){
                if(this._eg.contains(path)===false) this._eg.push(path);
            } else{
                this._eg.remove(path);
            }

            this._eg.sort();
        }
    }
});