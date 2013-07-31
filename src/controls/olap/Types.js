ui.olap.Types = {
    /** @private */
    _floatSum: function(val, rec, dataIndex){
        var v = parseFloat(rec[dataIndex]);

        if(!isNaN(v)){
            val.value += v;
        }
    },

    /** @private */
    _getFormatCode: function(field){
        return (field.typeConfig && field.typeConfig.formatCode) || ui.olap.Types[field.type].formatCode;
    },

    /**
     * Источник поля OLAP куба "Индикатор"
     *
     *      {
     *          header: 'Progress',
     *          dataIndex: 'code',
     *          area: 'data',
     *          type: 'progress',
     *          typeConfig: {
     *              valueType: 'decimal',
     *              tpl: '({value} / {all}) {percent} %',
     *              decimals: 2,
     *              formatCode: '0.00 \\%'
     *          }
     *      }
     *
     * @class ui.olap.Types.progress
     * @singleton
     */
    progress: {
        /**
         * @cfg tpl
         * Шаблон отображения индикатора
         */
        tpl: '{percent} %',

        /**
         * @cfg decimals
         * Количество знаков после запятой
         */
        decimals: 2,

        /**
         * @cfg formatCode
         * Формат значения для экспорта в Excel
         */
        formatCode: '0.00 \\%',

        /**
         * Создание HTML разметки ячейки OLAP куба
         * @param {Object} val Описание значения
         * @param {Object} type Описание типа ячейки
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         * @returns {String} HTML разметка ячейки
         */
        renderer: function(val, type, field, olap, x, y){
            var v = olap.getCellValue(x, y),
                all = olap.getCellValue(x, olap.rootRows[olap.rootRows.length-1].index),
                percent = v.renderValue || 0,
                value = ((field.typeConfig && field.typeConfig.tpl) || type.tpl)
                    .replace('{value}', val)
                    .replace('{all}', all.value)
                    .replace('{percent}', percent.toFixed((field.typeConfig && field.typeConfig.decimals) || type.decimals));

            return [
                '<div style="width:',percent,'%;" class="ui-olap-percent-cell"></div>',
                '<div class="ui-olap-percent-cell-value">',value,'</div>'
            ].join('');
        },

        /**
         * Форматирование значения ячейки
         * @param {Object} val Описание значения
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        format: function(val, dataIndex, field, olap, x, y){
            var allIndex = olap.rootRows[olap.rootRows.length-1].index;

            if(y != allIndex){
                var all = olap.getCellValue(x, allIndex);
                val.renderValue =  val.value / (all.value / 100);
            } else {
                val.renderValue = 100;
            }

            val.formatCode = ui.olap.Types._getFormatCode(field);
        },

        /**
         * Расчет значения ячейки
         * @param {Object} val Описание значения
         * @param {Object} rec Запись данных из источника
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        summary: function(val, rec, dataIndex, field, olap, x, y){
            ui.olap.Types[field.valueType].summary(val, rec, field.typeConfig.dataIndex, field);
        }
    },

    /**
     * Источник поля OLAP куба "Целочисленный"
     *
     *      {
     *          header: 'Integer',
     *          dataIndex: 'code',
     *          area: 'data',
     *          type: 'int'
     *      }
     *
     * @class ui.olap.Types.int
     * @singleton
     */
    int : {
        /**
         * @cfg formatCode
         * Формат значения для экспорта в Excel
         */
        formatCode: '0',

        /**
         * Создание HTML разметки ячейки OLAP куба
         * @param {Object} val Описание значения
         * @param {Object} type Описание типа ячейки
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         * @returns {String} HTML разметка ячейки
         */
        renderer: function(val, type, field, olap, x, y){
            val = parseInt(val);

            if(isNaN(val)) return 0;

            return val;
        },

        /**
         * Форматирование значения ячейки
         * @param {Object} val Описание значения
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        format: function(val, dataIndex, field, olap, x, y){
            val.formatCode = ui.olap.Types._getFormatCode(field);
        },

        /**
         * Расчет значения ячейки
         * @param {Object} val Описание значения
         * @param {Object} rec Запись данных из источника
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        summary: function(val, rec, dataIndex, field, olap, x, y){
            ui.olap.Types._floatSum(val, rec, dataIndex);
        }
    },

    /**
     * Источник поля OLAP куба "Колчиство записей"
     *
     *      {
     *          header: 'Integer',
     *          dataIndex: 'code',
     *          area: 'data',
     *          type: 'count'
     *      }
     *
     * @class ui.olap.Types.count
     * @singleton
     */
    count : {
        /**
         * @cfg formatCode
         * Формат значения для экспорта в Excel
         */
        formatCode: '0',

        /**
         * Создание HTML разметки ячейки OLAP куба
         * @param {Object} val Описание значения
         * @param {Object} type Описание типа ячейки
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         * @returns {String} HTML разметка ячейки
         */
        renderer: function(val, type, field, olap, x, y){
            return val;
        },

        /**
         * Форматирование значения ячейки
         * @param {Object} val Описание значения
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        format: function(val, dataIndex, field, olap, x, y){
            val.formatCode = ui.olap.Types._getFormatCode(field);
        },

        /**
         * Расчет значения ячейки
         * @param {Object} val Описание значения
         * @param {Object} rec Запись данных из источника
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        summary: function(val, rec, dataIndex, field, olap, x, y){
            val.value++;
        }
    },

    /**
     * Источник поля OLAP куба "Дробное число"
     *
     *      {
     *          header: 'Decimal',
     *          dataIndex: 'code',
     *          area: 'data',
     *          type: 'decimal',
     *          typeConfig: {
     *              decimals: 2,
     *              separator: '.',
     *              formatCode: '0.00'
     *          }
     *      }
     *
     * @class ui.olap.Types.decimal
     * @singleton
     */
    decimal: {
        /**
         * @cfg separator
         * Разделитель дроби
         */
        separator: ',',

        /**
         * @cfg decimals
         * Количество знаков после запятой
         */
        decimals: 1,

        /**
         * @cfg formatCode
         * Формат значения для экспорта в Excel
         */
        formatCode: '0.0',

        /**
         * Создание HTML разметки ячейки OLAP куба
         * @param {Object} val Описание значения
         * @param {Object} type Описание типа ячейки
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         * @returns {String} HTML разметка ячейки
         */
        renderer: function(val, type, field, olap, x, y){
            var decimals = field.typeConfig ? field.typeConfig.decimals || type.decimals : type.decimals,
                separator = field.typeConfig ? field.typeConfig.separator || type.separator : type.separator;

            val = parseFloat(val);

            if(isNaN(val)) val = 0;

            return val.toFixed(decimals).replace(/(\d)(?=(\d{3})+\.)/g, "$1 ").replace('.', separator);
        },

        /**
         * Форматирование значения ячейки
         * @param {Object} val Описание значения
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        format: function(val, dataIndex, field, olap, x, y){
            val.formatCode = ui.olap.Types._getFormatCode(field);
        },

        /**
         * Расчет значения ячейки
         * @param {Object} val Описание значения
         * @param {Object} rec Запись данных из источника
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        summary: function(val, rec, dataIndex, field, olap, x, y){
            ui.olap.Types._floatSum(val, rec, dataIndex);
        }
    },

    /**
     * Источник поля OLAP куба "Финансовый"
     *
     *      {
     *          header: 'Money',
     *          dataIndex: 'code',
     *          area: 'data',
     *          type: 'money',
     *          typeConfig: {
     *              decimals: 2,
     *              separator: '.',
     *              suffix: 'руб'
     *          }
     *      }
     *
     * @class ui.olap.Types.money
     * @singleton
     */
    money: {
        /**
         * @cfg separator
         * Разделитель дроби
         */
        separator: ',',

        /**
         * @cfg decimals
         * Количество знаков после запятой
         */
        decimals: 1,

        /**
         * @cfg suffix
         * Приставка валюты
         */
        suffix: '',

        /**
         * @cfg formatCode
         * Формат значения для экспорта в Excel
         */
        formatCode: '#,##0.0',

        /**
         * Создание HTML разметки ячейки OLAP куба
         * @param {Object} val Описание значения
         * @param {Object} type Описание типа ячейки
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         * @returns {String} HTML разметка ячейки
         */
        renderer: function(val, type, field, olap, x, y){
            val = ui.olap.Types.decimal.renderer(val, type, field);

            return val + ' ' + type.suffix;
        },

        /**
         * Форматирование значения ячейки
         * @param {Object} val Описание значения
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        format: function(val, dataIndex, field, olap, x, y){
            val.formatCode = ui.olap.Types._getFormatCode(field);
        },

        /**
         * Расчет значения ячейки
         * @param {Object} val Описание значения
         * @param {Object} rec Запись данных из источника
         * @param {String} dataIndex Код поля источника OLAP куба
         * @param {Object} field Описание поля OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        summary: function(val, rec, dataIndex, field, olap, x, y){
            ui.olap.Types._floatSum(val, rec, dataIndex);
        }
    }
};