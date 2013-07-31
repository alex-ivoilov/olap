/**
 * Класс представления меню поля OLAP куба
 * @class ui.olap.FieldMenuView
 * @extends ui.ControlView
 */
ui.define({
    name: 'ui.olap.FieldMenuView',
    type: 'olapfieldmenu_view',
    base: 'view',
    data: {
        /**
         * Описание разметки меню
         * @returns {Array} Описание разметки
         */
        viewConfig: function(){
            return [
                {
                    name: 'tbar',
                    items: [
                        { name: 'select-all', extraCls: 'ui-btn', html: '<span class="icon"></span>' },
                        { name: 'unselect-all', extraCls: 'ui-btn', html: '<span class="icon"></span>' },
                        { name: 'reverse', extraCls: 'ui-btn', html: '<span class="icon icon-reverse"></span>' },
                        { name: 'asc', extraCls: 'ui-btn', html: '<span class="icon icon-asc"></span>' },
                        { name: 'desc', extraCls: 'ui-btn', html: '<span class="icon icon-desc"></span>' }
                    ]
                },
                {
                    name: 'body',
                    items: [
                        'groups'
                    ]
                },
                {
                    name: 'bbar',
                    items: [
                        { name: 'yes', extraCls: 'ui-btn',   html: '<span class="text">Принять</span>' },
                        { name: 'no', extraCls: 'ui-btn',    html: '<span class="text">Отмена</span>' }
                    ]
                }
            ]
        },

        /**
         * Получить тело меню
         * @returns {ui.Element} Тело меню
         */
        getBody: function(){
            return this.getBox('body');
        }
    }
});