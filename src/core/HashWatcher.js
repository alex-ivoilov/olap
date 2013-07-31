ui.define({
    name: 'ui.core.HashWatcher',
    base: 'base',
    data: {
        watchTime: 100,
        lastHash: false,
        lastFullHash: false,

        init: function () {
            this.base();
            this.watch();
        },

        getHash: function (full) {
            var arr = window.location.hash.split("#"),
                hashValue = arr[1];

            if (ui.isEmpty(hashValue)) {
                return '';
            }

            if(full !== true){
                hashValue = this.splitHash(hashValue)[0];
            }

            return hashValue;
        },

        splitHash: function(hashValue){
            var hashLen = hashValue.indexOf("?"),
                hash = hashValue,
                hashParam = '';

            if (hashLen > 0) {
                hash = hashValue.substring(0, hashLen);
                hashParam = hashValue.substring(hashLen+1);
            }

            return [hash, hashParam];
        },

        setHash: function (hash, ghost) {
            try {
                if(ghost === true){
                    this.lastFullHash = hash;
                    this.lastHash = this.splitHash(hash)[0];
                }
                window.location.hash = hash;
            } catch (e) {
                console.log(e);
            }
        },

        watch: function () {
            var currentHash = this.getHash(),
                currentFullHash = this.getHash(true);

            if (currentHash !== this.lastHash) {
                this.lastHash = currentHash;
                this.fire('change', currentHash);
            }

            if (currentFullHash !== this.lastFullHash) {
                this.lastFullHash = currentFullHash;
                this.fire('changeParams', [currentFullHash, this.getHashParams()]);
            }

            this.watch.defer(this.watchTime, this);
        },

        getHashParams: function(){
            var result = {},
                reg = /([^\?\#\&]+)\=([^\?\#\&]+)/ig;

            var hash = this.getHash(true);

            if(!hash){
                return result;
            }

            hash.replace(reg, function(found,key,value){
                result[key] = value;
            });

            return result;
        }
    }
});
ui.HashWatcher = new ui.core.HashWatcher();