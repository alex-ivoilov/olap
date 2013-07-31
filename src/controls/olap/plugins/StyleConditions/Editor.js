/**
 * @class ui.olap.plugins.StyleConditions.Editor
 * @extends ui.Controls
 * @requires ui.olap.plugins.StyleConditions.View
 * @requires ui.olap.plugins.StyleConditions.Combo
 *
 * Плагин условного форматирования для OLAP куба
 *
 *      var olap = ui.instance({
 *          type: 'olap',
 *          parent: 'body',
 *          width: 800,
 *          height: 500,
 *          ...
 *          plugins: ['olap.styleConditions']
 *      });
 *
 *      olap.fire('styleConditions.show');
 *      olap.fire('styleConditions.hide');
 *      olap.fire('styleConditions.clear');
 */

/**
 * Показать окно редактора условного форматирования
 * @event styleConditions.show
 * @member ui.olap.Olap
 */

/**
 * Скрыть окно редактора условного форматирования
 * @event styleConditions.hide
 * @member ui.olap.Olap
 */

/**
 * Очистить условное форматирование
 * @event styleConditions.clear
 * @member ui.olap.Olap
 */
ui.define({
    name: 'ui.olap.plugins.StyleConditions.Editor',
    type: 'olap.styleConditions',
    base: 'control',
    data: {
        /**
         * @property {String/Function}
         * Тип представления
         */
        viewType: 'olap.styleConditions.view',

        /**
         * @cfg {String} cls
         * Наименование класса контрола
         */
        cls: 'ui-scseditor',

        /**
         * @cfg {String/ui.Element/jQueryElement/HTMLElement} parent
         * Родитель DOM элемента
         */
        parent: 'body',

        /**
         * @cfg {Boolean} autoRender
         * Отрисовывать элемент при инициализации
         */
        autoRender: false,

        /**
         * Конструктор плагина
         * @constructor
         * @param {Object} config Параметры инициализации плагина
         */
        init: function(config){
            config = config || {};
            config.conditions = config.conditions || [];

            this.base(config);

            this.component.on('layout', this.onLayoutReady, this);
            this.component.on('renderCell', this.onRenderCell, this);

            this.component.on('styleConditions.show', this.show, this);
            this.component.on('styleConditions.hide', this.hide, this);
            this.component.on('styleConditions.clear', this.clearData, this);
        },

        /**
         * Отрисовать окно редактора
         * @protected
         */
        render: function(){
            this.base();

            this.on('renderEnd', function(){ this.renderConditions(this.conditions); }, this);

            var view = this.view,
                form = view.getBox('body.form'),
                styles = view.getBox('body.styles'),
                me = this,
                fields = this.component.fields.find({ area: 'data' }),
                changeFn = function(val, field){
                    if(me.selected){
                        me.selected.data[field.conditionKey] = val;
                        me.selected.update();
                    }
                },
                changeStyleFn = function(val, field){
                    if(me.selected){
                        me.selected.data.s[field.conditionKey] = val;
                        me.selected.update();
                    }
                };

            this.cData = ui.instance({
                type: 'combo',
                label: 'Источник',
                data: fields,
                displayName: 'header',
                dataIndex: 'dataIndex',
                conditionKey: 'f',
                parent: form,
                listeners: { change: changeFn }
            });

            this.cOperation = ui.instance({
                type: 'olap.styleConditions.combo',
                label: 'Условие',
                conditionKey: 'o',
                parent: form,
                listeners: { change: changeFn }
            });

            this.fValue1 = ui.instance({
                type: 'field',
                label: 'Первое значение',
                conditionKey: 'v1',
                parent: form,
                listeners: { change: changeFn }
            });

            this.fValue2 = ui.instance({
                type: 'field',
                label: 'Второе значение',
                conditionKey: 'v2',
                parent: form,
                listeners: { change: changeFn }
            });

            this.fStyleColor = ui.instance({
                type: 'field',
                label: 'Цвет текста',
                conditionKey: 'color',
                parent: styles,
                listeners: { change: changeStyleFn }
            });

            this.fStyleBackground = ui.instance({
                type: 'field',
                label: 'Цвет фона',
                conditionKey: 'backgroundColor',
                parent: styles,
                listeners: { change: changeStyleFn }
            });

            this.cOperation.on('change', this.onOperationChange, this);

            view.getBox('tbar.add').on('click', function(){
                 this.addCondition({
                     f: fields.length ? fields[0].dataIndex : null,
                     o: 0,
                     v1: null,
                     v2: null,
                     s: {}
                 }, true);
            }, this);

            view.getBox('tbar.close').on('click', this.hide, this);
        },

        /**
         * Очистить условное форматирование
         */
        clearData: function(){
            this._conditions = [];
            this.conditions = [];

            if(this.rendered){
                this.view.getBox('body.conditions').empty();
                this.setFormData({s:{}});
            }

            this.component.dataScroll.defer(1, this.component);
        },

        /**
         * Формирование условий
         * @param {Array} conditions список условий
         */
        renderConditions: function(conditions){
            this.clearData();
            this.conditions = conditions;
            ui.each(conditions, function(cnd){ this.addCondition(cnd, false, true); }, this);
        },

        /**
         * Добавить условие
         * @param {Object} conditionData Описание условия
         * @param {Boolean} select Выбрать условие
         * @param {Boolean} ghost Не обновлять OLAP куб
         */
        addCondition: function(conditionData, select, ghost){
            var condition = {};

            if(this.rendered){
                condition = this.view.addCondition(conditionData);
                condition.text.on('click', this.selectCondition.delegate(this, condition));
                condition.close.on('click', this.removeCondition.delegate(this, condition));
                condition.data = conditionData;
                condition.update(ghost);
            } else {
                condition.data = conditionData;
            }

            if(this.rendered && select) this.selectCondition(condition);

            this._conditions.push(condition);
        },

        /**
         * Удалить условие
         * @param {Object} condition Представление условия
         */
        removeCondition: function(condition){
            if(this.selected === condition){
                this.selected = null;
            }

            this._conditions.remove(condition);
            condition.el.destroy();
            this.setFormData({s:{}});

            this.component.dataScroll.defer(1, this.component);
        },

        /**
         * Выбрать условие
         * @param {Object} condition Представление условия
         */
        selectCondition: function(condition){
            this.view.getBox('body.conditions').find('.active').removeClass('active');
            condition.el.addClass('active');

            this.selected = condition;
            this.setFormData(condition.data);
            this.onOperationChange();
        },

        /**
         * Выставить значения текущего условия
         * @param {Object} data Значения представления
         */
        setFormData: function(data){
            this.cData.setValue(data.f, true);
            this.fValue1.setValue(data.v1, true);
            this.fValue2.setValue(data.v2, true);
            this.cOperation.setValue(data.o, true);
            this.fStyleColor.setValue(data.s.color, true);
            this.fStyleBackground.setValue(data.s.backgroundColor, true);
        },

        /**
         * Обработчик события выбора типа условия
         */
        onOperationChange: function(){
            if(this.cOperation.value.interval){
                this.fValue2.show();
            } else {
                this.fValue2.hide();
                this.fValue2.setValue(null);
            }
        },

        /**
         * Обработчик события готовности менеджера представлений OLAP куба
         * @param {ui.olap.Layout} layout Менеджер представлений OLAP куба
         */
        onLayoutReady: function(layout){
            layout.on('get', function(data){
                data.sc = [];

                ui.each(this._conditions, function(condition){
                    data.sc.push(condition.data);
                });
            }, this);

            layout.on('update', function(data){
                this.selected = null;
                this.renderConditions(data.sc);
            }, this);

            layout.on('clear', this.clearData, this);
        },

        /**
         * Обработчик события формирования ячейки OLAP куба
         * @param {jQueryElement} cell Контайнер ячейки
         * @param {Object} val Описание значения ячейки
         * @param {ui.olap.Olap} olap OLAP куб
         * @param {Number} x Индекс столбца OLAP куба
         * @param {Number} y Индекс строки OLAP куба
         */
        onRenderCell: function(cell, val, olap, x, y){
            var col = olap.getColumn(x),
                tmp = {},
                ops = ui.array(ui.olap.plugins.StyleConditions.Combo.prototype.data),
                getOperation = function(code){
                    if(!tmp[code]) tmp[code] = ops.findOne({ code: code }).test;

                    return tmp[code];
                };

            ui.each(this._conditions, function(cnd){
                var op,
                    d = cnd.data;

                if(col.field.dataIndex == d.f){
                    op = getOperation(d.o);

                    if(op && op(val.value, d.v1, d.v2)){
                        cell.css(d.s);
                        return false;
                    }
                }
            });
        }
    }
});
