module.exports = function(server){

	server.add({
		domain: ''
		, root: 'app/'
		, port: 80
	})

	server.add({
		domain: 'localhost'
		, root: 'app/'
		, port: 80
	})




}