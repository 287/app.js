var fs = require('fs')
, fsAsync = require('./fsAsync')
, fsSync = require('./fsSync')
, fsPath = require('./fsPath')
, fsUtils = require('./fsUtils')
;

/**
	support method
	
	fskit
		isExists
		isFile
		isDir
		
		readFile
		writeFile
		
		get
		set
		append
		gets
		sets
		getList, readdir
		
		mkdir
		touch
		unlink
		rmdir
		empty
		remove
		
		copy
		move, rename
		
		watch
		
		common
			dirname
			filename
			basename
			extname
			
			fixPath
			fixDirPath
			realPath
			isAbsolutePath
			
			cwd
		
		utils
			decode
			encode
			globTest
			filter
*/

module.exports = Object.assign({}, fs, fsAsync, fsPath, fsUtils, {
	fs: fs
	, sync: fsSync
});