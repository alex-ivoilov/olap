(function ($) {

    var hasIntrospection = (function () { _ }).toString().indexOf('_') > -1,
	needCheckProps = $.browser.msie,
	specProps = needCheckProps ? ['toString', 'valueOf'] : null,
	emptyBase = function () { };

    function override(base, result, add) {

        var hasSpecProps = false;
        if (needCheckProps) {
            var addList = [];
            $.each(specProps, function () {
                add.hasOwnProperty(this) && (hasSpecProps = true) && addList.push({
                    name: this,
                    val: add[this]
                });
            });
            if (hasSpecProps) {
                $.each(add, function (name) {
                    addList.push({
                        name: name,
                        val: this
                    });
                });
                add = addList;
            }
        }

        $.each(add, function (name, prop) {
            if (hasSpecProps) {
                name = prop.name;
                prop = prop.val;
            }
            if ($.isFunction(base[name]) && $.isFunction(prop) &&
		   (!hasIntrospection || prop.toString().indexOf('.base') > -1)) {

                var baseMethod = base[name];
                result[name] = function () {
                    var baseSaved = this.base;
                    this.base = baseMethod;
                    var result = prop.apply(this, arguments);
                    this.base = baseSaved;
                    return result;
                };

            }
            else {
                result[name] = prop;
            }

        });

    }

    $.inherit = function () {

        var withMixins = $.isArray(arguments[0]),
		hasBase = withMixins || $.isFunction(arguments[0]),
		base = hasBase ? withMixins ? arguments[0][0] : arguments[0] : emptyBase,
		props = arguments[hasBase ? 1 : 0] || {},
		staticProps = arguments[hasBase ? 2 : 1],
		result = props.init || (hasBase && base.prototype.init) ?
			function () {
			    this.init.apply(this, arguments || [{}]);
			} : function () { };

        if (!hasBase) {
            result.prototype = props;
            result.prototype.global = result.prototype.constructor = result;
            return $.extend(result, staticProps);
        }

        $.extend(result, base);

        var inheritance = function () { },
		basePtp = base.prototype;
        inheritance.prototype = base.prototype;
        result.prototype = new inheritance();
        var resultPtp = result.prototype;
        resultPtp.global = resultPtp.constructor = result;

        override(basePtp, resultPtp, props);
        staticProps && override(base, result, staticProps);

        if (withMixins) {
            var i = 1, mixins = arguments[0], mixin, __constructors = [];
            while (mixin = mixins[i++]) {
                $.each(mixin.prototype, function (propName) {
                    if (propName == 'init') {
                        __constructors.push(this);
                    }
                    else if (propName != 'global') {
                        resultPtp[propName] = this;
                    }
                });
            }
            if (__constructors.length > 0) {
                resultPtp.init && __constructors.push(resultPtp.init);
                resultPtp.init = function () {
                    var i = 0, init;
                    while (init = __constructors[i++]) {
                        init.apply(this, arguments);
                    }
                };
            }
        }

        return result;

    };

    $.fn.textWidth = function(){
        var html_calc = $('<span>' + $(this).html() + '</span>');
        html_calc.css('font-size',$(this).css('font-size')).hide();
        html_calc.prependTo('body');
        var width = html_calc.width();
        html_calc.remove();
        return width;
    };

})(jQuery);
