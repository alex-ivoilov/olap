/**
 * @class ui.olap.exporters.XLSX
 * @extends ui.olap.exporters.Base
 *
 * ##XLSX экспортер OLAP куба
 * экспортирует текущее представление OLAP куба в XLSX файл
 *
 *      var exporter = new ui.olap.exporters.XLSX({ olap: olap });
 *      exporter.exportOlap();
 */
ui.define({
    name: 'ui.olap.exporters.XLSX',
    type: 'ui.olap.exporters.XLSX',
    base: 'ui.olap.exporters.Base',
    data: {
        /**
         * @cfg {Object}
         * Стиль рамок ячеек
         */
        borders: {
            bottom: '000000',
            right: '000000',
            left: '000000',
            top: '000000'
        },

        /**
         * @cfg {String}
         * Пустой заголовок
         */
        emptyTitle: 'Пусто',

        /**
         * Экспорт OLAP куба в XLSX файл
         */
        exportOlap: function(){
            this._data = [[]];
            this._rd = [];

            this.base(function(me, olap){
                window.location.href = me.getWorkBook().href();
            });
        },

        /**
         * Экспорт полей измерения строк
         * @param {Object} field Описание поля
         * @param {Object} size Описание размера поля
         */
        exportRowHeader: function(field, size){
            this._data[0].push({
                value: field.header,
                colSpan: size.cols,
                rowSpan: size.rows,
                width: size.width,
                borders: this.borders,
                vAlign: 'center',
                hAlign: 'center',
                fontSize: 8,
                wrapText: true,
                bgColor: 'D3D3D3'
            });
        },

        /**
         * Экспорт полей измерения столбцов
         * @param {Object} col Описание столбца
         * @param {Object} size Описание размера столбца
         */
        exportColumn: function(col, size){
            var i = this.olap.colGroups.length - col.level,
                c = this._data[i];

            if(!c) {
                this._data[i] = c = [];
            }

            c.push({
                value: this._getTitle(col.title),
                colSpan: size.cols,
                rowSpan: size.rows,
                borders: this.borders,
                vAlign: 'center',
                hAlign: 'center',
                fontSize: 8,
                wrapText: true,
                bold: col.field ? col.field.summary : false,
                bgColor: 'D3D3D3'
            });

            this.base(col, size);
        },

        /**
         * Экспорт строки OLAP куба
         * @param {Object} row Описание строки
         * @param {Object} size Описание размера строки
         * @param {Object} index Индекс строки
         */
        exportRow: function(row, size, index){
            var r = this._rd[this._rd.length - 1];

            if(index > 0 || !r){
                r = [];
                this._rd.push(r);
            }

            r.push({
                value: this._getTitle(row.title),
                colSpan: size.cols,
                vAlign: 'top',
                hAlign: 'left',
                rowSpan: size.rows,
                borders: this.borders,
                bgColor: 'FAFAFA',
                bold: row.field ? row.field.summary : false,
                fontSize: 8,
                wrapText: true
            });
        },

        /**
         * Экспорт ячейки данных
         * @param {Object} cell Описание ячейки
         * @param {Object} size Описание размера ячейки
         * @param {Boolean} last Последняя ячейка
         */
        exportCell: function(cell, size, last){
            var r = this._rd[this._rd.length - 1];

            r.push({
                value: cell.renderValue || cell.value,
                bold: cell.summary,
                formatCode: cell.formatCode || '0.00',
                bgColor: cell.summary ? 'FAFAFA' : null,
                width: size.width,
                borders: this.borders,
                fontSize: 8,
                number: true
            });
        },

        /**
         * Получить документ XLSX
         * @returns {xlsx} Экземляр XLSX
         */
        getWorkBook: function(){
            for(var i=this.olap.colGroups.length-this.expandedCols;i>1;i--) this._data.push([]);

            return xlsx({
                creator: 'John Doe',
                lastModifiedBy: 'Meg White',
                worksheets: [
                    {
                        name: 'sheet 1',
                        data: this._data.concat(this._rd)
                    }
                ]
            });
        },

        /** @private */
        _getTitle: function(title){
            return title ? title.replace(/<(?:.|\n)*?>/gm, '') : this.emptyTitle;
        }
    }
});
