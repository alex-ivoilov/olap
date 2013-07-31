/**
 * @class ui.olap.exporters.HTML
 * @extends ui.olap.exporters.Base
 *
 * ##HTML экспортер OLAP куба
 * экспортирует текущее представление OLAP куба в HTML документ
 *
 *      var exporter = new ui.olap.exporters.HTML({ olap: olap });
 *      exporter.exportOlap();
 */
ui.define({
    name: 'ui.olap.exporters.HTML',
    type: 'ui.olap.exporters.HTML',
    base: 'ui.olap.exporters.Base',
    data: {
        /**
         * @cfg {String}
         * Стиль ячейки
         */
        tdStyle: 'border-right:1px solid #000;border-bottom: 1px solid #000;',

        /**
         * Экспорт OLAP куба в HTML документ
         */
        exportOlap: function(){
            var sb = [];

            this._rc = [];
            this._hc = [[]];

            this.base(function(me, olap){
                sb.push('<table style="table-layout:fixed;font-family:Tahoma,tahoma;font-size: 10px;border-collapse: collapse;border-left:1px solid #000;border-top:1px solid #000;">');
                ui.each(me._hc, function(hc){ sb.push('<tr>'+(hc ? hc.join('') : '')+'</tr>'); });
                for(var i=me.olap.colGroups.length-me.expandedCols;i>1;i--) sb.push('<tr style="height:10px;"></tr>');
                sb.push(me._rc.join(''));
                sb.push('</table>');


                var wnd = window.open();
                wnd.document.body.innerHTML = sb.join('');
            });
        },

        /**
         * Получить разметку ячейки
         * @param {String} html Содержание ячейки
         * @param {Object} size Описание размера
         * @param {String} style Стиль ячейки
         * @returns {String} Разметка ячейки
         */
        writeTD: function(html, size, style){
            var sb = [];
            size = size || {};

            sb.push('<td style="');
            sb.push(this.tdStyle);
            sb.push(style || 'font-weight: normal;background-color:#e3e4e6;');
            sb.push('" ');

            if(size.cols > 1) sb.push('colspan="'+ size.cols +'" ');
            if(size.rows > 1) sb.push('rowspan="'+ size.rows +'" ');

            sb.push('>');

            sb.push('<div style="padding:3px 6px;overflow:hidden;');
            if(size.width) {
                sb.push('width:');
                sb.push(size.width-12);
                sb.push('px;');
            }
            sb.push('">');
            sb.push(html || 'Пусто');
            sb.push('</div>');
            sb.push('</td>');

            return sb.join('');
        },

        /**
         * Экспорт полей измерения строк
         * @param {Object} field Описание поля
         * @param {Object} size Описание размера поля
         */
        exportRowHeader: function(field, size){
            this._hc[0].push(this.writeTD(field.header, size));
        },

        /**
         * Экспорт полей измерения столбцов
         * @param {Object} col Описание столбца
         * @param {Object} size Описание размера столбца
         */
        exportColumn: function(col, size){
            var i = this.olap.colGroups.length - col.level,
                c = this._hc[i];

            if(!c) {
                this._hc[i] = c = [];
            }

            c.push(this.writeTD(col.title, size));

            this.base(col, size);
        },

        /**
         * Экспорт строки OLAP куба
         * @param {Object} row Описание строки
         * @param {Object} size Описание размера строки
         * @param {Object} index Индекс строки
         */
        exportRow: function(row, size, index){
            var css = 'text-align: left;vertical-align:top;background-color:#e3e4e6;';

            if(index > 0) this._rc.push('<tr>');

            this._rc.push(this.writeTD(row.title, size, css));
        },

        /**
         * Экспорт ячейки данных
         * @param {Object} cell Описание ячейки
         * @param {Object} size Описание размера ячейки
         * @param {Boolean} last Последняя ячейка
         */
        exportCell: function(cell, size, last){
            var css = ['text-align: right;vertical-align:bottom;'];

            if(cell.summary) css.push('font-weight:bold;');

            this._rc.push(this.writeTD((cell.value || '0'), size, css.join('')));
            if(last) this._rc.push('</tr>');
        }
    }
});
