/**
 * @class ui.global
 * @singleton
 */
ui.global = {
    /**
     * @property
     * Список событий jQuery поддерживаемых ui.Element
     */
    jqueryEvents: [
        /**
         * Происходит при клике по DOM элементу
         * @event click
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'click',

        /**
         * Происходит при отпускании левой кнопки мыши на DOM элементе
         * @event mouseup
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'mouseup',

        /**
         * Происходит при движение курсора мыши на DOM элементе
         * @event mousemove
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'mousemove',

        /**
         * Происходит при зажатии левой кнопки мыши на DOM элементе
         * @event mousedown
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'mousedown',

        /**
         * Происходит при попадании курсора мыши на DOM элементе
         * @event mouseenter
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'mouseenter',

        /**
         * Происходит при выхождении курсора мыши на DOM элементе
         * @event mouseleave
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'mouseleave',

        /**
         * mousewheel
         * @event mousewheel
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'mousewheel',

        /**
         * Происходит при установке фокуса на DOM элемент
         * @event focus
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'focus',

        /**
         * Происходит при снятие фокуса с DOM элемента
         * @event blur
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'blur',

        /**
         * Происходит при отпускании клавиши
         * @event keyup
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'keyup',

        /**
         * Происходит при нажатии на клавишу
         * @event keypress
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'keypress',

        /**
         * Происходит при прокрутке ползунка
         * @event scroll
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'scroll',


        /**
         * Происходит при загрузке элемента
         * @event load
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         */
        'load',

        /**
         * Происходит при двойном клике по DOM элементу
         * @event dblclick
         * @member ui.Element
         * @param {ui.Element} this DOM элемент
         * @param {Object} e Данные события
         */
        'dblclick'
    ],

    /**
     * @property
     * Список методов jQuery поддерживаемых ui.Element
     */
    jqueryMethods: [
        /**
         * ##jQuery метод
         * Выставить атрибут DOM элементу
         *
         * @method attr
         * @param {String} name Имя аттрибута
         * @param {Object} [value] Значение атрибута
         * @member ui.Element
         * @returns {Object} Значение атрибута
         */
        'attr',

        /**
         * ##jQuery метод
         * Получить координаты DOM элемента
         *
         * @method offset
         * @member ui.Element
         */
        'offset',

        /**
         * ##jQuery метод
         * Выполненить анимацию
         *
         * @method animate
         * @param {Object} config Конфигурация анимации
         * @param {Function} [callback] Функция по завершению анимации
         * @member ui.Element
         */
        'animate',

        /**
         * ##jQuery метод
         * Остановить выполнение текущей анимации
         *
         * @method stop
         * @member ui.Element
         */
        'stop',

        /**
         * ##jQuery метод
         * Добавить DOM элемент в конец
         *
         * @method append
         * @param {HTMLElement/jQueryElement} element DOM элемент
         * @member ui.Element
         */
        'append',

        /**
         * ##jQuery метод
         * Добавить DOM элемент в начало
         *
         * @method before
         * @param {HTMLElement/jQueryElement} element DOM элемент
         * @member ui.Element
         */
        'before',

        /**
         * ##jQuery метод
         * Очистить HTML разметку DOM элементу
         *
         * @method empty
         * @member ui.Element
         */
        'empty',

        /**
         * ##jQuery метод
         * Выставить CSS стили DOM элементу
         *
         * @method css
         * @param {Object/String} style CSS стили элемента
         * @member ui.Element
         */
        'css',

        /**
         * ##jQuery метод
         * Производит по DOM элементу
         *
         * @method find
         * @param {String} selector CSS селектор
         * @member ui.Element
         */
        'find',

        /**
         * ##jQuery метод
         * Производит клик по DOM элементу
         *      this.on('click', function(){
             *          alert('Клик!');
             *      }, this);
         *
         *      this.click();
         *
         * @method click
         * @member ui.Element
         */
        'click',

        /**
         * ##jQuery метод
         * Добавить CSS класс DOM элементу
         *
         * @method addClass
         * @param {String} cls Имя класса
         * @member ui.Element
         */
        'addClass',

        /**
         * ##jQuery метод
         * Удалить CSS класс DOM элементу
         *
         * @method removeClass
         * @param {String} cls Имя класса
         * @member ui.Element
         */
        'removeClass',

        /**
         * ##jQuery метод
         * DOM элемент содержит CSS класс
         *
         * @method hasClass
         * @param {String} cls Имя класса
         * @member ui.Element
         * @return {Boolean} Результат поиска
         */
        'hasClass',

        /**
         * ##jQuery метод
         * Ширина DOM элемента с учетом отступов
         *
         * @method outerWidth
         * @member ui.Element
         * @return {Number} Ширина DOM элемента
         */
        'outerWidth',

        /**
         * ##jQuery метод
         * Высота DOM элемента с учетом отступов
         *
         * @method outerHeight
         * @member ui.Element
         * @return {Number} Высота DOM элемента
         */
        'outerHeight',

        /**
         * ##jQuery метод
         * Установить/Получить количество промотанных пикселей по горизонтали
         *
         * @method scrollLeft
         * @param {Number} left Количество промотанных пикселей по горизонтали
         * @member ui.Element
         * @return {Number} Количество промотанных пикселей по горизонтали
         */
        'scrollLeft',

        /**
         * ##jQuery метод
         * Установить/Получить количество промотанных пикселей по вертикали
         *
         * @method scrollTop
         * @param {Number} top Количество промотанных пикселей по вертикали
         * @member ui.Element
         * @return {Number} Количество промотанных пикселей по вертикали
         */
        'scrollTop'
    ]
};