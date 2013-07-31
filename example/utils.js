document.ondblclick = function() {
    if (window.getSelection)
        window.getSelection().removeAllRanges();
    else if (document.selection)
        document.selection.empty();
};

olap.on('layout', function(){
    var layoutsBody = $('#example-layouts'),
        conditionsBody = $('#example-conditions'),
        exportBody = $('#example-export'),
        layout = olap.layout,
        btn = function(text){
            return $('<div class="ui-btn example-btn"><span class="text">'+text+'</span></div>');
        },
        showMenu = function(btn, drawItems){
            var menu = ui.instance({
                type: 'element',
                el: $('<div class="ui-btn-menu"></div>')
            });

            btn = ui.instance({
                type: 'element',
                el: btn
            });

            if(drawItems(menu.el) !== false){
                menu.appendTo('body');
                menu.css({
                    left: btn.offset().left,
                    top: btn.offset().top + 22
                });

                var fn = ui.EventsManager.on('click', function(e){
                    if(menu.destroyed){
                        ui.EventsManager.un(fn);
                        return;
                    }

                    if(!menu.hasDom(e.target) && !btn.hasDom(e.target)){
                        menu.destroy();
                        ui.EventsManager.un(fn);
                    }
                });
            }
        };

    btn('Сохранить').click(function(){
        var name = prompt('Layout name');
        if(name && name != '') layout.save(name);
    }).appendTo(layoutsBody);

    btn('Загрузить').click(function(){
        showMenu($(this), function(menu){
            var layouts = layout.getLayouts();

            if(Object.keys(layouts).length){
                ui.each(layout.getLayouts(), function(data, key){
                    var item = $('<div class="item"/>').appendTo(menu);

                    $('<div class="text"/>').html(key).click(function(){
                        layout.setLayout(key);
                        menu.remove();
                    }).appendTo(item);
                    $('<div class="ui-close"/>').click(function(){
                        layout.removeLayout(key);
                        menu.remove();
                    }).appendTo(item);
                });
            } else {
                return false;
            }

        });
    }).appendTo(layoutsBody).addClass('menu');

    btn('Сбросить').click(function(){
        layout.clear();
    }).appendTo(layoutsBody);

    btn('Редактор').click(function(){
        olap.fire('styleConditionsShow');
    }).appendTo(conditionsBody);

    btn('Сбросить').click(function(){
        olap.fire('styleConditionsClear');
    }).appendTo(conditionsBody);

    btn('HTML').click(function(){
        var exporter = new ui.olap.exporters.HTML({ olap: olap });
        exporter.exportOlap();
    }).appendTo(exportBody);

    btn('XSLX').click(function(){
        var exporter = new ui.olap.exporters.XLSX({ olap: olap });
        exporter.exportOlap();
    }).appendTo(exportBody);
});

olap.doRender();