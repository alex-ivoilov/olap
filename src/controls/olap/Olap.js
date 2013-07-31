/**
 * @class ui.olap.Olap
 * @extends ui.Control
 * @requires ui.olap.View
 * @requires ui.olap.Field
 * @requires ui.olap.Row
 * @requires ui.olap.Column
 * @requires ui.olap.Layout
 * @requires ui.olap.Selection
 *
 * Класс олап куба
 *
 *      var fields = [
 *          {
 *              header: 'field 1',
 *              dataIndex: 'f1',
 *              type: 'string',
 *              area: 'columns'
 *          },
 *          {
 *              header: 'field 2',
 *              dataIndex: 'f2',
 *              type: 'string',
 *              area: 'columns'
 *          },
 *          {
 *              header: 'field 3',
 *              dataIndex: 'f3',
 *              type: 'string',
 *              area: 'rows'
 *          },
 *          {
 *              header: 'field 4',
 *              dataIndex: 'f4',
 *              type: 'int',
 *              area: 'data'
 *          },
 *      ];
 *
 *      var data = [
 *          { f1: 'val 1_1', f2: 'val 2_1',  f3: 'val 3_1', f4: 5 },
 *          { f1: 'val 1_1', f2: 'val 2_2',  f3: 'val 3_4', f4: 3 },
 *          { f1: 'val 1_2', f2: 'val 2_4',  f3: 'val 3_3', f4: -3 },
 *          { f1: 'val 1_1', f2: 'val 2_2',  f3: 'val 3_3', f4: 1 }
 *      ];
 *
 *      var olap = ui.instance({
 *          type: 'olap',
 *          parent: 'body',
 *          width: 800,
 *          height: 500,
 *          fields: fields,
 *          store: data
 *      });
 */

/**
 * Вызывается при отрисовке или перерисовки OLAP куба
 * @event redraw
 */

/**
 * Вызывается при обновление области данных OLAP куба
 * @event dataScroll
 * @param {ui.olap.Olap} this OLAP куб
 */

/**
 * Вызывается при формировании ячейки OLAP куба
 * @event renderCell
 * @param {jQueryElement} cell Контайнер ячейки
 * @param {Object} val Описание значения ячейки
 * @param {ui.olap.Olap} this OLAP куб
 * @param {Number} x Индекс столбца OLAP куба
 * @param {Number} y Индекс строки OLAP куба
 */

