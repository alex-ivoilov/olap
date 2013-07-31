/**
 * @class ui.Base
 * Базовый класс, родитель всех классов
 */
/**
 * @event destroy
 * Вызывается при уничтожении объекта
 */
ui.define({
    name: 'ui.Base',
    type: 'base',
    data: {
        /**
         * @property {Boolean}
         * Объект был уничтожен
         */
        destroyed: null,


        /**
         * Конструктор класса
         * @param {Object} config Параметры инициализации
         * @constructor
         */
        init: function (config) {
            ui.extend(this, config);

            this.initEvents();
            this.initPlugins();
        },

        /**
         * Инициализация плагинов
         * @private
         */
        initPlugins: function(){
            this._plugins = {};

            ui.each(this.plugins, function(config, index){
                var plugin = ui.instance(ui.isString(config) ? { type: config } : config, {
                    component: this
                });

                this.on('destroy', plugin.destroy, plugin);
                this._plugins[config.name || index] = plugin;
            }, this);

            delete this.plugins;
        },

        /**
         * Получить плагин по идентификатору
         * @param {String} id Идентификатор
         * @returns {ui.Base} Плагин
         */
        getPlugin: function(id){
            return this._plugins[id];
        },

        /**
         * Инициализация событий
         * @private
         */
        initEvents: function () {
            this.events = {};

            ui.each(this.listeners, function (event, name) {
                if (name === 'scope') { return; }
                if (ui.isFunction(event)) {
                    this.on(name, event, this.listeners.scope || this);
                } else {
                    this.on(name, event.fn, event.scope || this.listeners.scope);
                }
            }, this);

            delete this.listeners;
        },

        /**
         * Подписаться на событие
         *      this.on('destroy', function(){ alert(this.message); }, { message: 'Объект уничтожен' });
         *
         * @param {String} name Наименование события
         * @param {Function} fn Вызываей метод
         * @param {Object} scope Область видимости
         * @returns {Object} Описание события
         */
        on: function (name, fn, scope) {
            if (!this.events) { this.events = []; }
            if (!this.events[name]) { this.events[name] = []; }

            var eventData = { fn: fn, scope: scope || this, id: ui.guid() };

            this.events[name].push(eventData);

            return eventData;
        },

        /**
         * Отписаться от события
         * @param {String} name Наименование события
         * @param {Object} event Описание события
         */
        un: function (name, event) {
            var events = this.events;

            if (ui.isEmpty(events)) {
                return;
            }

            if (ui.isString(name)) {
                if(event){
                    this.events[name].remove(event);
                } else {
                    delete this.events[name];
                }
            } else {
                ui.each(events, function (val, key) {
                    ui.each(events[key], function (data) {
                        if (data.scope === name) {
                            this.events[key].remove(data);
                        }
                    }, this);
                }, this);
            }
        },

        /**
         * Вызвать событие
         * @param {String} name Наименование события
         * @param {Object/Array} args Аргументы события
         * @returns {Boolean} Результат
         */
        fire: function (name, args) {
            if (!this.events ||
                !this.events[name] ||
                !this.events[name].length)
                return;

            var result;

            for(var i = this.events[name].length-1; i>=0; i--){
                var event = this.events[name][i];
                if(event) result = ui.delegate(event.fn, event.scope, args)();
            }

            return result;
        },

        /**
         * Уничтожить объект
         */
        destroy: function () {
            this.fire('destroy', this);

            for(var p in this){
                delete this[p];
            }

            this.destroyed = true;
        }
    }
});