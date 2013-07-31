/**
 * @class ui.olap.plugins.Chart
 * @extends ui.Base
 *
 * Плагин для OLAP куба
 *
 *      var olap = ui.instance({
 *          type: 'olap',
 *          parent: 'body',
 *          width: 800,
 *          height: 500,
 *          ...
 *          plugins: ['olap.chart']
 *      });
 */
ui.define({
    name: 'ui.olap.plugins.Chart',
    type: 'olap.chart',
    base: 'base',
    data: {
        /**
         * Конструктор
         * @constructor
         * @param {Object} config Параметры инициализации плагина
         */
        init: function(config){
            this.base(config);

            this.component.on('renderEnd', this.onRenderEnd, this);
        },

        /**
         * Сформировать список серий для диаграммы
         * @param selection
         * @returns {Array}
         */
        getSeries: function(selection){
            var series = [];

            ui.each(selection.data, function(data, index){
                series.push({
                    data: data,
                    name: selection.rows[index]
                });
            });

            return series;
        },

        /**
         * Обработчик события создания OLAP куба
         * @param {ui.olap.Olap} olap OLAP куб
         * @private
         */
        onRenderEnd: function(olap){
            if(olap.selection){
                olap.selection.on('selectionchange', this.onSelectionChange, this);
            }
        },

        /**
         * Обработчик события выбора ячеек OLAP куба
         * @param {ui.olap.Selection} sm Менеджер выбора ячеек OLAP куба
         * @param {Object} selection Описание выбранных ячеек
         * @private
         */
        onSelectionChange: function(sm, selection){
            if(this.chartEl){
                this.chartEl.remove();
                delete this.chartEl;
            }

            if(selection){
                this.chartEl = $('<div style="position: absolute;right:50px;top:50px;border:1px solid #000;width:700px;height:500px;"></div>').appendTo('body');
                this.chartEl.highcharts({
                    series: this.getSeries(selection),
                    xAxis: {
                        categories: selection.cols,
                        labels: {
                            style: {
                                fontSize: '10px',
                                fontFamily: 'tahoma, sans-serif'
                            }
                        }
                    },
                    chart: {
                        // column
                        // bar
                        // line
                        // line(inverted: true)
                        // spline
                        // spline(inverted: true)
                        // area
                        // area(inverted: true)
                        // areaspline
                        // areaspline(inverted: true)
                        type: 'bar'
                    },
                    title: {
                        text: null
                    },
                    yAxis: {
                        title: { enabled: false }
                    },
                    tooltip: {
                        style: {
                            fontSize: '10px',
                            width: '250px',
                            wrap:'hard'
                        }
                    },
                    legend: {
                        align: 'right',
                        verticalAlign: 'middle',
                        layout: 'vertical',
                        itemStyle: {
                            width: 250,
                            fontSize: '12px'
                        },
                        borderWidth: 0
                    },
                    exporting: { enabled: false },
                    credits: { enabled: false }
                });
            }
        }
    }
});