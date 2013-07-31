/**
 * Класс менеджера данных OLAP куба
 * @class ui.olap.store.Array
 * @extends ui.olap.store.Base
 */
ui.define({
    name: 'ui.olap.store.Array',
    type: 'ui.olap.store.Array',
    base: 'ui.olap.store.Base',
    data: {
        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации
         */
        init: function(config){
            config = config || {};

            this.data = ui.array(config.data || []);

            delete config.data;

            this.base(config);
        },


        /**
         * Получить данные столбцов
         * @param {Array} groups Список групп
         * @param {Function} callback Метод обработки результата
         */
        getColumnsData: function(groups, callback){
            var data = groups.length > 0 ? this.groupBy(groups.slice(0)) : this.getRecords(),
                lvl = data.length ? this._getLevel(data[0]) : 1;

            callback(data, lvl);
        },

        /**
         * Получить данные строк
         * @param {Array} groups Список групп
         * @param {Function} callback Метод обработки результата
         */
        getRowsData: function(groups, callback){
            var data = this.groupBy(groups.slice(0)),
                lvl = data.length ? this._getLevel(data[0]) : 1;

            callback(data, lvl);
        },

        /**
         * Получить список групп по полю
         * @param {Object/String} field Поле OLAP куба
         * @param {Function} callback Метод обработки результата
         */
        getGroups: function(field, callback){
            this.base(ui.isString(field) ? field : field.dataIndex, callback);
        },

        /**
         * Фильтровать данные OLAP куба
         */
        filter: function(query){
            this.fire('beforeFilter', [this]);
            this.records = ui.array(this.data.find(query));
            this.fire('afterFilter', [this]);
            this.fire('update', [this, this.records]);

            return this.records;
        },

        /**
         * Сортировать данные
         * @param {Array} sorters Список сортировок
         */
        sort: function(sorters){
            this.sorters = sorters;

            this.fire('update', [this, this.records]);
        },

        /**
         * Искать записи
         * @param {Object/Function} query Параметры поиска
         * @returns {Array} Список записей
         */
        find: function(query){
            return this.records.find(query);
        },

        /**
         * Сгруппировать данные
         * @param {Array/String} name Список групп
         * @returns {Object} Дерево сгруппированных данных
         */
        groupBy: function(name){
            return this.records.groupBy(name, this.sorters);
        },

        /**
         * Получить список записей
         * @returns {Array} Список записей
         */
        getRecords: function(){
            return this.records.list;
        },

        /** @private */
        _getLevel: function(data){
            var level = 1;

            while(data.items && data.items[0]){
                level++;
                data = data.items[0];
            }

            return level;
        },

        /** @private */
        _getGroups: function(field, callback){
            callback(this.data.getGroups(field));
        }
    }
});