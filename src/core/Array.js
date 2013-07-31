ui.define({
    name: 'ui.Array',
    type: 'array',
    base: 'base',
    data: {
        init: function(arr){
            this.list = arr || [];

            this.base();
        },

        add: function(obj, index){
            if(ui.isEmpty(index)){
                this.list.push(obj);
            } else {
                this.list.splice(index, 0, obj);
            }

            this.fire('add', [obj, this]);
            this.fire('update');

            return obj;
        },

        remove: function(obj){
            var i = this.list.length;

            while (i--) {
                if (this.list[i] === obj) {
                    this.list.splice(i, 1);

                    this.fire('remove', [obj, this]);
                    this.fire('update');

                    return;
                }
            }
        },

        contains: function(obj){
            return ui.contains(this.list, obj);
        },

        each: function(callback, scope){
            ui.each(this.list, callback, scope || this);
        },

        groupBy: function(name, sorters){
            var result = [],
                sorter = ui.array(sorters).findOne({ code: name }),
                tmp = {};

            if(ui.isArray(name)){
                var data = this.groupBy(name[0], sorters);

                name.shift();

                this.groupByArray(name, data, sorters);

                return data;
            }

            this.each(function(item){
                var key = item[name] || '',
                    group = tmp[key];

                if(!group){
                    group = {
                        group: key,
                        code: name,
                        items: []
                    };

                    result.push(group);
                    tmp[key]= group;
                }

                group.items.push(item);
            });

            delete tmp;

            if(sorter){
                result.sort(function(a1,a2){
                    var v1 = a1.group.toLowerCase(),
                        v2 = a2.group.toLowerCase();

                    return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
                });

                if(sorter.dir == 'DESC') result.reverse();
            }

            return result;
        },

        groupByArray: function(groups, data, sorters){
            if(groups.length == 0){
                return;
            }

            var g = groups[0];
            groups.shift();

            ui.each(data, function(item){
                item.items = ui.array(item.items).groupBy(g, sorters);
                this.groupByArray(groups.slice(0), item.items, sorters);
            }, this);
        },

        map: function(query){
            var result = [],
                queryFn = query;

            if(ui.isString(query)){
                queryFn = function(item){
                    return item[query];
                };
            }

            this.each(function(item){
                result.push(queryFn(item));
            });

            return result;
        },

        queryFn: function(item, query){
            var r = true;

            for (var i in query) {
                if(query[i] instanceof Array){
                    r = query[i].contains(item[i]) !== false;
                } else if(query[i] !== ''){
                    r = item[i] == query[i];
                } else {
                    r = item[i] === null || item[i] === undefined;
                }

                if (!r) return r;
            }

            return r;
        },

        find: function(query, callback, scope){
            var me = this,
                result = [],
                arr = this.list,
                queryFn = ui.isFunction(query) ? query : me.queryFn;

            this.each(function(item){
                if(item !== undefined && item !== null && queryFn(item, query)) {
                    result.push(item);
                    if(callback) return callback.apply(scope, [item]);
                }
            }, this);

            return result;
        },

        findOne: function(query){
            var result = null;

            this.find(query, function(item){
                result = item;
                return false;
            });

            return result;
        },

        findAndGroup: function(query, group){
            var arr = ui.array(this.find(query));

            return arr.groupBy(group);
        },

        get: function(index){
            return this.list[index];
        },

        getGroups: function(name){
            var groups = [];

            this.each(function(item){
                if(groups.contains(item[name]) === false) groups.push(item[name]);
            });

            return groups;
        }
    }
});

ui.array = function(arr){
    return new ui.Array(arr);
};