/**
 * Класс выподающего списка условия редактора условного форматирования OLAP куба
 *
 * @class ui.olap.plugins.StyleConditions.Combo
 * @extends ui.form.ComboBox
 */
ui.define({
    name: 'ui.olap.plugins.StyleConditions.Combo',
    type: 'olap.styleConditions.combo',
    base: 'combo',
    data: {
        /**
         * @cfg {String}
         * Идентификатор значения
         */
        dataIndex: 'code',

        /**
         * @cfg {String}
         * Идентификатор отображаемого значения
         */
        displayName: 'name',

        /**
         * @cfg {Array}
         * Список записей выподающего списка
         */
        data: [
            {
                name: 'Равно',
                view: '=',
                code: 0,
                test: function(val, val1, val2){
                    return val == val1;
                }
            },
            {
                name: 'Не равно',
                view: '!=',
                code: 1,
                test: function(val, val1, val2){
                    return val != val1;
                }
            },
            {
                name: 'Больше',
                view: '&gt;',
                code: 2,
                test: function(val, val1, val2){
                    return val > val1;
                }
            },
            {
                name: 'Больше или равно',
                view: '&gt;=',
                code: 3,
                test: function(val, val1, val2){
                    return val >= val1;
                }
            },
            {
                name: 'Интервал',
                view: '&lt;&gt;',
                code: 4,
                interval: true,
                test: function(val, val1, val2){
                    return val > val1 && val < val2;
                }
            }
        ]
    }
});