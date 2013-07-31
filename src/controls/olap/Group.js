/**
 * @class ui.olap.Group
 * @extends ui.Control
 * @requires ui.olap.GroupView
 *
 * Базовый класс группы OLAP куба
 */
ui.define({
    name: 'ui.olap.Group',
    type: 'olapGroup',
    base: 'control',
    data: {
        /**
         * @property {ui.olap.Olap}
         * OLAP куб
         */
        olap: null,

        viewType: 'olapGroupView',
        cls: 'group',

        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации
         */
        init: function(config){
            this.groups = [];
            this.expanded = true;
            this.base(config);
            this.on('expand', function(expand){ this.olap.layout.onGroupExpand(this, expand); }, this);
        },

        /**
         * Отрисовка группы
         */
        render: function(){
            this.base();

            if(this.olap.selection){
                /*this.view.getBox('title').on('mouseenter', function(){
                    this.select(true);
                }, this);
                this.view.getBox('title').on('mouseleave', function(){
                    this.olap.selection.updateSelection(null, null, true);
                }, this);*/
                this.view.getBox('title.span').on('click', function(el, e){
                    var type;

                    if(e.ctrlKey) type = 'merge';
                    if(e.shiftKey) type = 'range';

                    this.select(false, type);
                }, this);
            }

            this.view.getBox('title.span').setHtml(this.title || 'Пусто');
            this.view.getBox('title.expand').on('click', this.toggle, this);

            if(this.field){
                this.dataField = this.olap.fields.findOne({ dataIndex: this.field.code || this.field.dataIndex });

                if(this.field.summary) this.single();
            }
        },

        /**
         * Получить строковое представление группы
         * @returns {String} Строковое представление
         */
        getPath: function(){
            var st = this,
                path = [];

            while(st){
                path.push(st.field.code + ':' + st.title);
                st = st.parentGroup;
            }

            path.reverse();

            return path.join('::');
        },

        /**
         * Получить полное имя группы
         * @param {String} split разделитель
         * @returns {String} Полное имя группы
         */
        getFullName: function(split){
            var st = this,
                path = [];

            while(st){
                path.push(st.getName());
                st = st.parentGroup;
            }

            path.reverse();

            return path.join(split || ' ');
        },

        /**
         * Получить имя группы
         * @returns {String} Имя группы
         */
        getName: function(){
            var title = this.title;

            if(this.isSummary()){
                title = this.parentGroup ? this.parentGroup.title : null;
            }

            title = title || 'Пусто';

            return title.replace(/<\/?[^>]+(>|$)/g, "");
        },

        /**
         * Получить последнюю группу
         */
        lastGroup: function(){
            var group = this.sumGroup ? this.sumGroup : this.groups[this.groups.length - 1];

            if(this.expanded && this.olap.hideSummary){
                group = this.groups[this.groups.length - 2];
            }

            return group || this.groups[this.groups.length - 1];
        },

        /**
         * Пометить группу как одиночная
         */
        single: function(){
            this.view.removeBox('title.expand');
            this.addClass('single');
        },

        /**
         * Свернуть/Развернуть группу
         */
        toggle: function(){
            this.expand(!this.expanded);
        },

        /**
         * Проверить является ли группа итогом
         * @returns {Boolean} Итоговая группа
         */
        isSummary: function(){
            return this.summary || (this.field && this.field.summary);
        },

        /**
         * Проверить возможно ли раскрытие группы
         * @returns {Boolean} Можно развернуть
         */
        isExpandable: function(){
            var p = this.parentGroup;

            if(!p) return true;
            if(p.expanded === false) return false;

            while(p = p.parentGroup){
                 if(p.expanded === false) return false;
            }

            return true;
        },

        /**
         * Предварительное раскрытие группы
         * @protected
         * @returns {Boolean} Возможно продолжение раскрытия группы
         */
        expandGroup: function(expand){
            this.doRender();

            if(this.updateSources) {
                this.updateSources(expand);
            }

            if(this.olap.store.onGroupExpand(this, expand) === false){
                return false;
            }

           if(expand && !this.isExpandable())
               return false;

            var sum = this.sumGroup;

            expand ? this.addClass('expanded')
                   : this.removeClass('expanded');

            this.expanded = expand;

            this.groups.each(function(g){
                if(expand && (!g.olap.hideSummary || (g.olap.hideSummary && g.isSummary() !== true))){
                    if(!g.rendered) {
                        g.expand(false, true);
                    }
                    g.show();
                } else if(g.rendered) {
                    g.hide();
                }
            });

            if(sum && this.olap.hideSummary !== true) expand
                ? sum.el.show()
                : sum.el.hide();

            return true;
        },

        /**
         * Получить количество строк группы
         * @returns {Number} Количество строк
         */
        getRowsCount: function(){
            var group = this,
                sum = group.sumGroup,
                getRows = this.olap.hideSummary ?
                    function(gr, i){
                        ui.each(gr.groups, function(g){
                            if(!g.isSummary()){
                                if(g.expanded == true){
                                    if(g.groups.length){
                                        i = getRows(g, i);
                                    } else {
                                        i++;
                                    }
                                } else {
                                    i++;
                                }
                            }
                        });

                        return i;
                    } :
                    function(gr, i){
                        ui.each(gr.groups, function(g){
                            if(g.expanded == true){
                                if(g.groups.length){
                                    i = getRows(g, i);
                                } else {
                                    i++;
                                }
                            } else if(!g.sumGroup || (gr.sumGroup && gr.sumGroup.field.sum)){
                                i++;
                            }

                            if(g.field.sum && g === sum){
                                i--;
                            }
                        });

                        return i;
                    };

            return group.expanded ? (getRows(group, 0) || 1) : 1;
        },

        /**
         * Показать группу
         */
        show: function(){
            if(this.sumGroup && this.olap.hideSummary !== true) {
                this.sumGroup.show();
            }

            if(this.parentGroup){
                if(this.parentGroup.expanded) this.base();
            } else {
                this.base();
            }
        },

        /**
         * Скрыть группу
         */
        hide: function(){
            if(this.sumGroup) {
                this.sumGroup.hide();
            }

            this.base();
        },

        /** @private */
        onResize: function(e){
        },

        /** @private */
        onResizeEnd: function(e){
        }
    }
});