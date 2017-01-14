var fskit = require('../fsAsync')

testDir = 'test/'
testFileDir = testDir + 'file/'
;

console.log('test: start');

fskit.writeFile(`${testFileDir}/writeFile/1/2/3/4/5`, '', function(err, rs){
	console.log('write file: ', rs, err)
	
	setTimeout(function(){
		
	!err && fskit.empty(`${testFileDir}`, function(err, rs){
		console.log('empty:', rs, err)
	})
	
	}, 3000)
})



0 && fskit.empty(`${testFileDir}`, function(err, rs){
	console.log('empty:', rs, err)
	
	0 && fskit.mkdir(`${testFileDir}rename/1/2/3/4`, function(err, rs){
		fskit.isDir(`${testFileDir}rename/1/2/3/4`, function(err, rs){
			console.log('mkdir: ', rs, err);
		})
	})
})

0 && fskit.writeFile(`${testFileDir}/rename`, function(err, rs){
	console.log('write file: ', rs, err)
	fskit.rename(`${testFileDir}/rename`, `${testFileDir}/rename`, function(err, rs){
		console.log('rename file: ', rs, err);
	})
})