ui.define({
    name: 'ui.QueryBuilder',
    type: 'queryBuilder',
    base: 'control',
    data: {
        cls: 'ui-qbldr',
        viewType: 'queryBuilder.view',

        regexField: /\[([A-Za-zА-Яа-я0-9_]+)\]/g,
        regexOR: /OR/g,
        regexAND: /AND/g,

        defaultOperands: ['EQ','NOT','LT','LTR','GT','GTR'],

        operands: {
            'EQ' : {
                js: '==',
                icon: '=',
                html: '=',
                view: 'равно'
            },
            'NOT' : {
                js: '!=',
                icon: '!=',
                html: '!=',
                view: 'не равно'
            },
            'GT' : {
                js: '>',
                icon: '&gt;',
                html: '&gt;',
                view: 'больше'
            },
            'GTR' : {
                js: '>=',
                icon: '&gt;=',
                html: '&gt;=',
                view: 'больше или равно'
            },
            'LT' : {
                js: '<',
                icon: '&lt;',
                html: '&lt;',
                view: 'меньше'
            },
            'LTR' : {
                js: '<=',
                icon: '&lt;=',
                html: '&lt;=',
                view: 'меньше или равно'
            },
            'AND' : {
                js: 'AND',
                html: '<span style="color:red">и</span>',
                view: 'и'
            },
            'OR' : {
                js: 'OR',
                html: '<span style="color:red">или</span>',
                view: 'или'
            }
        },

        render: function(){
            this.base();
            this.redraw();
        },

        redraw: function(){
            this.renderQueryTree();
            this.find('.group > .condition:last-child, .group > .group:last-child').addClass('last');
            this.fire('redraw');
        },

        renderQueryTree: function(){
            var view = this.view,
                me = this,
                box = this.view.getBox('body'),
                q = this.query,
                and = q['AND'],
                or = q['OR'],
                ops = this.operands,
                body = $('<div class="group"><div class="elbow"/></div>'),
                qGroup = function(gr, op, el, data, dataGr){
                    var opEl = view.getOperand(op, data, dataGr),
                        items = [opEl, '<div class="ui-clear"/>'];

                    ui.each(gr, function(item){
                        var iAnd = item['AND'],
                            iOr = item['OR'],
                            grEl = body.clone();

                        if(iAnd){
                            items.push(grEl);
                            qGroup(iAnd, 'AND', grEl, item, gr);
                        }
                        else if(iOr) {
                            items.push(grEl);
                            qGroup(iOr, 'OR', grEl, item, gr);
                        }
                        else if(item.field) {
                            var cell = $('<div class="condition"><div class="elbow"/></div>');
                            cell.append(view.getField(item, gr));
                            cell.append(view.getCondition(ops[item.op].view, item));
                            cell.append(view.getValue(item, gr));
                            cell.append($('<div class="ui-close"/>').click(function(){
                                gr.remove(item);
                                me.redraw();
                            }));
                            cell.append('<div class="ui-clear"/>');

                            items.push(cell);
                        }
                    }, this);

                    items.each(function(g){$(g).appendTo(el)});
                };

            if(and) qGroup(and, 'AND', body, q, null);
            if(or) qGroup(or, 'OR', body, q, null);

            box.empty();
            body.appendTo(box.el);
        },

        getQueryFunction: function(){
            var queryFunction = null,
                code = this.getJavaScriptQuery();

            try {
                eval('queryFunction=function(r){return('+code+')};');
            } catch(e) {
                return null;
            }

            return queryFunction;
        },

        getJavaScriptQuery: function(){
            return this.getQueryString('js')
                       .replace(this.regexField, function(str, f){ return "r['"+f+"']" })
                       .replace(this.regexOR, '||')
                       .replace(this.regexAND, '&&');
        },

        _groupToString: function(gr, op, view){
            var sb = [], start = '', end = '';

            if(gr && gr.length > 1) {
                start = ' ( ';
                end = ' ) ';
            }

            ui.each(gr, function(item){
                var and = item['AND'],
                    or = item['OR'];

                if(and && and.length) sb.push(this._groupToString(and, 'AND', view));
                else if(or && or.length) sb.push(this._groupToString(or, 'OR', view));
                else if(item.field) sb.push(this._criteriaToString(item, view));
            }, this);

            return start + sb.join(' ' + this.operands[op][view] + ' ') + end;
        },

        _criteriaToString: function(cr, view){
            var sb = [],
                field = cr.field;

            if(view == 'html' && this.getFieldTitle){
                field = this.getFieldTitle(field);
            }

            sb.push('[');
            sb.push(field);
            sb.push(']');
            sb.push(' ');
            sb.push(this.operands[cr.op][view]);
            sb.push(view == 'view' || view == 'html' ? '  ' : ' \'');
            sb.push(cr.value);
            sb.push(view == 'view' || view == 'html' ? ' ' : '\'');

            return sb.join('');
        },

        getQueryString: function(view){
            var q = this.query,
                and = q['AND'],
                or = q['OR'],
                sb = [];

            view = view || 'view';

            if(and && and.length) sb.push(this._groupToString(and, 'AND', view));
            if(or && or.length) sb.push(this._groupToString(or, 'OR', view));

            return sb.join(' AND ');
        }
    }
});

