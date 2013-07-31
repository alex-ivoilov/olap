ui.define({
    name: 'ui.core.EventsManager',
    base: 'base',
    data: {
        init: function(){
            this.base();
            this.initResize();

            var me = this;

            ui.global.jqueryEvents.each(function(name){
                $(document).bind(name, function(e){ me.fire(name, e); });
            });
        },

        initResize: function(){
            var rtime = new Date(1, 1, 2000),
                timeout = false,
                delta = 200,
                fn = function(){
                    if (new Date() - rtime < delta) {
                        setTimeout(fn, delta);
                    } else {
                        timeout = false;
                        this.fire('resizeEnd');
                    }
                }.delegate(this);

            $(window).resize(function() {
                rtime = new Date();

                if (timeout === false) {
                    timeout = true;
                    setTimeout(fn, delta);
                }
            });
        },

        on: function (name, fn, scope) {
            var event = this.base(name, fn, scope);

            if(scope instanceof ui.Base){
                scope.on('destroy', function(){
                    this.un(name, event);
                }, this);
            }

            return event;
        }
    }
});
ui.EventsManager = new ui.core.EventsManager();
