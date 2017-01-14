var fskit = require('../fsAsync')
;

i = 0

fskit.mkdir('test/write/testWriteFile/' + i + '/' + i, function(err, rs){
	console.log(i, err, rs);
})

// [1,2,3,4,5,6].forEach((v, i)=>{
	// fskit.writeFile('test/write/testWriteFile/' + i + '/' + i, v, function(err, rs){
		// console.log(i, err, rs);
	// })
// })


'dir', 'dirnew'