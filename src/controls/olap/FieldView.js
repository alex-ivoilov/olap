/**
 * Класс представления поля OLAP куба
 * @class ui.olap.FieldView
 * @extends ui.ControlView
 */
ui.define({
    name: 'ui.olap.FieldView',
    type: 'olapField_view',
    base: 'view',
    data: {
        /**
         * Описание разметки поля
         * @returns {Array} Описание разметки
         */
        viewConfig: function(){
            return [
                {
                    name: 'title',
                    items: [
                        {
                            name: 'body',
                            items: [
                                'text',
                                'tools',
                                'drag-zone'
                            ]
                        }
                    ]
                },
                'drop'
            ]
        },

        /**
         * Получить элемент отвечающий за перетаскивание поля
         * @returns {ui.Element} Элемент отвечающий за перетаскивание поля
         */
        getDragZone: function(){
            return this.getBox('title.body.drag-zone');
        },

        /**
         * Получить тело поля
         * @returns {ui.Element} Тело поля
         */
        getBody: function(){
            return this.control;
        }
    }
});