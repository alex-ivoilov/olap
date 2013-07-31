ui.define({
    name: 'ui.core.DragAndDropManager',
    base: 'base',
    data: {
        dragControl: null,
        dropControl: null,
        groups: {},

        add: function(element){
            element.on('mousedown', function(el, e){
                ui.selectable(false);
                element.fire('dragStart',[e, element]);

                var moveFn = ui.EventsManager.on('mousemove', function(e){
                    element.fire('drag', [e, element]);
                });

                var upFn = ui.EventsManager.on('mouseup', function(e){
                    element.fire('drop', [e, element]);

                    ui.selectable(true);
                    ui.EventsManager.un('mousemove', moveFn);
                    ui.EventsManager.un('mouseup', upFn);
                });
            });
        },

        addDraggable: function(control, groups){
            var dragZone = control.getDragZone();

            if(ui.isEmpty(groups)){
                groups = ['all'];
            } else if(ui.isString(groups)){
                groups = [groups];
            }

            if(dragZone){
                dragZone.on('mousedown', function(el, e){ this.onDragStart(control, groups, e); }, this);
            }
        },

        addDropZone: function(control, name){
            var dropZone = control.getDropZone(name);

            if(ui.isEmpty(name)){
                name = 'all';
            }

            if(!this.groups[name]){
                this.groups[name] = [];
            }

            this.groups[name].push(control);

            control.on('destroy', function(){
                this.groups[name].remove(control);
            }, this);

            dropZone.on('mouseenter', function(){
                this.dropControl = control;
                control.currentZone = name;

                if(this.dragControl){
                    dropZone.addClass('ui-zone-has-drop');
                }
            }, this);

            dropZone.on('mouseleave', function(){
                if(this.dropControl){
                    this.dropControl.removeClass('ui-hover');
                    this.dropControl.removeClass('ui-right-drop');
                    this.dropControl.removeClass('ui-left-drop');
                }

                this.dropControl = null;
                control.currentZone = null;
                dropZone.removeClass('ui-zone-has-drop');
            }, this);
        },

        onDragStart: function(control, groups, e){
            var controls = this.getControls(groups),
                dragEl = $('<div style="position:absolute;z-index:99999" />')
                    .append(control.createDragElement(e))
                    .css({
                        left: e.clientX + $(window).scrollLeft(),
                        top: e.clientY + $(window).scrollTop()
                    });

            this.dragControl = control;

            var moveFn = ui.EventsManager.on('mousemove', function(e){
                if(dragEl.parent().length == 0){
                    dragEl.appendTo('body');
                    controls.each(function(c){ c.addClass('ui-has-drop'); });

                    ui.selectable(false);
                }

                dragEl.css({ left: e.clientX + 5, top: e.clientY + 5 });

                var dropControl = this.dropControl;

                if(dropControl){

                    dropControl.removeClass('ui-left-drop');
                    dropControl.removeClass('ui-right-drop');
                    dropControl.addClass(dropControl.el.outerWidth() / 2 > e.layerX ? 'ui-left-drop' : 'ui-right-drop');
                    dropControl.addClass('ui-hover');
                }
            }, this);

            var mouseUpFn = ui.EventsManager.on('mouseup', function(e){
                if (this.dropControl
                    && controls.contains(this.dropControl) !== false
                    && this.dropControl !== this.dragControl) {

                    var drop = this.dropControl,
                        pos = drop.hasClass('ui-right-drop') ? 'after' : 'before';


                    drop.fire('drop', [control, e, pos, drop.currentZone]);
                    control.fire('dragdrop', [drop, e, pos, drop.currentZone]);

                    dragEl.remove();
                } else {
                    var offset = control.getDragZone().offset();
                    dragEl.animate({ left: offset.left, top: offset.top }, function(){ dragEl.remove(); });
                }

                ui.selectable(true);
                this.dragControl = null;

                controls.each(function(c){ c.removeClass('ui-has-drop'); });

                ui.EventsManager.un('mousemove', moveFn);
                ui.EventsManager.un('mouseup', mouseUpFn);
            }, this);
        },

        getControls: function(groups){
            var controls = [];

            groups.each(function(g){
                if(this.groups[g]){
                    controls = controls.concat(this.groups[g]);
                }
            }, this);

            return controls;
        }
    }
});
ui.DragAndDropManager = new ui.core.DragAndDropManager();