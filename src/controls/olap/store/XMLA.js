ui.define({
    name: 'ui.olap.store.XMLA',
    type: 'ui.olap.store.XMLA',
    base: 'ui.olap.store.Base',
    data: {
        init: function(config){
            config = config || {};

            this._xmla = new Xmla();

            this.base(config);
        },

        filter: function(query){
            console.log(query);
            this.base(query);
        },

        getFilters: function(){
            var query = {},
                has = false;

            this.olap.fields.each(function(f){
                if(f.filter && f.filter.length){
                    query[this.getDataIndex(f)] = f.filter;
                    has = true;
                }
            }, this);

            return has ? query : null;
        },

        getGroups: function(field, callback){
            if(ui.isString(field)){
                field = this.olap.fields.findOne({ dataIndex: field });
            }

            this.base(this.getDataIndex(field), callback);
        },

        _getGroups: function(dataIndex, callback){
            this.execute({
                statement: 'SELECT ' + dataIndex + '.Members ON AXIS(0) from [' + this.xmla.cube + ']',
                success: function(xmla, req, ds) {
                    var axis = ds.getAxis(0),
                        groups = [];

                    axis.eachHierarchy(function(hierarchy){
                        axis.eachTuple(function(tuple){
                            groups.push(tuple.hierarchies[hierarchy.name]['Caption']);
                        });
                    });

                    callback && callback(groups);
                }
            });
        },

        _getPath: function(item, fields){
            var sum = item.data.sum,
                gr = item.group,
                lvl = sum ? gr.level + 1 : gr.level,
                parent = sum ? gr.parentGroup.parentGroup : gr.parentGroup,
                paths = [item.data ? item.data.path : item.field.path],
                tmp = [],
                index = function(p){
                    var a = -1;

                    ui.each(tmp, function(item, i){
                        if(p.indexOf(item) >= 0){
                            a = i;
                            return false;
                        }
                    });

                    return a;
                };

            while(parent){
                paths.push(parent.field.path);
                parent = parent.parentGroup;
            }

            if(lvl > 1){
                ui.each(fields.slice(fields.length - lvl + 1), function(f){
                    var h = '[' + f.hierarchy + ']';
                    if(paths.join(',').indexOf(h) < 0) paths.push(h);
                });
            }

            paths.sort();

            ui.each(paths, function(p){
                var j = index(p);

                if(j >= 0){
                    tmp[j] = p;
                } else {
                    tmp.push(p);
                }
            });

            return tmp.join(',');
        },

        _getColumnPath: function(colIndex){
            var olap = this.olap;

            return this._getPath(olap.getColumn(colIndex), olap.colsFields);
        },

        _getRowPath: function(rowIndex){
            var olap = this.olap;

            return this._getPath(olap.getRow(rowIndex), olap.rowsFields);
        },

        listData: function(cols, rows, el, callback){
            var colsMDX = [],
                rowsMDX = [],
                s = { x1: cols[0], x2: cols[cols.length-1], y1: rows[0], y2: rows[rows.length-1]},
                olap = this.olap,
                m = olap._matrix;

            if(el && m[s.x1] && m[s.x2] && m[s.x1][s.y1] && m[s.x2][s.y2]){
                this.base(cols, rows, el);
                return;
            }

            ui.each(cols, function(i){
                if(olap.getColumn(i)) colsMDX.push('(' + this._getColumnPath(i) + ',[Measures].[Unit Sales])');
            }, this);

            ui.each(rows, function(i){
                if(olap.getRow(i)) rowsMDX.push('(' + this._getRowPath(i)+')');
            }, this);

            if(!rowsMDX.length || !colsMDX.length)
                return;

            var sb = [
                'select {',
                colsMDX.join(','),
                '} ON COLUMNS, {',
                rowsMDX.join(','),
                '} ON ROWS FROM ['+this.xmla.cube+']'
            ];

            this.execute({
                statement: sb.join(' '),
                success: function(xmla, req, ds) {
                    var cellSet = ds.getCellset(),
                        colsCount = ds.getColumnAxis().tupleCount(),
                        rowsCount = ds.getRowAxis().tupleCount(),
                        col,
                        row,
                        cell;

                    for(var i = 0;i<rowsCount;i++){
                        for(var j=0;j<colsCount;j++){
                            cell = cellSet.getByTupleIndexes(i, j);
                            row = rows[i];
                            col = cols[j];
                            if(!m[col]) m[col]={};
                            m[col][row] = { value: cell ? cell.Value || 0 : 0 };
                            if(el) olap.renderCell(col, row, el);
                        }
                    }

                    if(callback) callback();
                }
            });
        },

        getColumnsData: function(grous, callback){
            callback(this._cols, this.olap.colsFields.length + 1);

            ui.each(this.olap.rootColumns, function(g){ g.expand(false) });
        },

        getRowsData: function(grous, callback){
            callback(this._rows, this.olap.rowsFields.length + 1);
        },

        execute: function(options){
            options.url = this.xmla.url;
            this._xmla.execute(options);
        },

        onGroupExpand: function(group, expand){
            var isColumn = group.type == 'olapColumn';

            if(!group.load){
                var me = this,
                    olap = this.olap,
                    fields = isColumn ? olap.colsFields : olap.rowsFields,
                    dataField = group.dataField || ui.array(fields).findOne(function(f){ return me.getDataIndex(f) == group.field.code;  }, this),
                    idx = fields.contains(dataField),
                    field = fields[idx + 1],
                    query = ['SELECT'],
                    path,
                    where = [],
                    isWhere,
                    parent = group,
                    renderer = function(a, b, c){ olap.renderRow(a, b, c)},
                    key;

                group.dataField = dataField;

                if(expand && field){
                    key = this.getDataIndex(field);

                    while(parent){
                        if(parent.field.path.indexOf(field.hierarchy) >= 0){
                            if(!path || path.length < parent.field.path.length)
                                path = parent.field.path;
                        } else {
                            isWhere = true;
                            ui.each(where, function(w, i){
                                if(parent.field.path.indexOf(w) >= 0){
                                    where[i] = parent.field.path;
                                    isWhere = false;
                                    return false;
                                }
                                if(w.indexOf(parent.field.path) >= 0){
                                    isWhere = false;
                                    return false;
                                }
                            });
                            if(isWhere) where.push(parent.field.path);
                        }
                        parent = parent.parentGroup;
                    }

                    if(field.sort == 'ASC' || field.sort == 'DESC'){
                        query.push('Order(');
                    }

                    path ? query.push('EXISTS('+key+'.Members, {'+path+'})')
                         : query.push(key+'.Members');

                    if(field.sort == 'ASC' || field.sort == 'DESC'){
                        query.push(','+key+'.CurrentMember.CAPTION,B'+field.sort+')');
                    }

                    query.push('ON AXIS(0)');
                    query.push('FROM [' + this.xmla.cube + ']');

                    if(where.length){
                        query.push('WHERE');
                        query.push(where.join(','));
                    }

                    if(isColumn) renderer = function(a, b, c){ olap.renderColumn(a, b, c) };

                    this.execute({
                        statement: query.join(' '),
                        success: function(xmla, req, ds) {
                            var axis = ds.getAxis(0),
                                lvl = fields.length - idx,
                                getTupleName = function(tuple, hierarchy) {
                                    for (var sb = [], i = 0; i <= hierarchy.index; i++)
                                        sb.push(tuple.members[i][Xmla.Dataset.Axis.MEMBER_UNIQUE_NAME]);

                                    return sb.join();
                                };

                            axis.eachHierarchy(function(hierarchy){
                                axis.eachTuple(function(tuple){
                                    renderer({
                                        path: getTupleName(tuple, hierarchy),
                                        group: tuple.hierarchies[hierarchy.name]['Caption'],
                                        code:  tuple.hierarchies[hierarchy.name]['LName'],
                                        expanded: false,
                                        groups: [],
                                        items: []
                                    }, group, lvl);
                                });
                            });

                            renderer({
                                path: group.field.path,
                                group: '<b>Итого ' + group.field.group + '</b>',
                                sum: true,
                                code:  group.field.code,
                                expanded: false,
                                groups: [],
                                items: []
                            }, group, isColumn ? lvl : lvl + 1);

                            group.expanded = false;
                            group.load = true;

                            olap._matrix = {};

                            group.expand(true, true);

                            isColumn ? me._updateColsIndexes()
                                     : me._updateRowsIndexes();

                            group.expand(true);
                        },
                        error: function() {
                            debugger;
                        }
                    });

                    return false;
                }

                if(!field){
                    group.load = true;
                    group.single();
                    group.expand(false);
                    return false;
                }
            } else if(!isColumn && group.sumGroup) {
                delete this.olap._ignore['y:'+group.sumGroup.index];
            }
        },

        _updateRowsIndexes: function(){
            var rows = [],
                olap = this.olap;

            var cascadeRows = function(g){
                if(g.groups.length){
                    ui.each(g.groups, cascadeRows);
                } else {
                    rows.push({
                        field: olap.dataFields[0],
                        data: g.field,
                        group: g
                    });
                    g.index = olap.rowsCount;
                    olap.rowsCount++;

                    if(g.field.sum){
                        g.parentGroup.sumGroup = g;
                        g.parentGroup.index = g.parentGroup.groups[0].index;
                        g.doRender();
                        g.single();
                    }
                }
            };

            olap.rowsCount = 0;
            ui.each(olap.rootRows, cascadeRows);
            olap._rows = rows;
        },

        _updateColsIndexes: function(){
            var cols = [],
                olap = this.olap;

            var cascade = function(g){
                if(g.groups.length){
                    ui.each(g.groups, cascade);
                } else {
                    cols.push({
                        field: olap.dataFields[0],
                        data: g.field,
                        group: g,
                        columnWidth: olap._cols[g.index] ? olap._cols[g.index].columnWidth : null
                    });
                    g.index = olap.columnsCount;
                    olap.columnsCount++;

                    if(g.field.sum){
                        g.parentGroup.sumGroup = g;
                        g.parentGroup.index = g.parentGroup.groups[0].index;
                        g.doRender();
                        g.single();
                    }
                }
            };

            olap.columnsCount = 0;
            ui.each(olap.rootColumns, cascade);
            olap._cols = cols;
        },

        getDataIndex: function(field){
            return [
                '[',
                field.hierarchy,
                '].[',
                field.dataIndex,
                ']'
            ].join('');
        },

        loadDataSource: function(callback){
            var me = this,
                col = me.olap.colsFields[0],
                row = me.olap.rowsFields[0],
                colMDX = me.getDataIndex(col),
                rowMDX = me.getDataIndex(row);

            if(col.sort == 'ASC' || col.sort == 'DESC'){
                colMDX = 'Order(' + colMDX + '.Members, ' + colMDX + '.CurrentMember.CAPTION,B'+col.sort+')';
            } else {
                colMDX += '.Members';
            }

            if(row.sort == 'ASC' || row.sort == 'DESC'){
                rowMDX = 'Order(' + rowMDX + '.Members, ' + rowMDX + '.CurrentMember.CAPTION,B'+row.sort+')';
            } else {
                rowMDX += '.Members';
            }

            this.execute({
                statement: 'SELECT '+colMDX+' ON Axis(0), '+rowMDX+' ON Axis(1) FROM ['+this.xmla.cube+']',
                success: function(xmla, req, ds) {
                    var colAxis = ds.getAxis(0),
                        rowAxis = ds.getAxis(1),
                        getTupleName = function(tuple, hierarchy) {
                            for (var sb = [], i = 0; i <= hierarchy.index; i++) {
                                sb.push(tuple.members[i][Xmla.Dataset.Axis.MEMBER_UNIQUE_NAME]);
                            }
                            return sb.join();
                        };

                    me._cols = [];
                    me._rows = [];

                    colAxis.eachHierarchy(function(hierarchy){
                        colAxis.eachTuple(function(tuple){
                            me._cols.push({
                                path: getTupleName(tuple, hierarchy),
                                group: tuple.hierarchies[hierarchy.name]['Caption'],
                                code:  tuple.hierarchies[hierarchy.name]['LName'],
                                groups: [],
                                items: []
                            });
                        });
                    });

                    rowAxis.eachHierarchy(function(hierarchy){
                        rowAxis.eachTuple(function(tuple){
                            me._rows.push({
                                path: getTupleName(tuple, hierarchy),
                                group: tuple.hierarchies[hierarchy.name]['Caption'],
                                code:  tuple.hierarchies[hierarchy.name]['LName'],
                                groups: [],
                                items: []
                            });
                        });
                    });

                    callback();

                    me._updateColsIndexes();
                    me._updateRowsIndexes();
                    me.olap.view.updateSize();
                    me.olap.dataScroll();
                },
                error: function() {
                    debugger;
                }
            });
        }
    }
});