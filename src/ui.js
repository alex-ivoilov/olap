/**
 * @class ui
 * @singleton
 */
var ui = {

    guids: {},

    types: {},

    theme: {},

    emptyFn: function () { },

    charset: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',

    key: {
        Enter: 13,
        Esc: 27
    },

    /**
     * Сгенерировать случайный идентификатор
     * @returns {String} Индентификатор
     */
    guid: function () {
        var guid = [],
            i = 0;

        for (i = 0; i < 10; i++) {
            guid.push(ui.charset.charAt(Math.random() * ui.charset.length));
        }

        guid = guid.join('');

        if (ui.guids[guid]) {
            return ui.guid();
        }

        ui.guids[guid] = 1;

        return guid;
    },

    selectable: function (selectable, obj) {
        var body = obj ? obj : $('body');

        if ($.browser.msie) {
            body.unbind('selectstart');

            if (selectable === false) {
                body.bind('selectstart', function () { return false; });
            }
        }
        else if ($.browser.opera) {
            body.unbind('mousemove');

            if (selectable === false) {
                body.bind('mousemove', function (e) { e.target.ownerDocument.defaultView.getSelection().removeAllRanges(); });
            }
        }
        else {
            if (selectable) {
                body.removeClass('ui-unselectable');
            } else {
                body.addClass('ui-unselectable');
            }
        }
    },

    /**
     * Преобразовать объект в строку
     * @param {Object} data объект с данными
     * @returns {String} преобразованная строка с данными
     */
    toJson: function (data) {
        return $.toJSON(data);
    },

    /**
     * Создать экземпляр класса
     *      var el = ui.instance({
     *          type: 'element',
     *          parent: 'body',
     *          cls: 'el-body'
     *      });
     *
     *      var defaults = {
     *         type: 'element',
     *         parent: el,
     *         width: 200
     *      };
     *
     *      for(var i = 0; i < 10; i++){
     *          ui.instance({ html: 'item ' + i }, defaults);
     *      }
     * @param {Object} item Набор переменных для конструктора
     * @param {Object} [defaults] Набор переменных по умолчанию
     * @param {Function} [type] Базовый класс
     * @returns {ui.Base} Экземпляр класса
     */
    instance: function (item, defaults, type) {
        type = type || ui.Base;

        if (item instanceof type) {
            return item;
        }

        item = ui.extend(ui.extend({}, defaults), item);

        type = ui.getType(item.type);

        if (ui.isFunction(type)) {
            return new type(item);
        }

        console.log("Undefined type " + item.type);
    },

    /**
     * Получить тело документа
     * @returns {ui.Element} Тело документа
     */
    getBody: function () {
        if (!ui.body) {
            ui.body = ui.instance({
                type: 'element',
                el: 'body'
            });
        }

        return ui.body;
    },

    /**
     * Вызываеться при готовности библиотеки
     * @param {Function} callback Функция для вызова
     * @param {Object} [scope] Область видимости
     */
    ready: function (callback, scope) {
        $(ui.delegate(callback, scope));
    },

    /**
     * Зарегистрировать новый класс
     *
     * ##Пример наследования
     *      ui.define({
     *          type: 'localization',
     *          name: 'ns.core.Localization',
     *          data: {
     *              prop1: 'hello',
     *              prop2: 'world',
     *              getWord: function(){
     *                   return this.prop1 + ' ' + this.prop2;
     *              },
     *              say: function(){
     *                  alert(this.getWord());
     *              }
     *          }
     *      });
     *
     *      ui.define({
     *          type: 'localizationRU',
     *          name: 'ns.core.LocalizationRU',
     *          base: 'localization',
     *          data: {
     *              prop1: 'Привет',
     *              prop2: 'Мир'
     *          }
     *      });
     *
     *      ui.define({
     *          type: 'localizationES',
     *          name: 'ns.core.LocalizationES',
     *          base: 'localization',
     *          data: {
     *              prop1: 'Hola',
     *              prop2: 'mundo',
     *              getWord: function(){
     *                  var word = this.base();
     *
     *                  return word + '!';
     *              }
     *          }
     *      });
     *
     *      var en = new ns.core.Localization(),
     *          ru = new ns.core.LocalizationRU(),
     *          es = ui.instance({ type: 'localizationES' });
     *
     *      en.say();
     *      ru.say();
     *      es.say();
     *
     * @param {Object} cfg Описание класса
     * @returns {Function} Конструктор класса
     */
    define: function(cfg){
        var base = ui.isString(cfg.base) ? ui.getType(cfg.base) : cfg.base,
            cls = $.inherit(base || cfg.data, base ? cfg.data : cfg.staticData, cfg.staticData);

        if(ui.isString(cfg.name)){
            ui.namespace(cfg.name, cls);
        }

        if(ui.isString(cfg.type)){
            ui.regType(cfg.type, cls);
        }

        return cls;
    },

    /** @private */
    regType: function (name, type) {
        this.types[name] = type;
    },

    /** @private */
    getType: function (name) {
        return this.types[name];
    },

    /** @private */
    toArray: function (obj) {
        var arr = [];

        for (var i = 0; i < obj.length; i++) {
            arr.push(obj[i]);
        }

        return arr;
    },

    /**
     * Клонировать объект
     * @param {Object} obj Клонируемый объект
     * @returns {Object} Склонированный объект
     */
    clone: function(obj){
        return $.extend(true, {}, obj);
    },

    /**
     * Объекдинить объекты
     * @param {Object} object Основной объект
     * @param {Object} extendData Объект для объединения
     * @param {Boolean} [replace] Заменять данные если у объекта уже определены поля
     * @returns {Object} Объединенный объект
     */
    extend: function(object, extendData, replace) {
        object = object || {};

        for(var k in extendData)
        {
            if(object[k] !== undefined ? replace !== false : true){
                object[k] = extendData[k];
            }
        }

        return object;
    },

    /**
     * Объявить область имен
     * ## Пример 1
     *      ui.namespace('ns.utils.common', {
     *          util1: function(){},
     *          util2: function(){}
     *      });
     *
     *      ns.utils.common.util1();
     *      ns.utils.common.util2();
     *
     * ## Пример 2
     *      var ns = {
     *          utils: {
     *          }
     *      };
     *
     *      ui.namespace('common.util1', function(){}, ns.utils);
     *      ns.utils.common.util1();
     * @param {String} ns Область имен
     * @param {Object} data Переменные
     * @param {Object} [scope=window] Область видимости
     * @param {Boolean} [newObject=true] Создавать пустой объект
     * @returns {Object} Значение области имен
     */
    namespace: function(ns, data, scope, newObject){
        var names = ns ? ns.split('.') : [],
            obj = scope || window;

        names.each(function(name, index){
            if(ui.isEmpty(obj[name]) && newObject !== false){
                obj[name] = {};
            }

            if(names.length - 1 == index && !ui.isEmpty(data)){
                obj[name] = data;
            }

            obj = obj[name];
        });

        return obj;
    },

    /**
     * Объект является массивом
     * @param {Object} obj Объект
     * @returns {Boolean} Объект является массивом
     */
    isArray: function (obj) {
        return obj ? (Object.prototype.toString.call(obj) === '[object Array]' || obj instanceof $) : false;
    },

    /**
     * Объект является массивом и содержит элементы
     * @param {Object} obj Объект
     * @returns {Boolean} Объект является массивом и содержит элементы
     */
    isArrayHasElements: function (obj) {
        return (ui.isArray(obj) && obj.length > 0);
    },

    /**
     * Объект является строкой
     * @param {Object} obj Объект
     * @returns {Boolean} Объект является строкой
     */
    isString: function (obj) {
        return typeof (obj) == 'string';
    },

    /**
     * Объект не определен
     * @param {Object} obj Объект
     * @returns {Boolean} Объект не определен
     */
    isEmpty: function(obj){
        return obj === null || obj === undefined;
    },

    /**
     * Объект является числом
     * @param {Object} obj Объект
     * @returns {Boolean} Объект является числом
     */
    isNumber: function(obj){
        return typeof (obj) == 'number';
    },

    /**
     * Объект является функцией
     * @param {Object} obj Объект
     * @returns {Boolean} Объект является функцией
     */
    isFunction: function (obj) {
        return typeof (obj) == 'function';
    },

    /**
     * Объект является контролом
     * @param {Object} obj Объект
     * @returns {Boolean} Объект является контролом
     */
    isControl: function(obj){
        return obj instanceof ui.Control;
    },

    /**
     * Итерация объекта
     * @param {Array/Object} obj Объект для итерации
     * @param {Function} fn Метод итерации
     * @param {Object} scope Область видимости
     */
    each: function(obj, fn, scope){
        var i, m;

        scope = scope || obj;

        if(ui.isArray(obj)){
            for(i=0,m=obj.length;i<m;i++){
                if (fn.call(scope, obj[i], i) === false) {
                    return;
                }
            }
        } else if(obj){
            for (i in obj) {
                if (fn.call(scope, obj[i], i) === false) {
                    return;
                }
            }
        }
    },

    /**
     * Получить функцию
     * @param {Function} fn Функция
     * @param {Object} scope Область видимости
     * @param {Array/Object} args Аргументы
     * @returns {Function} Функция
     */
    delegate: function(fn, scope, args){
        args = ui.isEmpty(args) ? ui.toArray(arguments) : args;

        return function () {
            if (ui.isArray(args)) {
                return fn.apply(scope, args);
            } else {
                return fn.call(scope, args);
            }
        };
    },

    contains: function (arr, obj) {
        var i = arr.length;

        while (i--) {
            if (arr[i] === obj) {
                return i;
            }
        }
        return false;
    }
};

ui.ns = ui.namespace;

ui.extend(Array.prototype,{
    contains: function (obj) {
        var i = this.length;

        while (i--) {
            if (this[i] === obj) {
                return i;
            }
        }
        return false;
    },
    remove: function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                this.splice(i, 1);
                return i;
            }
        }
    },
    each: function(callback, scope){
        scope = scope || this;

        var i = 0,
            m = this.length;

        for(;i<m;i++){
            if (callback.call(scope, this[i], i) === false) {
                return;
            }
        }
    }
}, false);

ui.extend(Function.prototype,{
    delegate: function(scope, args){
        var fn = this;

        args = ui.isEmpty(args) ? ui.toArray(arguments) : args;

        return function () {
            if (ui.isArray(args)) {
                return fn.apply(scope, args);
            } else {
                return fn.call(scope, args);
            }
        };
    },
    defer: function(time, scope, args){
        setTimeout(this.delegate(scope, args), time);
    }
});