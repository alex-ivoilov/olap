/**
 * @class ui.olap.Column
 * @extends ui.olap.Group
 *
 * Базовый класс столбца OLAP куба
 */
ui.define({
    name: 'ui.olap.Column',
    type: 'olapColumn',
    base: 'olapGroup',
    data: {
        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации
         */
        init: function(config){
            this.base(config);
        },

        /**
         * Отрисовка столбца OLAP куба
         */
        render: function(){
            this.base();

            var title = this.view.getBox('title');

            title.css('minWidth', 'auto');

            if(this.source){
                var p = this.parentGroup,
                    g = p.sumGroup ? p.sumGroup : p,
                    me = this,
                    index = function(){ me.olap.getColumn(me.index).startIndex = me.startIndex };

                g.ready ? index() : g.on('ready', index);

                this.single();
            } else {
                this.renderSources();
            }

            if(!this.hasSources() && !this.groups.length && this.level == this.olap.colGroups.length){
                title.css('width', this.olap.columnWidth);
            }

            this.renderUtils();
        },

        /**
         * Выделить столбец
         * @param {Boolean} silent Выполнить без события
         * @param {String} type Тип выделения
         */
        select: function(silent, type){
            var startGroup = this,
                endGroup = this;

            if(this.sumGroup && this.expanded !== true){
                startGroup = this.sumGroup;
                endGroup = this.sumGroup;
            }

            if(this.groups.length && this.expanded){
                startGroup = this.groups[0];
                endGroup = this.groups[this.groups.length - 1];
            }

            if(endGroup.sources){
                endGroup = endGroup.sources[endGroup.sources.length - 1];
            }

            var start = {
                    row: 0,
                    col: startGroup.index
                },
                end = {
                    row: this.olap.rowsCount - 1,
                    col: endGroup.index
                };

            this.olap.selection.updateSelection(start, end, type, silent);
        },

        /**
         * Создание утилит столбца
         */
        renderUtils: function(){
            var olap = this.olap,
                resizer = this.view.getBox('title.resize');

            ui.DragAndDropManager.add(resizer);

            if(this.field && this.field.summary)
                return;

            if(this.source || (!this.hasSources() && !this.groups.length)){
                this.view.getBox('title.span').on('dblclick', this.fitColumn, this);

                if(!this.parentGroup) return;

                var p = this.parentGroup,
                    g = p.sumGroup ? p.sumGroup : p,
                    me = this,
                    setSource = function(){
                        me.olap.getColumn(me.index).group = me;
                    };

                if(olap.autoFitColumns) {
                    var fn = function(){
                            me.fitColumn(true);
                        };

                    if(this.source){
                        g.ready ? fn() : g.on('ready', fn);
                    } else {
                        fn();
                    }
                }

                if(this.source){
                    g.ready ? setSource() : g.on('ready', setSource);
                }
            }
        },

        /**
         * Подобрать приблизительную ширину столбца
         * @param {Boolean} [silent] Не обновлять OLAP куб
         */
        fitColumn: function(silent){
            if(this.groups.length) return;
            this.setColumnWidth(this.olap.getWordWidth(this.title) + 16, silent);
        },

        /**
         * Выставить ширину столбца
         * @param {Number} width Ширина столбца
         * @param {Boolean} [silent] Не обновлять OLAP куб
         */
        setColumnWidth: function(width, silent){
            var olap = this.olap,
                title = this.view.getBox('title'),
                col = olap.getColumn(this.index);

            col.columnWidth = width;

            title.css({ width: width, minWidth: width });

            if(silent !== true){
                olap.dataScroll();
                olap.view.updateSize();
            }
        },

        /**
         * Создание источников данных OLAP куба
         * используется при множестве источников
         */
        renderSources: function(){
            if(!this.hasSources()) return;

            var olap = this.olap,
                idx = this.sumGroup ? this.sumGroup.index : this.index,
                defIndex = idx;

            this.sources = [];

            ui.each(olap.dataFields, function(df, i){

                var source = ui.instance({
                    source: true,
                    sourceIndex: i,
                    extraCls: 'single',
                    type: 'olapColumn',
                    title: df.header,
                    field: this.dataField,
                    index: idx,
                    startIndex: defIndex,
                    parent: this.getBody(),
                    parentGroup: this,
                    autoRender: false,
                    olap: this.olap
                });

                idx++;

                this.sources.push(source);
            }, this);

            this.view.getBox('title').css('width', 'auto');
        },

        /**
         * Проверка количества источников OLAP куба
         * @returns {Boolean} Куб содержит более одного источника
         */
        hasSources: function(){
            return this.olap.dataFields.length > 1;
        },

        /**
         * Обновить источники
         * @param {Boolean} expand Раскрытие/Закрытие
         */
        updateSources: function(expand){
            if(!this.hasSources()){
                return;
            }

            ui.each(this.sources, function(source, i){
                source.doRender();

                var col = this.olap.getColumn(source.index);

                if(expand){
                    source.el.hide();
                } else {
                    var title = source.view.getBox('title'),
                        width = (col && col.columnWidth) || this.olap.columnWidth;

                    //title.css({ minWidth: 'auto' });
                    title.setWidth(width);

                    source.el.show();
                }
            }, this);

            if(this.sumGroup) {
                this.sumGroup.updateSources(false);
            }
        },

        /**
         * Раскрыть/Свернуть столбец OLAP куба
         * @param {Boolean} expand Раскрыть/Свернуть
         * @param {Boolean} [silent] Не обновлять OLAP куб
         */
        expand: function(expand, silent){
            if(this.expandGroup(expand) == false){
                return;
            }

            this.updateIgnored(silent);

            var olap = this.olap,
                title = this.view.getBox('title'),
                colHeight = olap.columnHeight,
                width = this.hasSources() ? 'auto' : olap.columnWidth,
                sum = this.sumGroup,
                col = olap.getColumn(sum ? sum.index : null);

            if(expand == false && this.hasSources() == false && col){
                width = col.columnWidth || olap.columnWidth;
            }

            title.css(expand ? { height: colHeight, width: 'auto' } : { height: this.level * colHeight, width: width  });

            if(expand && sum){
                width = (col && col.columnWidth) || olap.columnWidth;

                sum.doRender();
                sum.el.appendTo(this.el);
                sum.view.getBox('title').css({ height: sum.sumHeight, width:  this.hasSources() ? 'auto' : width });
            }

            if(expand && !this.hasSources()){
                this.groups.each(function(g){
                    if(g.groups.length) return false;

                    var t = g.view.getBox('title'),
                        c = olap.getColumn(g.index);

                    t.css({ width: (c && c.columnWidth) || olap.columnWidth });
                }, this);
            }

            if(silent !== true) {
                olap.view.updateDataSize();
                this.fire('expand', expand);
            }

            this.fire('silent_expand', expand);
        },

        /**
         * Обновить игнорируемые столбцы
         * @param {Boolean} [silent] Не обновлять OLAP куб
         */
        updateIgnored: function(silent){
            if(!this.sumGroup && !this.groups.length) return;

            var start = this.index,
                end = this.sumGroup.index,
                olap = this.olap;

            for(;start<end;start++){
                this.expanded
                    ? delete olap._ignore['x:'+start]
                    : olap._ignore['x:'+start] = 1;
            }

            if(this.expanded){
                ui.each(this.groups, function(g){
                    g.updateIgnored(true);
                });
            }

            if(this.olap.hideSummary){
                this.expanded
                    ? olap._ignore['x:'+end] = 1
                    : delete olap._ignore['x:'+end];
            }

            if(silent !== true) {
                olap.dataScroll();
            }
        },

        /**
         * Обработчик события окончания изменения ширины
         * @param {Object} e Описание события
         */
        onResizeEnd: function(e){
            var olap = this.olap,
                olapView = olap.view,
                group = this.getResizeGroup(),
                width = group.getColumnWidth(e);

            if(group.hasSources() == false){
                if(!this.expanded){
                    this.view.getBox('title').css({ width: width});

                    if(group.sumGroup) {
                        group.sumGroup.doRender();
                        group = group.sumGroup;
                    }
                }
            } else if(this !== group){
                this.view.getBox('title').css({ width: 'auto' });
            }

            group.setColumnWidth(width);

            olapView.getBox('resize-left').hide();
            olapView.getBox('resize-right').hide();
        },

        /**
         * Обработчик события изменения ширины
         * @param {Object} e Описание события
         */
        onResize: function(e){
            var olapView = this.olap.view,
                offset = this.view.getBox('title.span').offset(),
                o = this.olap.offset(),
                right = offset.left + this.getColumnWidth(e) - o.left;

            olapView.getBox('resize-left').css({ display: 'block', left: offset.left - o.left, top: offset.top - o.top });
            olapView.getBox('resize-right').css({ display: 'block', left: right, top: offset.top - o.top });
        },

        /**
         * Получить столбец для изменения ширины
         * @returns {ui.olap.Column} Столбец OLAP куба
         */
        getResizeGroup: function(){
            var g = this,
                gr = g.groups,
                sr = g.sources,
                sum = g.sumGroup;

            if(g.hasSources()){
                if(!g.source){
                    if(g.expanded && sum) g = sum;
                    g = sr[sr.length - 1];
                }
            } else if(g.expanded && gr.length){
                g = gr[gr.length - 1];
            }

            return g;
        },

        /**
         * Получить ширину столбца
         * @param {Object} e Описание события
         * @returns {Number} Ширина столбца
         */
        getColumnWidth: function(e){
            var min = 50,
                offset = this.view.getBox('title.span').offset(),
                width = e.clientX - offset.left;

            return width > min ? width : min;
        }
    }
});