
var _ = fis.util;
var resource = null;
try {
    resource = fis.require('postpackager-loader/lib/resource');
} catch (ex) {
}

var rBody = /<\/body>/i;
var COMMON_FILE = 1;
var COMMON_MAIN = 2;
var packed = {};

// 扩展拦截loader的依赖资源添加函数
resource && resource.extend({
    add: function(id, deffer, withPkg, attrs) {
        // 忽略已经打包了的文件
        if (!packed[id]) {
            this.__super.apply(this, arguments);
        }
    }
});

/**
 * 打包器
 */
function packager(ret, pack, settings, opt) {
    packed = {};

    var mainMap = settings.main;
    var mainList = _.sortBy(
            Object.keys(mainMap)
                .map(function(subpath) {
                    return mainMap[subpath] = _.extend(
                        {
                            priority: 0, // 优先级
                            order: 0, // html链接优先级
                            all: false, 
                            subpath: subpath
                        }, 
                        mainMap[subpath] === true ? {} : mainMap[subpath]
                    );
                }),
            'priority'
        )
        .reverse();

    // 打包文件
    mainList.forEach(function(item) {
        var file = ret.src[item.subpath];
        var res = getResource(file, ret);
        var content = [];
        res.forEach(function(dep) {
            if (!packed[dep.getId()] || item.all) {
                content.push(dep.getContent());
                dep.map.pkg = file.getId();
                packed[dep.getId()] = Math.max(packed[dep.getId()] || 0, COMMON_FILE);
            }
        });
        content.push(file.getContent());
        // 设置文件
        file.setContent(content.join('\n'));
        // fis getHash太蛋疼了setContent不会自动刷新hash, 而且编译之后就生成了不能更改
        file.getHash = function() {
            if (!this._packageHash) {
                this._packageHash = fis.util.md5(this.getContent());
            }
            return this._packageHash;
        };
        var _setContent = file.setContent;
        file.setContent = function() {
            file._packageHash = null;
            return _setContent.apply(this, arguments);
        };
        packed[file.getId()] = COMMON_MAIN;
    });

    // 向html注入打包文件的链接
    Object.keys(ret.src).forEach(function(subpath) {
        var file = ret.src[subpath];
        if (file.release !== false && file.isHtmlLike) {
            var inject = getResource(file, ret)
                .filter(function(dep) {
                    return packed[dep.getId()] === COMMON_MAIN 
                        && file.links.indexOf(dep.subpath) === -1;
                })
                .map(function(dep) {
                    file.links.push(dep.subpath);
                    return {
                        code: '<script src="' + dep.getUrl() + '"></script><!--ignore-->\n',
                        order: mainMap[dep.subpath].order
                    };
                });
            inject = _.sortBy(inject, 'order')
                .reverse()
                .map(function(o) {
                    return o.code;
                });
            var content = file.getContent().replace(rBody, function(str) {
                return inject.join('') + str;
            });
            file.setContent(content);
        }
    });
}

/**
 * 获取所有的依赖
 * @param {Object} file source file
 * @param {Object} ret 
 * @return {Array.<File>} 
 */
function getResource(file, ret) {
    var res = [],
        added = {};

    function add(item) {
        if (!added[item.subpath]) {
            added[item.subpath] = true;
            item.requires.forEach(function(id) {
                if (ret.ids[id]) {
                    add(ret.ids[id]);
                }
            });
            // ignore self
            if (file.subpath !== item.subpath) {
                res.push(item);
            }
        }
    }

    add(file);
    return res;
}

// 默认配置信息
packager.defaultOptions = {
    //
    /**
     * @type {Object} 打包文件入口
     * {
     *     '/modules/common/lib.cdn.js': {
     *         priority: 0, // 打包优先级
     *         order: 0, // 嵌入html文件中的优先级
     *         all: false // 即使依赖已打包至优先级更高的包任然打包它
     *     }
     * }
     */
    main: {}
};

module.exports = packager;

