const Require = require('module-require-loader')

const loader = global.loader = new Require({
	root: __dirname + '/lib/'
	, forceUpdate: false
	, alias: {
		kit: 'kit.dir'
		, Require: Require
	}
});

module.exports = loader.get('server');