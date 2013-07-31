/**
 * @class ui.olap.exporters.Base
 * @extends ui.Base
 *
 * Базовый экспортер OLAP куба
 */
ui.define({
    name: 'ui.olap.exporters.Base',
    type: 'ui.olap.exporters.Base',
    base: 'base',
    data: {
        /**
         * Экспорт OLAP куба
         * @param {Function} callback Обработчик получения данных
         */
        exportOlap: function(callback){
            var me = this,
                olap = me.olap,
                rows = olap.colGroups.length,
                c = olap._cols.map(function(item, i){ return i; }),
                r = olap._rows.map(function(item, i){ return i; });

            olap.store.listData(c, r, null, function(){

                if(olap.dataFields.length > 1){
                    rows++;
                }

                me.expandedCols = 0;
                olap.fields.find({area:'rows'}, function(f){ this.exportRowHeader(f, { rows: rows, cols: 1, width: f.width || olap.columnWidth }); }, me);
                ui.each(olap.rootColumns, function(col){ this._exportColumn(col, this._columnSize(col), 0); }, me);
                ui.each(olap.rootRows, function(row, i){ this._exportRow(row, this._rowSize(row), i); }, me);

                if(olap.dataFields.length > 1){
                    me.expandedCols++;
                }

                if(callback) callback(me, olap);
            });
        },

        /**
         * Экспорт полей измерения строк
         * @param {Object} field Описание поля
         * @param {Object} size Описание размера поля
         */
        exportRowHeader: function(field, size){},

        /**
         * Экспорт полей измерения столбцов
         * @param {Object} col Описание столбца
         * @param {Object} size Описание размера столбца
         */
        exportColumn: function(col, size){},

        /**
         * Экспорт строки OLAP куба
         * @param {Object} row Описание строки
         * @param {Object} size Описание размера строки
         * @param {Object} index Индекс строки
         */
        exportRow: function(row, size, index){},

        /**
         * Экспорт ячейки данных
         * @param {Object} cell Описание ячейки
         * @param {Object} size Описание размера ячейки
         * @param {Boolean} last Последняя ячейка
         */
        exportCell: function(cell, size, last){},

        /** @private */
        _exportColumn: function(col, size, start){
            var olap = this.olap;

            if((
                olap.hideSummary && !col.isSummary())
                || !olap.hideSummary
                || col.mainColumnSummary
                ){

                if(olap.colsFields.length){
                    this.exportColumn(col, size);

                    if(col.expanded && col.groups.length){
                        start++;

                        ui.each(col.groups, function(c){
                            this._exportColumn(c, this._columnSize(c), start);
                        }, this);

                        if(start > this.expandedCols) {
                            this.expandedCols = start;
                        }

                    } else if(col.hasSources() && !col.source){
                        ui.each(col.sources, function(c){
                            c.level = 0;
                            this._exportColumn(c, this._columnSize(c), 0);
                        }, this);
                    }
                } else {
                    ui.each(col.sources, function(c){
                        c.level = 0;
                        this.exportColumn(c, this._columnSize(c));
                    }, this);
                }
            }
        },

        /** @private */
        _exportRow: function(row, size, idx){
            var olap = this.olap;

            if((
                olap.hideSummary && !row.isSummary())
                || !olap.hideSummary
                || row.mainRowSummary
                ){

                if((row.summary || row.field.sum) && !row.parentGroup.expanded) return;

                this.exportRow(row, size, idx);

                if(row.expanded && row.groups.length){
                    ui.each(row.groups, function(r, index){ this._exportRow(r, this._rowSize(r), index); }, this);
                } else {
                    for(var i = 0, ln=olap.columnsCount;i<ln;i++){
                        if(!olap.isIgnoredX(i)){
                            this.exportCell(
                                olap.getCellValue(i, row.sumGroup ? row.sumGroup.index : row.index),
                                { width: olap.getColumn(i).columnWidth || olap.columnWidth },
                                i == ln-1);
                        }
                    }
                }
            }
        },

        /** @private */
        _columnSize: function(col){
            var olap = this.olap,
                cols = 1,
                rows = 1,
                width;

            if(olap.hideSummary && col.isSummary()){
                cols = 0;
            }

            if(col.expanded && col.groups.length && !col.field.summary){
                cols = 0;

                ui.each(col.groups, function(g){
                    cols += this._columnSize(g).cols;
                }, this);
            } else {
                rows = col.level;

                if(col.hasSources() && !col.source){
                    cols = col.sources.length;
                }
            }

            if(!col.groups.length){
                width = this.olap.getColumn(col.index).columnWidth || this.olap.columnWidth;
            }

            if(!col.expanded && col.sumGroup){
                width = this.olap.getColumn(col.sumGroup.index).columnWidth || this.olap.columnWidth;
            }

            return {
                rows: rows,
                width: width,
                cols: cols
            };
        },

        /** @private */
        _rowSize: function(row){
            var cols = 1,
                rows = 0,
                me = this;

            if(!row.expanded || row.summary) {
                cols = row.level;
            }

            return {
                rows: row.getRowsCount(),
                cols: cols || 1
            };
        }
    }
});