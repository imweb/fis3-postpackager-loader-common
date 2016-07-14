
fis.project.setProjectRoot('src');
fis.processCWD = fis.project.getProjectPath();

fis.hook('commonjs')
    .match('**.js', {
        isMod: true
    })
    .match('mod.js', {
        isMod: false
    });

fis.media('dev')
    .match('::package', {
        postpackager: [
            fis.plugin('loader', {
                resourceType: 'commonJs'
            })
        ]
    })
    .match('**', {
        deploy: [
            fis.plugin('local-deliver', {
                to: '../dev'
            })
        ]
    });

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
    })
    .match('**', {
        deploy: [
            fis.plugin('local-deliver', {
                to: '../dist'
            })
        ]
    });

