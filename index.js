
var resource = null;
try {
    resource = fis.require('postpackager-loader/lib/resource');
} catch (ex) {
}

var rBody = /<\/body>/i;
var COMMON_MAIN = 1;
var COMMON_FILE = 2;
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
    // 打包文件
    settings.main.forEach(function(subpath) {
        var file = ret.src[subpath];
        var res = getResource(file, ret);
        var content = [];
        res.forEach(function(dep) {
            content.push(dep.getContent());
            dep.map.pkg = file.getId();
            packed[dep.getId()] = COMMON_FILE;
        });
        content.push(file.getContent());
        // 设置文件
        file.setContent(content.join('\n'));
        packed[file.getId()] = COMMON_MAIN;
    });

    // 向html注入打包文件的链接
    Object.keys(ret.src).forEach(function(subpath) {
        var file = ret.src[subpath];
        if (file.release !== false && file.isHtmlLike) {
            var main = getResource(file, ret).filter(function(dep) {
                return packed[dep.getId()] === COMMON_MAIN 
                    && file.links.indexOf(dep.subpath) === -1;
            });

            var inject = '';
            main.forEach(function(dep) {
                inject += '<script src="' + dep.getUrl() + '"><!--ignore-->\n';
                file.links.push(dep.subpath);
            });
            var content = file.getContent().replace(rBody, function(str) {
                return inject + str;
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
    // 打包文件入口
    main: [] 
};

module.exports = packager;

