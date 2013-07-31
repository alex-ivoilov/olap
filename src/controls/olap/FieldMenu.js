/**
 * @class ui.olap.FieldMenu
 * @extends ui.Control
 * @requires ui.olap.FieldMenuView
 *
 * Меню поля OLAP куба
 */
ui.define({
    name: 'ui.olap.FieldMenu',
    type: 'olapfieldmenu',
    base: 'control',
    data: {
        cls: 'ui-fieldmenu',
        viewType: 'olapfieldmenu_view',

        /**
         * Отрисовка меню
         */
        render: function(){
            this.base();

            ui.EventsManager.on('mousedown', this.onDocumentClick, this);

            this.view.getBox('bbar.yes').on('click', this.apply, this);
            this.view.getBox('bbar.no').on('click', this.hide, this);
            this.view.getBox('tbar.select-all').on('click', this.selectAll, this);
            this.view.getBox('tbar.unselect-all').on('click', this.unSelectAll, this);
            this.view.getBox('tbar.asc').on('click', function(){ this.renderValues('ASC'); }, this);
            this.view.getBox('tbar.desc').on('click', function(){ this.renderValues('DESC'); }, this);
            this.view.getBox('tbar.reverse').on('click', function(){ this.reverseValues(); }, this);
        },

        /**
         * Показать меню
         */
        show: function(){
            this.renderValues(this.sort);
            //this.olap.find('.group-resize, .ui-data-resizer').hide();
            this.base();
        },

        /**
         * Инвертировать значения поля
         */
        reverseValues: function(){
           var checked = this.getFilter(),
               items = this.view.getBox('body.groups').find('.menu-value');

           items.removeClass('checked').each(function(){
               if(checked.contains($(this).html()) === false) $(this).addClass('checked');
           });
        },

        /**
         * Отрисовка значений поля
         * @param {String} [sort] Тип сортировки
         */
        renderValues: function(sort){
            var body = this.view.getBox('body.groups'),
                me = this,
                field = me.field;

            field.getGroups(function(data){
                var createValue = function(name){
                        return ui.instance({
                            type: 'element',
                            cls: 'menu-value',
                            parent: body,
                            html: name
                        });
                    },
                    oldFilter = me.getFilter(),
                    filter = field.field.filter,
                    checked = 'checked';

                body.empty();

                if(sort == 'ASC' || sort == 'DESC') data.sort();
                if(sort == 'DESC') data.reverse();

                data.each(function(name){
                    var value = createValue(name);

                    if(sort){
                        if(oldFilter.contains(name) !== false) value.addClass(checked);
                    } else if(filter && filter.contains(name) !== false){
                        value.addClass(checked);
                    }

                    value.on('click', function(){
                        value.hasClass(checked)
                            ? value.removeClass(checked)
                            : value.addClass(checked);
                    }, this);
                }, me);

            });
        },

        /**
         * Снять выделение со всех значений
         */
        unSelectAll: function(){
            this.view.getBox('body.groups').find('.menu-value').removeClass('checked');
        },

        /**
         * Выбрать все значения поля
         */
        selectAll: function(){
            this.view.getBox('body.groups').find('.menu-value').addClass('checked');
        },

        /**
         * Обновить фильтр
         * @param {Array} filter Список значений фильтра
         */
        updateFilter: function(filter){
            this.field.field.filter = filter;
            this.olap.filter();
        },

        /**
         * Очистить фильтр
         */
        clear: function(){
            this.hide();
            this.updateFilter(null);
        },

        /**
         * Получить фильтр
         * @returns {Array} Список значений фильтра
         */
        getFilter: function(){
            var filter = [];

            this.view.getBox('body.groups').find('.checked').each(function(){filter.push($(this).html())});

            return filter;
        },

        /**
         * Спрятать меню
         */
        hide:  function(){
            //this.olap.find('.group-resize, .ui-data-resizer').show();
            this.base();
        },

        /**
         * Применить фильтр
         */
        apply: function(){
            var filter = this.getFilter();

            this.hide();
            this.updateFilter(filter);
        },

        /**
         * Скрыть меню при клике вне меню
         * @private
         */
        onDocumentClick: function(e){
            var btn = this.field.view.getBox('title.body.tools');

            if(!this.hasDom(e.target) && btn.el.get(0) !== e.target){
                this.hide();
            }
        }
    }
});