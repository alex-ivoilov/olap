/**
 * Класс представления группы OLAP куба
 * @class ui.olap.GroupView
 * @extends ui.ControlView
 */
ui.define({
    name: 'ui.olap.GroupView',
    type: 'olapGroupView',
    base: 'view',
    data: {
        /**
         * Описание разметки группы
         * @returns {Array} Описание разметки
         */
        viewConfig: function(){
            return [
                {
                    name: 'title',
                    items: [
                        {
                            tag: 'span',
                            name: 'span'
                        },
                        'expand',
                        {
                            name: 'resize',
                            listeners: {
                                scope: this.control,
                                drop: this.control.onResizeEnd,
                                drag: this.control.onResize
                            }
                        }
                    ]
                }
            ]
        },

        /**
         * Получить тело группы
         * @returns {ui.Element} Тело группы
         */
        getBody: function(){
            return this.control;
        }
    }
});