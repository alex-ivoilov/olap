/**
 * Базовый класс менеджера данных OLAP куба
 * @class ui.olap.store.Base
 * @extends ui.Base
 */
ui.define({
    name: 'ui.olap.store.Base',
    type: 'ui.olap.store.Base',
    base: 'base',
    data: {
        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации
         */
        init: function(config){
            config = config || {};

            this._groups = {};
            this.base(config);
        },

        /**
         * Получить данные столбцов
         * @param {Array} groups Список групп
         * @param {Function} callback Метод обработки результата
         */
        getColumnsData: function(groups, callback){
        },

        /**
         * Получить данные строк
         * @param {Array} groups Список групп
         * @param {Function} callback Метод обработки результата
         */
        getRowsData: function(groups, callback){
        },

        /**
         * Получить словарь фильтров
         * @returns {Object} Набор фильтров
         */
        getFilters: function(){
            var query = {},
                has = false;

            this.olap.fields.each(function(f){
                if(f.filter && f.filter.length){
                    query[f.dataIndex] = f.filter;
                    has = true;
                }
            });

            return has ? query : null;
        },

        /**
         * Сортировать данные
         * @param {Array} sorters Список сортировок
         */
        sort: function(sorters){
            this.olap.redraw();
        },

        /**
         * Получить список групп по полю
         * @param {String} dataIndex Код поля
         * @param {Function} callback Метод обработки результата
         */
        getGroups: function(dataIndex, callback){
            var groups = this._groups;

            if(!groups[dataIndex]){
                this._getGroups(dataIndex, function(data){
                    groups[dataIndex] = data;
                    callback && callback(data);
                });
            } else {
                callback && callback(groups[dataIndex]);
            }
        },

        /**
         * Прорисовка данных
         * @param {Number[]} cols Список индексов столбцов
         * @param {Number[]} rows Список индексов строк
         * @param {ui.Element} el Элемент ячейки
         * @param {Function} [callback] Метод обработки результата
         */
        listData: function(cols, rows, el, callback){
            var olap = this.olap;

            if(el){
                ui.each(rows, function(row){
                    ui.each(cols, function(col){
                        olap.renderCell(col, row, el);
                    });
                });
            }

            if(callback) callback();
        },

        /**
         * Загрузить источник данных
         * @param {Function} callback Метод обработки результата
         */
        loadDataSource: function(callback){
            callback();
        },

        /**
         * Фильтровать данные OLAP куба
         */
        filter: function(){
            this.fire('update', [this]);
            // TODO
        },

        //TODO move to olap
        onGroupExpand: function(group, expand){
            if(group.mainRowSummary) {
                return true;
            }

            if (group.field.summary || !group.groups.length) {
                group.single();
                return false;
            }

            return true;
        },

        /** @private */
        _getGroups: function(dataIndex, callback){
        }
    }
});