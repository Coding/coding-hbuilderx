const shell = require('shelljs')

shell.pushd('./webviews')
shell.exec('yarn')

shell.popd()
shell.exec('yarn')
shell.exec('yarn build')

shell.mkdir('-p', ['./temp/out', './temp/node_modules'])
shell.cp('-Rf', './out/*', './temp/out/')

shell.exec('yarn --prod=true')
shell.cp('-Rf', './node_modules/*', './temp/node_modules/')

shell.cp('./package.json', './temp/')
shell.cp('./LICENSE', './temp/')
