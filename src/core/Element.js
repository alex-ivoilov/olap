/**
 * @class ui.Element
 * @extends ui.Base
 * Класс обертка над DOM элементом с поддержкой jQuery
 */

/**
 * Начало отрисовки DOM элемента
 * @event renderStart
 * @param {ui.Element} this DOM элемент
 */

/**
 * Окончание отрисовка DOM элемента
 * @event renderEnd
 * @param {ui.Element} this DOM элемент
 */

/**
 * Изменение DOM модели элемента
 * @event domUpdate
 * @param {ui.Element} this DOM элемент
 */

/**
 * Вызывается при отображении DOM элемента
 * @event show
 * @param {ui.Element} this DOM элемент
 */

/**
 * Вызывается при скрытии DOM элемента
 * @event hide
 * @param {ui.Element} this DOM элемент
 */

/**
 * Вызывается при уничтожении DOM элемента
 * @event destroy
 */

ui.define({
    name: 'ui.Element',
    type: 'element',
    base: 'base',
    data: {
        /**
         * @cfg {String} tag
         * Тег DOM элемента
         */
        tag: 'div',

        /**
         * @cfg {String} cls
         * Наименование класса DOM элемента
         */
        cls: null,

        /**
         * @cfg {Boolean} autoRender
         * Отрисовывать элемент при инициализации
         */
        autoRender: true,

        /**
         * @cfg {String} html
         * HTML разметка DOM элемента
         */
        html: null,

        /**
         * @cfg {String/ui.Element/jQueryElement/HTMLElement} parent
         * Родитель DOM элемента
         */
        parent: null,

        /**
         * @cfg {String/Object} style
         * Словарь стилей DOM элемента
         */
        style: null,

        /**
         * @cfg {String/Number} width
         * Ширина DOM элемента
         */
        width:null,

        /**
         * @cfg {String/Number} minWidth
         * Минимальная ширина DOM элемента
         */
        minWidth:null,

        /**
         * @cfg {String/Number} maxWidth
         * Максимальнач ширина DOM элемента
         */
        maxWidth:null,

        /**
         * @cfg {String/Number} height
         * Высота DOM элемента
         */
        height:null,

        /**
         * @cfg {String/Number} minHeight
         * Минимальная высота DOM элемента
         */
        minHeight:null,

        /**
         * @cfg {String/Number} maxHeight
         * Максимальнач высота DOM элемента
         */
        maxHeight:null,

        /**
         * @cfg {Boolean} fit
         * Растянуть DOM элемент по размерам родителя
         */
        fit: false,

        /**
         * @cfg {Boolean} hidden
         * Скрыть DOM элемент при инициализации
         */
        hidden: false,

        /**
         * @property {Boolean}
         * DOM элемент отрисован
         */
        rendered: false,


        /**
         * @property {jQueryElement}
         * jQueryElement элемент
         *      this.el.animate({ left: 100, top: 100 }, 'fast');
         */
        el: null,

        /**
         * Конструктор класса
         * @param {Object} config Параметры инициализации
         * @constructor
         */
        init: function(cfg){
            cfg = cfg || {};

            this.base(cfg);
            
            if(cfg.el){
                this.rendered = true;
                this.parent = $(cfg.el).parent();
                this.initJqueryEvents();
            }
            
            this.el = $(cfg.el ? cfg.el : '<'+this.tag+'/>');

            if (this.hidden) {
                this.hide();
            }

            if(this.autoRender !== false && this.parent){
                this.doRender();
            }
        },

        /**
         * Отрисовать DOM элемент если он не отрисован, проверить родителя
         */
        doRender: function(){
            if(!this.rendered){
                this.setParent(this.parent);
                this.fire('renderStart', this);
                this.render();
                this.rendered = true;
                this.setWidth(this.width);
                this.setHeight(this.height);
                this.el.appendTo(this.parent);
                this.fire('renderEnd', this);
            } else if(this.checkParent()){
                this.el.appendTo(this.parent);
            }
        },

        /**
         * Проверить изменение родителя DOM элемента
         * @returns {Boolean} результат проверки
         */
        checkParent: function(){
            var p = this.el.parent().length > 0 ? this.el.parent()[0] : this.el.parent(),
                tp = this.parent && this.parent.length > 0 ? this.parent[0] : this.parent;

            return p !== tp;
        },

        /**
         * Отрисовать DOM элемент
         * @protected
         */
        render: function(){
            if(this.domAttributes){
                ui.each(this.domAttributes, function(val, key){
                    this.attr(key, val);
                }, this);
            }

            this.addClass(this.cls);

            if(this.extraCls){
                this.addClass(this.extraCls)
            }

            if(!ui.isEmpty(this.html)) { this.setHtml(this.html); }
            if(this.style){ this.css(this.style); }

            if(this.fit){
                this.addClass('ui-fit');
            }

            this.setTop(this.top);
            this.setBottom(this.bottom);
            this.setLeft(this.left);
            this.setRight(this.right);

            this.initJqueryEvents();
        },

        /**
         * Выставить родителя DOM элемента
         * @param {String/ui.Element/jQueryElement/HTMLElement} parent родительский элемент
         */
        setParent: function(parent){
            if(!parent) { return; }

            if(ui.isString(parent)){
                parent = $(parent);
            } else if(ui.isControl(parent)){
                parent.doRender();
                parent = parent.getBody().el;
            } else if(parent instanceof ui.Element){
                parent = parent.el;
            }

            this.parent = parent;
        },

        /**
         * Изменить HTML разметку DOM элемента
         * @param {String} html разметка DOM элемента
         */
        setHtml: function(html){
            this.el.html(html);
        },

        /**
         * Получить HTML разметку DOM элемента
         * @return {String} разметка DOM элемента
         */
        getHtml: function(){
            return this.el.html();
        },

        /**
         * Получить DOM элемент
         * @returns {HTMLElement} DOM элемент
         */
        getDom: function(){
            if(this.rendered){
                return this.el[0];
            }

            return null;
        },

        /**
         * Проверить содержиться ли DOM элемент во всех дочерних элментах
         * @param {HTMLElement} dom искомый элемент
         * @returns {Boolean} результат поиска
         */
        hasDom: function(dom){
            if(this.getDom() === dom){
                return true;
            }

            var hasDom = false,
                els = ui.toArray(this.find('*'));

            els.each(function(el){
                if(el === dom){
                    hasDom = true;
                    return false;
                }
            });

            return hasDom;
        },

        /**
         * Установить ширину DOM элемента
         * @param {Number/String} w ширина элемента
         */
        setWidth: function(w){
            if(!this.el){
                return;
            }
            
            if(!ui.isString(w)){
                if(this.minWidth !== null && w < this.minWidth){
                    w = this.minWidth;
                }
                if(this.maxWidth !== null && w > this.maxWidth){
                    w = this.maxWidth;
                }
            }

            this.el.width(w);
        },

        /**
         * Установить высоту DOM элемента
         * @param {Number/String} h высота элемента
         */
        setHeight: function(h){
            if(!this.el){
                return;
            }

            if(!ui.isString(h)){
                if(this.minHeight !== null && h < this.minHeight){
                    h = this.minHeight;
                }
                if(this.maxHeight !== null && h > this.maxHeight){
                    h = this.maxHeight;
                }
            }

            this.el.height(h);
        },

        /**
         * Установить верхнюю абсолютную координату DOM элемента
         * @param {Number/String} top верхняя координата
         */
        setTop: function(top){
            if(!ui.isEmpty(top)){
                this.css({position:'absolute', top:top});
            }
        },

        /**
         * Установить нижнюю абсолютную координату DOM элемента
         * @param {Number/String} bottom нижняя координата
         */
        setBottom: function(bottom){
            if(!ui.isEmpty(bottom)){
                this.css({position:'absolute', bottom: bottom});
            }
        },

        /**
         * Установить левую абсолютную координату DOM элемента
         * @param {Number/String} left левая координата
         */
        setLeft: function(left){
            if(!ui.isEmpty(left)){
                this.css({position:'absolute', left: left});
            }
        },

        /**
         * Установить правую абсолютную координату DOM элемента
         * @param {Number/String} right правая координата
         */
        setRight: function(right){
            if(!ui.isEmpty(right)){
                this.css({position:'absolute', right: right});
            }
        },

        /**
         * Показать DOM элемент
         */
        show: function(){
            this.doRender();
            this.el.show();
            this.fire('show', this);
        },

        /**
         * Скрыть DOM элемент
         */
        hide: function(){
            this.el.hide();
            this.fire('hide', this);
        },

        /**
         * Скрыть/Показать DOM элемент
         */
        toggle: function(){
            if(this.el.css('display') == 'none'){
                this.show();
            } else {
                this.hide();
            }
        },

        /**
         * Изменить родителя элемента
         * @param {String/ui.Element/jQueryElement/HTMLElement} el родительский элемент
         */
        appendTo: function(el){
            this.setParent(el);
            this.doRender();
            this.fire('domUpdate', this);
        },

        /**
         * Отметить DOM элемент как активный/неактивный
         * @param {Boolean} active DOM элемент активный
         */
        setActive: function(active){
            var cls = this.cls+'-active';

            if(active === true){
                this.addClass(cls);
            } else {
                this.removeClass(cls);
            }

            this.active = active;
        },

        /**
         * Уничтожить DOM элемент
         */
        destroy: function(){
            if(this.el){
                this.el.remove();
            }
            
            this.base();
        },

        /** @private */
        initJqueryEvents: function(){
            var events = this.jqueryEvents || ui.global.jqueryEvents,
                me = this;

            events.each(function(name){
                this.el.bind(name, function(){
                    var args = [me].concat(ui.toArray(arguments));
                    me.fire(name, args);
                });
            },this);
        }
    }
});

ui.each(ui.global.jqueryMethods, function(method){
    var m = method;

    if(ui.isString(method)){
        m = {
            name: method,
            jName: method
        };
    }

    ui.Element.prototype[m.name] = function(){
        if(!this.el){ return; }
        var result = this.el[m.jName].apply(this.el, arguments);
        if(this.fire){ this.fire(m.name, this); }
        return result;
    }
});