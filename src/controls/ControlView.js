/**
 * Базовый класс представления контрола
 * @class ui.ControlView
 * @extends ui.Base
 */

ui.define({
    name: 'ui.ControlView',
    type: 'view',
    base: 'base',
    data: {
        labelPositions: ['left','right','top','bottom'],
        defaultLabelPosition: 'right',
        disabled: false,
        readOnly: false,
        active: false,

        /**
         * Конструктор представления контрола
         * @constructor
         * @param {ui.Control} control Контрол
         */
        init: function(control){
            
            this.base({
                boxes: {},
                control: control,
                parent: control.el,
                cls: control.cls
            });

            this.viewConfig().each(function(box){
                this.setBox(box, this.control);
            }, this);

            control.on('update', this.update, this);
            
            ui.EventsManager.on('resizeEnd', this.update, this);
        },

        /**
         * Описание разметки контрола
         * @returns {Array} Описание разметки
         */
        viewConfig: function(){
            return [];
        },

        /**
         * Обновить представление
         */
        update: function(){
            this.fire('viewUpdate');
        },

        /**
         * Заблокировать/Разблокировать контрол
         * @param {Boolean} disabled Контрол заблокирован
         */
        setDisabled: function(disabled){
            var cls = this.cls+'-disabled';

            this.disabled = disabled;

            if(disabled === true){
                this.parent.addClass(cls);
            } else {
                this.parent.removeClass(cls);
            }
        },

        /**
         * Запретить/Разрешить редактирование контрола
         * @param {Boolean} readOnly Контрол только для чтения
         */
        setReadOnly: function(readOnly){
            this.readOnly = readOnly;
        },

        /**
         * Создать элемент контрола
         * @param {Object/String} value Описание элемента
         * @param {String/ui.Element} [p] Родительский элемента
         * @param {String} [name] Имя родительского элемента
         * @returns {ui.Element} Элемент контрола
         */
        setBox: function(value, p, name){
            if(ui.isString(p)){
                name = p;
                p = this.getBox(p);
            }

            var boxName = ui.isString(value) ? value : value.name,
                name = name ? name + '.' + boxName : boxName,
                cfg = {
                    name: boxName,
                    parent: p ? p.el : this.parent,
                    cls: this.cls ? this.cls + '-' + boxName : boxName,
                    type: 'element'
                };

            if(!ui.isString(value)) {
                if(value.listeners){
                    value.listeners.scope = value.listeners.scope || this;
                }

                cfg = ui.extend(cfg, value);
            }

            var box = ui.instance(cfg);
            this.boxes[name] = box;

            ui.each(box.items, function(item){
                this.setBox(item, name, ui.isString(name) ? name : name.name);
            }, this);

            return box;
        },

        /**
         * Получить элемент по пути
         * @param {Object/String} value Путь элемента
         * @param {Boolean} [autoCreate] Создать элемент если не найден
         * @param {String} [parent] Путь родительского элемента
         * @returns {ui.Element} Элемент контрола
         */
        getBox: function(value, autoCreate, parent){
            var boxName = ui.isString(value) ? value : value.name,
                boxId = parent ? parent + '.' + boxName : boxName,
                box = this.boxes[boxId];

            if(!box && autoCreate === true){
                var p = parent ? this.getBox(parent) : null;
                box = this.setBox(value, p, parent);
            }

            return box;
        },

        /**
         * Удалить элемент
         * @param {Object/String} name Путь элемента
         */
        removeBox: function(name){
            var box = ui.isString(name) ? this.getBox(name) : name;

            if(box){
                box.destroy();
                delete this.boxes[name];
            }
        },

        /**
         * Получить тело контола
         * @returns {ui.Element} Тело контола
         */
        getBody: function(){
            return this.parent;
        },

        /**
         * Получить элемент отвечающий за перетаскивание контрола
         * @returns {ui.Element} Элемент отвечающий за перетаскивание контрола
         */
        getDragZone: function(){
            return this.getBody();
        },

        /**
         * Получить элемент отвечающий за попадание перетаскиваемого контрола
         * @returns {ui.Element} Элемент
         */
        getDropZone: function(){
            return this.getBody();
        },

        /**
         * Создание элемента подсказки во время перетаскивания
         * @returns {ui.Element/String} Элемент подсказка
         */
        createDragElement: function(){
            return this.type;
        },

        setLabel: function(text, pos){
            if(text){
                this.setLabelPosition(pos);
                var box = this.getBox('label', true);
                box.setHtml(text);
            } else {
                this.removeBox('label');
                this.setLabelPosition(pos);
            }
        },

        setLabelPosition: function(pos){
            var p = this.labelPositions,
                pos = pos || this.defaultLabelPosition;

            p.each(function(i){
                this.parent.removeClass(this.cls+'-'+i);
            },this);

            this.parent.addClass(this.cls+'-'+pos);
        }
    }
});