ui.define({
    name: 'ui.olap.Olap',
    type: 'olap',
    base: 'control',
    data: {

        /**
         * @cfg {String} cls
         * Имя класса OLAP куба
         */
        cls: 'ui-olap',

        /**
         * @property {String}
         * Тип представления OLAP куба
         */
        viewType: 'olap.view',

        /**
         * @property {String}
         * Тип менеджера представлений OLAP куба
         */
        layout: 'olap.Layout',

        /**
         * @property {String}
         * Тип менеджера выбора данных OLAP куба
         */
        selection: 'olap.Selection',

        /**
         * @property {Object}
         * Описание итоговой группы по умолчанию
         */
        sumColumn: { group: '<b>Итого</b>', summary: true, items: [] },

        /**
         * @cfg {Number} columnHeight
         * Высота групп по умолчанию
         */
        columnHeight: 22,

        /**
         * @cfg {Number} columnWidth
         * Ширина групп по умолчанию
         */
        columnWidth: 100,

        /**
         * @cfg {Boolean} columnSummary
         * Отображать итоговый столбец
         */
        columnSummary: true,

        /**
         * @cfg {Boolean} emptySumRows
         * Скрывать итоги у строк с одной дочерней строкой
         */
        emptySumRows: true,

        /**
         * @cfg {String} layoutName
         * Наименование представления
         */
        layoutName: null,

        /**
         * @cfg {String} stateId
         * Идентификатор хранилища представлений
         */
        stateId: 'olap',

        /**
         * Конструктор класса ui.olap.Olap
         * @constructor
         * @param {Object} config Параметры инициализации OLAP куба
         */
        init: function(config){
            config = config || {};

            this._ignore = {};
            this._fitted = {};
            this._source = {};

            this.defaultFields = [];
            this.defaultLayout = config.layoutName;
            this.fields = config.fields instanceof ui.Array ? config.fields : ui.array(config.fields);
            this.fields.each(function(f){ this.defaultFields.push(ui.clone(f))}, this);
            this.store = this.createStore(config);

            delete config.store;
            delete config.fields;

            this.base(config);
        },

        /**
         * Инициализация перетаскиваемых элементов
         * @private
         */
        initDragDrop: function(){
            ui.DragAndDropManager.addDropZone(this, 'o-cols-' + this.id);
            ui.DragAndDropManager.addDropZone(this, 'o-rows-' + this.id);
            ui.DragAndDropManager.addDropZone(this, 'o-data-' + this.id);
            ui.DragAndDropManager.addDropZone(this, 'o-filter-' + this.id);

            this.on('drop', function(f, e, pos, zone){
                if(zone.indexOf('o-cols-') >= 0){
                    f.field.area = 'columns';
                }
                if(zone.indexOf('o-rows-') >= 0){
                    f.field.area = 'rows';
                }
                if(zone.indexOf('o-data-') >= 0){
                    f.field.area = 'data';
                }
                if(zone.indexOf('o-filter-') >= 0){
                    f.field.area = 'filter';
                }

                this.redraw();
            }, this);
        },

        /**
         * Создать менеджер данных OLAP куба
         * @param {Object} config Параметры инициализации OLAP куб
         * @returns {ui.olap.store.Base} Менеджер данных OLAP куба
         */
        createStore: function(config){
            return ui.instance(ui.isArray(config.store) ? {} : config.store, {
                olap: this,
                type: 'ui.olap.store.Array',
                data: ui.isArray(config.store) ? config.store : [],
                listeners: {
                    scope: this,
                    update: this.redraw
                }
            });
        },

        /**
         * Создать менеджер представлений OLAP куба
         * @returns {ui.olap.Layout} Менеджер представлений OLAP куба
         */
        createLayout: function(){
            return ui.instance({
                type: this.layout,
                olap: this
            });
        },

        /**
         * Создать менеджер выбора данных OLAP куба
         * @returns {ui.olap.Selection} Менеджер выделения данных OLAP куба
         */
        createSelection: function(){
            return ui.instance({
                type: this.selection,
                olap: this
            });
        },

        /**
         * Отрисовка OLAP куба
         */
        render: function(){
            this.base();

            var me = this;

            $(window).resize(function(){ me.view.updateSize(); });

            this.initDragDrop();

            this.view.on('scrollEnd', this.dataScroll, this);

            this.layout = this.createLayout();
            this.selection = this.createSelection();

            this.fire('layout', [this.layout, this]);

            if(!this.layout.setLayout(this.layoutName)){
                this.store.sorters = this.getSorters();
                this.filter.defer(1, this);
            }
        },

        /**
         * Очистить OLAP куб
         */
        clear: function(){
            var view = this.view,
                dataBody = view.getBox('data-cols'),
                filterBody = view.getBox('filter-cols'),
                colsBody = view.getBox('cols-cols'),
                rowsBody = view.getBox('rows-cols');

            dataBody.empty();
            filterBody.empty();
            colsBody.empty();
            rowsBody.empty();

            this._cols = [];
            this._rows = [];
            this._matrix = {};
            this._ignore = {};
            this._fitted = {};
            this._source = {};
            this.rootColumns = [];
            this.rootRows = [];

            this.fields = this.fields instanceof ui.Array ? this.fields : ui.array(this.fields);
            this.dataFields = this.fields.find({ area: 'data' });
            this.rowsFields = this.fields.find({ area: 'rows' });
            this.colsFields = this.fields.find({ area: 'columns' });
            this.filterFields = this.fields.find({ area: 'filter' });

            this.selection.clear();
        },

        /**
         * Отрисовать группу полей
         * @param {ui.Element} body Элемент родитель
         * @param {Array} fields Список полей
         */
        renderZone: function(body, fields){
            var emptyZone = function(el){
                el.setHtml('<div class="empty-zone">' + el.html + '</div>');
            };

            if(fields.length){
                ui.each(fields, function(field){
                    field.dataGroup = this.renderGroup(body, field, 'olapField');
                }, this);
            } else {
                emptyZone(body);
            }
        },

        /**
         * Перерисовать OLAP куб
         */
        redraw: function(){
            var me = this,
                view = me.view;

            this.clear();

            this.store.loadDataSource(function(){
                me.renderZone(view.getBox('filter-cols'), me.filterFields);
                me.renderZone(view.getBox('data-cols'), me.dataFields);
                me.renderZone(view.getBox('cols-cols'), me.colsFields);
                me.renderZone(view.getBox('rows-cols'), me.rowsFields);

                me.renderColumns(me.colsFields);
                me.renderRows();

                view.updateSize();

                me.dataScroll();

                me.fire('redraw', me);
            });
        },

        /**
         * Подобрать приблизительную ширину текста, расчитаные ширины храняться в хеш словаре
         * @param {String} key Текст для подбора ширины
         * @returns {Number} Приблизительная ширина текста
         */
        getWordWidth: function(key){
            if(this._fitted[key])
                return this._fitted[key];

            var el = $('<span/>')
                .hide()
                .addClass('ui-text-metric')
                .html(key || "")
                .prependTo('body');

            this._fitted[key] = el.width();

            el.remove();

            return this._fitted[key];
        },

        /**
         * Получить словарь фильтров
         * @returns {Object} Набор фильтров
         */
        getFilters: function(){
            return this.store.getFilters();
        },

        /**
         * Получить список сортировок
         * @return {Array} Список сортировок
         */
        getSorters: function(){
            var sorters = [];

            this.fields.each(function(f){
                if(f.sort){
                    sorters.push({
                        dir: f.sort,
                        code: f.dataIndex
                    });
                }
            });

            return sorters;
        },

        /**
         * Фильтровать данные OLAP куба
         */
        filter: function(){
            var options = {
                filters: this.getFilters(),
                sorters: this.getSorters()
            };

            this.fire('beforefilter', [this, options]);

            this.store.sorters = options.sorters;
            this.store.filter(options.filters);
        },

        /**
         * Сортировать данные OLAP куба
         */
        sort: function(){
            this.store.sort(this.getSorters());
        },

        /**
         * Проверка скрыта ли строка по индексу
         * @param {Number} y Индекс строки
         * @returns {Boolean} Строка скрыты
         */
        isIgnoredY: function(y){
            return this._ignore['y:'+y] == 1;
        },

        /**
         * Проверка скрыт ли столбец по индексу
         * @param {Number} x Индекс столбца
         * @returns {Boolean} Столбец скрыт
         */
        isIgnoredX: function(x){
            return this._ignore['x:'+x] == 1;
        },

        /** @private */
        getSourceData: function(col){
            return this._source[col];
        },

        /** @private */
        setSourceData: function(col, data){
            this._source[col] = data;
        },

        /**
         * Обновить область данных
         */
        dataScroll: function(){
            var body = this.view.getBox('data'),
                layout = this.view.getBox('data.layout'),
                fragment = $('<div style="position: absolute;"/>'),
                w = body.outerWidth(),
                h = body.outerHeight(),
                sl = body.scrollLeft(),
                st = body.scrollTop(),
                rw = this.columnWidth,
                rh = this.columnHeight,
                currentY = 0,
                countY = Math.ceil(h / rh) + 1,
                scrollY = Math.floor(st / rh),
                y = 0,
                currentX = 0,
                widthX = 0,
                x = 0,
                indexY = 0,
                startX = sl - 100,
                scrollX = 0,
                endX = sl + w + 100,
                cols = [],
                rows = [],
                rc = this.rowsCount;

            layout.empty();

            while(currentX < endX && x < this.columnsCount){
                if(this.isIgnoredX(x)){
                    x++;
                    continue;
                }

                var col = this.getColumn(x),
                    width = (col && col.columnWidth) || rw;

                currentX += width;

                if(currentX > startX){
                    cols.push(x);
                    widthX += width;
                } else {
                    scrollX += width;
                }

                x++;
            }

            fragment.css({
                left: scrollX,
                width: widthX,
                top: scrollY * rh
            });

            while(indexY < countY && y < rc){
                if(this.isIgnoredY(y)){
                    y++;
                    continue;
                }

                if(currentY >= scrollY){
                    rows.push(y);
                    indexY++;
                }
                currentY++;
                y++;
            }

            this.store.listData(cols, rows, fragment);

            var left = 0,
                height = rh * indexY;

            cols.each(function(i){
                var c = this.getColumn(i),
                    resizer = ui.instance({
                        type: 'element',
                        cls: 'ui-data-resizer',
                        listeners: {
                            scope: this,
                            drop: function(e){ this.onCellResizeEnd(e, c); },
                            drag: function(e){ this.onCellResize(e, c); }
                        }
                    });

                ui.DragAndDropManager.add(resizer);
                left += ((c && c.columnWidth) || rw);

                resizer.css({
                    left: left,
                    height: height
                });

                resizer.appendTo(fragment);
            }, this);

            fragment.appendTo(layout.el);

            this.fire('dataScroll', this);
        },

        /**
         * Обработчик изменения ширины столбца по ячейке
         * @private
         * @param {Object} e Описание события
         * @param {Object} col Описание столбца OLAP куба
         */
        onCellResize: function(e, col){
            var view = this.view,
                group = this.getResizeGroup(col.group),
                offset = group.offset(),
                o = this.offset(),
                min = 50,
                width = e.clientX - offset.left;

            width = width > min ? width : min;

            view.getBox('resize-left').css({ display: 'block', left: offset.left - o.left, top: offset.top - o.top });
            view.getBox('resize-right').css({ display: 'block', left: offset.left + width - o.left, top: offset.top - o.top });
        },

        /**
         * Обработчик окончания изменения ширины столбца по ячейке
         * @private
         * @param {Object} e Описание события
         * @param {Object} col Описание столбца OLAP куба
         */
        onCellResizeEnd: function(e, col){
            var view = this.view,
                group = this.getResizeGroup(col.group),
                offset = group.offset(),
                min = 50,
                width = e.clientX - offset.left;

            view.getBox('resize-left').hide();
            view.getBox('resize-right').hide();

            col.columnWidth = width > min ? width : min;

            if(group.source){
                group.parentGroup.updateSources(false);
            } else if(group.groups.length){
                group.expand(false, true);
            } else {
                group.view.getBox('title').css({ width: col.columnWidth, minWidth: col.columnWidth});
            }

            this.view.updateSize();
            this.dataScroll();
        },

        /**
         * Получить группу OLAP куба
         * @private
         * @param {ui.olap.Group} group Группа OLAP куба
         * @returns {ui.olap.Group} Группа OLAP куба
         */
        getResizeGroup: function(group){
            var parent = group.parentGroup;
            if(group.source){
                if(parent.sumHeight && parent.parentGroup.expanded !== true){
                    return parent.parentGroup.sources[group.sourceIndex];
                }
            } else if((group.sumHeight || group.field.sum) && parent && parent.expanded !== true){
                return parent;
            }

            return group;
        },

        /**
         * Создание ячейки OLAP куба
         * @private
         * @param {Number} x координата ячейки по горизонтали
         * @param {Number} y координата ячейки по вертикали
         * @param {ui.Element} body Фрагмент дом модели
         * @returns {jQueryElement} элемент ячейки
         */
        renderCell: function(x, y, body){
            var val = this.getCellValue(x, y),
                row = this.getRow(y),
                col = this.getColumn(x),
                cell = $('<div class="ui-data-cell" ui:x="'+x+'" ui:y="'+y+'"></div>'),
                field = val.field,
                type = ui.olap.Types[field.type],
                renderer = type ? type.renderer : null;

            if(val.summary){
                renderer = val.field && val.field.summaryRenderer
                    ? val.field.summaryRenderer
                    : (row.summary && row.data.summaryRenderer
                        ? row.data.summaryRenderer
                        : renderer);

                cell.addClass('ui-data-sum-cell');
            }

            cell.html(renderer ? renderer(val.value, type, field, this, x, y) : val.value);
            cell.width(((col && col.columnWidth) || this.columnWidth) - 6 );

            this.fire('renderCell', [cell, val, this, x, y]);

            cell.appendTo(body);

            return cell;
        },

        /**
         * Получить значение ячейки
         *
         * @param {Number} x координата ячейки по горизонтали
         * @param {Number} y координата ячейки по вертикали
         * @returns {Object} Описание значения ячейки
         */
        getCellValue: function(x, y){
            if(!this._matrix[x]) this._matrix[x] = {};

            if(this._matrix[x][y]){
                return this._matrix[x][y];
            }

            var col = this.getColumn(x),
                row = this.getRow(y),
                items = col.data.items,
                di = col.field ? col.field.dataIndex : null,
                val = { value: 0 },
                me = this,
                type = ui.olap.Types[col.field.type],
                sumFn = type.summary || function(){};

            if(col.data.summary){
                var key = [col.startIndex, y].join(':'),
                    data,
                    callback = col.field.summaryFn
                        ? function(rec){
                            col.field.summaryFn(val, rec, di, col.field, me, x, y);
                        }
                        : function(rec){
                            sumFn(val, rec, di, col.field, me, x, y);
                        };

                if(col.startIndex){
                    if(data = this.getSourceData(key)) {
                        for (var i = data.length; i--;) {
                            callback(data[i]);
                        }
                    } else {
                        this.setSourceData(key, ui.array(items).find(row.query, callback));
                    }
                } else {
                    ui.array(items).find(row.query, callback);
                }

                type.format(val, di, col.field, me, x, y);

                val.summary = true;
            } else {
                if(col.field){
                    var valueFn = col.field.valueFn || function(v, rec, key){
                        sumFn(v, rec, key, col.field, me, x, y);
                    };

                    ui.array(items).find(row.query, function(rec){
                        valueFn(val, rec, di, col.field, me, x, y);
                    });

                    type.format(val, di, col.field, me, x, y);
                }

                if(row.summary){
                    val.summary = true;
                }
            }

            val.field = col.field;

            this._matrix[x][y] = val;

            return val;
        },

        /**
         * Получить столбец по индексу
         * @param {Number} index индекс столбца
         */
        getColumn: function(index){
            return this._cols[index];
        },

        /**
         * Получить строку по индексу
         * @param {Number} index индекс строки
         */
        getRow: function(index){
            return this._rows[index];
        },

        /**
         * Формирование строк OLAP куба
         * @private
         */
        renderRows: function(){
            var layout = this.view.getBox('rows.layout'),
                groups = ui.array(this.rowsFields).map('dataIndex'),
                fragment = $('<div/>'),
                me = this;

            this.rowGroups = groups;
            this.rowsCount = 0;

            layout.empty();

            this.store.getRowsData(groups, function(data, level){
                ui.each(data, function(item){
                    me.renderRow(item, fragment, level);
                }, me);

                var sumData = ui.clone(me.sumColumn);
                sumData.mainRowSummary = true;

                me.renderRow(sumData, fragment, groups.length);

                ui.instance({ type: 'clear', parent: fragment });
                fragment.appendTo(layout.el);
            });
        },

        /**
         * Формирование строки OLAP куба
         * @private
         * @param {Object} data Описание строки OLAP куба
         * @param {ui.olap.Row} g Строка родитель
         * @param {Number} level Уровень строки
         * @returns {ui.olap.Row} Строка OLAP куба
         */
        renderRow: function(data, g, level){
            if(!data.group && !data.items){
                return;
            }

            var group = this.renderGroup(g, data, 'olapRow');
            group.index = this.rowsCount;

            if(data.mainRowSummary){
                group.query = {};
                group.mainRowSummary = true;
            } else {
                level--;

                group.query = g.query ? ui.clone(g.query) : {};
                group.query[this.rowGroups[this.rowGroups.length - level]] = data.group;
            }

            group.level = level;

            data.items.each(function(item){
                this.renderRow(item, group, level);
            }, this);

            if(level <= 1 || data.mainRowSummary){
                this.rowsCount++;
                this._rows.push(group);
            }

            var field = this.fields.findOne({ area: 'rows', dataIndex: data.code });

            if(field && field.summary !== false && level > 1 && (this.emptySumRows || (data.items.length > 1 && data.items[0].group))){
                var conf = ui.clone(this.sumColumn);
                conf.group = field.summaryHeaderRenderer ?
                    field.summaryHeaderRenderer(data.group) :
                    '<b>Итого ' + data.group + '</b>';

                var sumGroup = this.renderGroup(g, conf, 'olapRow');
                sumGroup.parentGroup = group;
                sumGroup.level = level;
                sumGroup.query = ui.clone(group.query);
                sumGroup.summary = true;
                sumGroup.data = field;
                sumGroup.index = this.rowsCount;
                sumGroup.addClass('ui-row-sum-cell');

                group.sumGroup = sumGroup;

                this.rowsCount++;
                this._rows.push(sumGroup);

                sumGroup.ready = true;
                sumGroup.fire('ready');
            }

            group.ready = true;
            group.fire('ready');

            if(!group.parentGroup) {
                group.expand(false, true);

                if(!group.groups.length) {
                    group.expanded = false;
                    group.updateIgnored(true);
                }
            }

            return group;
        },

        /**
         * Формирование столбцов OLAP куба
         * @private
         * @param {Array} fields Список полей
         */
        renderColumns: function(fields){
            var me = this,
                body = this.view.getBox('cols'),
                layout = this.view.getBox('cols.layout'),
                height = me.columnHeight,
                groups = ui.array(fields).map('dataIndex');

            this.colGroups = groups;
            this.colFields = fields;
            this.columnsCount = 0;

            layout.empty();

            this.store.getColumnsData(groups, function(data, level){
                ui.each(data, function(item){
                    me.renderColumn(item, layout.el, level);
                }, me);

                if(me.columnSummary){
                    var colData = ui.clone(me.sumColumn);

                    colData.code = '';
                    colData.items = me.store.getRecords();
                    colData.summary = true;
                    colData.mainColumnSummary = true;

                    me.renderColumn(colData, layout.el, level);
                }

                if(groups.length){
                    height = me.columnHeight * (me.dataFields.length > 1 ? level : level - 1);
                } else if(me.dataFields.length > 1){
                    height = me.columnHeight * 2;
                }


                body.setHeight(height);
            });
        },

        /**
         * Формирование столбца OLAP куба
         * @private
         * @param {Object} data Описание столбца OLAP куба
         * @param {ui.olap.Column} body Элемент родитель
         * @param {Number} level Уровень строки
         */
        renderColumn: function(data, body, level){
            if(ui.isEmpty(data.group) && ui.isEmpty(data.items)){
                return;
            }

            var group = this.renderGroup(body, data, 'olapColumn');

            level--;

            group.index = this.columnsCount;
            group.level = level;

            if(data.summary){
                group.sumHeight = level * this.columnHeight;

                if(body.type == 'olapColumn'){
                    body.sumGroup = group;
                    if(!body.parentGroup || this.colFields.length == 1) body.expand(false, true);
                } else if(group.mainColumnSummary) {
                    group.expand(false, true);
                    group.view.getBox('title').css({
                        height: (level || 1) * this.columnHeight
                    });
                }

                this.renderColumnField(data, group);
                return;
            }

            data.items.each(function(item){
                this.renderColumn(item, group, level);
            }, this);

            if(level > 1)
            {
                var field = this.colFields[this.colFields.length - level + 1];

                if(field.summary !== false){
                    var sum = ui.clone(this.sumColumn);

                    sum.code = field.dataIndex;
                    sum.items = this.getItems(data.items);
                    sum.summary = true;

                    this.renderColumn(sum, group, level);
                }
            }
            else
            {
                this.renderColumnField(data, group);

                if(this.colFields.length == 1)
                    group.expand(false, true);
            }
        },

        /**
         * Формирование источников
         * @private
         * @param {Object} data Описание столбца OLAP куба
         * @param group Столбец OLAP куба
         */
        renderColumnField: function(data, group){
            ui.each(this.dataFields, function(f){
                this.columnsCount++;
                this._cols.push({
                    field: f,
                    data: data,
                    group: group
                });
            }, this);

            group.ready = true;
            group.fire('ready');
        },

        /**
         * Формирование группы OLAP куба
         * @private
         * @param {jQueryElement} parent Элемент родитель
         * @param {Object} field Описание группы
         * @param {String} type Тип группы
         * @returns {ui.olap.Group/ui.olap.Field} Группа OLAP куба
         */
        renderGroup: function(parent, field, type){
            var group = ui.instance({
                type: type,
                title: field.group || field.header,
                field: field,
                parent: parent,
                mainColumnSummary: field.mainColumnSummary,
                autoRender: !!field.dataIndex,
                olap: this
            });

            if(parent.type == 'olapRow' || parent.type == 'olapColumn'){
                group.parentGroup = parent;
                parent.groups.push(group);
            } else if(type == 'olapRow'){
                this.rootRows.push(group);
            } else if(type == 'olapColumn'){
                this.rootColumns.push(group);
            }

            if(type == 'olapField'){
                group.fitField(true);
            }

            return group;
        },

        /**
         * Получить записи
         * @private
         * @param {Object} data Данные OLAP куба
         * @returns {Array} Список записей
         */
        getItems: function(data){
            var items = [];

            if(data[0].items){
                data.each(function(item){
                    items = items.concat(this.getItems(item.items));
                }, this);
            } else return data;

            return items;
        },

        /**
         * Получить уровень данных
         * @private
         * @param {Object} data Данные OLAP куба
         * @returns {Number} Уровень данных
         */
        getLevel: function(data){
            var level = 1;

            while(data.items && data.items[0]){
                level++;
                data = data.items[0];
            }

            return level;
        },

        /**
         * Получить зону попадания перетаскиваемого элемента
         * @param {String} name Имя зоны
         * @returns {ui.Element} Элемент зоны
         */
        getDropZone: function(name){
            var id = this.id,
                getName = function(n){ return n + id };

            switch(name){
                case getName('o-cols-'):
                    return this.view.getBox('cols-cols');

                case getName('o-rows-'):
                    return this.view.getBox('rows-cols');

                case getName('o-data-'):
                    return this.view.getBox('data-cols');

                case getName('o-filter-'):
                    return this.view.getBox('filter-cols');
            }

            return null;
        }
    }
});