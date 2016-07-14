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
                main: {
                    '/common/lib.js': true
                }
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

- `main` `{Object.<String,Object|Boolean>}` 需要单独打包文件的入口
    - key subpath
    - value 配置项
        - priority `Number` `default` `0` 打包优先级
        - order `Number` `default` `0` 嵌入html文件中的优先级
        - all: `Boolean` `default` `false` 即使依赖已打包至优先级更高的包任然打包包含它

## Demo

- [demo](https://github.com/imweb/fis3-postpackager-loader-common/tree/master/demo)

