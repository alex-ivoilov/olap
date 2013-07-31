/**
 * Менеджер выбора ячеек OLAP куба
 * @class ui.olap.Selection
 * @extends ui.Base
 */

/**
 * Вызывается при выборе ячеек OLAP куба
 * @event selectionchange
 * @param {ui.olap.Selection} this Менеджер выбора данных OLAP куба
 * @param {Object} selected Описание выбранных ячеек
 */
ui.define({
    name: 'ui.olap.Selection',
    type: 'olap.Selection',
    base: 'base',
    data: {
        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации
         */
        init: function(config){
            this.base(config);

            this._selection = {};
            this._selected = { map: {} };

            this.olap.on('renderEnd', this.initOlap, this);
        },

        /**
         * Получить координаты события
         * @private
         * @param {Object} e Описание события
         */
        getCoords: function(e){
            var el = this.olap.view.getBox('data'),
                offset = el.offset();

            return {
                x: e.clientX - offset.left + el.scrollLeft(),
                y: e.clientY - offset.top + el.scrollTop()
            };
        },

        /**
         * Получить описание ячейки по DOM элементу
         * @param {Object} target DOM элемент
         * @private
         */
        getCell: function(target){
            var colIndex = parseInt(target.attr('ui:x')),
                rowIndex = parseInt(target.attr('ui:y'));

            return {
                col: colIndex,
                row: rowIndex
            };
        },

        /**
         * Инициализация OLAP куба
         * @private
         */
        initOlap: function(){
            var body = this.olap.view.getBox('data'),
                el = ui.instance({
                    type: 'element',
                    cls: 'ui-olap-selection',
                    parent: body
                });

            this.element = el;
            ui.DragAndDropManager.add(body);

            body.on('dragStart', this.onDragStart, this);
            body.on('drag', this.onDrag, this);
            body.on('drop', this.onDrop, this);

            this.olap.on('renderCell', this.onRenderCell, this);

            this.element = el;
        },

        /**
         * Проверить DOM элемент
         * @private
         * @param {Object} e Описание события
         * @param {Object} target DOM элемент
         * @returns {boolean} Результат проверки
         */
        checkSelection: function(e, target){
            if(!target.hasClass('ui-data-resizer')){
                if(!target.hasClass('ui-data-cell')){
                    target = target.parents('.ui-data-cell');
                }

                if(target.hasClass('ui-data-cell')){
                    this._selection.end = this.getCell(target);

                    if(!this._selection.start){
                        this._selection.start = this.getCell(target);
                    }
                }

                return true;
            }

            return false;
        },

        /**
         * Обработчик окончания выбора ячеек
         * @private
         * @param {Object} e Описание события
         */
        onDrop: function(e){
            var target = $(e.target),
                el = this.element;

            if(this.checkSelection(e, target)){
                el.hide();

                if(this.start){
                    this.updateSelection(this._selection.start, this._selection.end, e.ctrlKey ? 'merge' : null);
                    this.clear();

                    delete this.start;
                }
            } else {
                if(this.start){
                    this.clear();

                    delete this.start;
                }
            }
        },

        /**
         * Обработчик начала выбора ячеек
         * @private
         * @param {Object} e Описание события
         */
        onDragStart: function(e){
            var target = $(e.target),
                el = this.element;

            this.clear();

            if(this.checkSelection(e, target)){
                this.start = this.getCoords(e);

                el.css({
                    left: this.start.x,
                    top: this.start.y,
                    width: 0,
                    height: 0,
                    display: 'block'
                });
            }
        },

        /**
         * Обработчик выбора ячеек
         * @private
         * @param {Object} e Описание события
         */
        onDrag: function(e){
            var target = $(e.target),
                el = this.element;

            if(this.checkSelection(e, target) && this.start){
                var coords = this.getCoords(e);

                coords.x > this.start.x
                    ? el.css({ width: coords.x - this.start.x })
                    : el.css({ width: this.start.x - coords.x, left: coords.x  });

                coords.y > this.start.y
                    ? el.css({ height: coords.y - this.start.y })
                    : el.css({ height: this.start.y - coords.y, top: coords.y });
            }
        },

        /**
         * Обновить выдиление
         * @param {Object} start Описание ячейки
         * @param {Object} end Описание ячейки
         * @param {String} type Тип выбора
         * @param {Boolean} silent Выполнить без события
         */
        updateSelection: function(start, end, type, silent){
            if(!start || !end) {
                this._selected = { map: {} };
                this.olap.dataScroll();

                if(silent !== true){
                    this.fire('selectionchange', [this, null]);
                }
                return;
            }

            var startX = start.col,
                startY = start.row,
                endX = end.col,
                endY = end.row,
                rowData,
                val,
                col,
                row,
                first = true,
                newRow,
                index;

            if(startX > endX){
                endX = start.col;
                startX = end.col;
            }

            if(startY > endY){
                endY = start.row;
                startY = end.row;
            }

            if(type != 'merge'){
                this._selected = {
                    map: {},
                    data: [],
                    rows: [],
                    cols: []
                };
            }

            for(var y = startY;y <= endY;y++){
                if(this.olap.isIgnoredY(y))
                    continue;

                row = this.olap.getRow(y);
                index = this._selected.rows.contains(row.getName());
                newRow = false;

                if(index !== false){
                    rowData = this._selected.data[index];
                } else {
                    rowData = [];
                    newRow = true;
                    this._selected.rows.push(row.getName());
                }

                for(var x = startX;x <= endX;x++){
                    if(this.olap.isIgnoredX(x) || this._selected.map[x+':'+y])
                        continue;

                    val = this.olap.getCellValue(x, y);
                    col = this.olap.getColumn(x);

                    if(first){
                        this._selected.cols.push(col.group.getName());
                    }

                    rowData.push(val.value);

                    this._selected.map[x+':'+y] = 1;
                }

                if(newRow){
                    this._selected.data.push(rowData);
                }

                first = false;
            }

            this.olap.dataScroll();

            if(silent !== true){
                this.fire('selectionchange', [this, this.getSelected()]);
            }
        },

        /**
         * Получить описание выделения
         * @returns {Object} Описание выделения
         */
        getSelected: function(){
            return {
                data: this._selected.data,
                cols: this._selected.cols,
                rows: this._selected.rows
            };
        },

        /**
         * Обработчик отрисовки ячейки OLAP куба
         * @param {jQueryElement} cell Контайнер ячейки
         * @param {Object} val Описание значения ячейки
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        onRenderCell: function(cell, val, olap, x, y){
            if(this._selected.map[x+':'+y]){
                cell.append('<div class="selected-cell"></div>');
            }
        },

        /**
         * Очистить выделение
         */
        clear: function(){
            this._selection = {};
        }
    }
});
