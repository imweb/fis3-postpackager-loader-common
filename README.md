# fis3-postpackager-loader-common

[fis3-postpackager-loader](https://github.com/fex-team/fis3-postpackager-loader) common文件的便捷打包

## 安装

```bash
npm install fis3-postpackager-loader-common
```

## 使用

```javascript
// fis-conf.js
fis.media('dist')
    .match('::package', {
        postpackager: [
            fis.plugin('loader-common', {
                main: [
                    '/common/lib.js'
                ]
            }),
            fis.plugin('loader', {
                resourceType: 'commonJs',
                allInOne: true
            })
        ]
    });

// lib.js
/**
 * @require 'mod.js'
 * @require './config.js'
 */
```

## 配置说明

* `main` `{Array.<String>}` 需要单独打包文件的入口

## Demo

- [demo](https://github.com/imweb/fis3-postpackager-loader-common/tree/master/demo)

