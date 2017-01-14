#!/usr/bin/env node

'use strict';
let fs = require('fs')
, fsPath = require('path')

, configFile =  'powerfile.js'
, cwd = fixDirPath(process.cwd())
, workspace = cwd
, configPath
, cmd = process.argv[2] || ''
, cmdAlias = {
	v: 'version'
}
;
process.argv[2]
if(cmd.charAt(0) === '-'){
	let json = JSON.parse(fs.readFileSync(fixDirPath(fsPath.dirname(process.argv[1])) + 'package.json').toString());
	cmd = cmd.replace(/^-+/, '');
	cmd = cmdAlias[cmd] || cmd;
	if(cmd === 'h'){
		print('keys:', Object.keys(json))
	}else{
		print(cmd + ': ' + json[cmd]);
	}
}else{
	
	//* just run your powerfile.js
	init();
}


/**
 * console log message
 * @param {string} ...msg
 * @return {undefind}
 */
function print(){
	console.log.apply(console, ['[power-command]'].concat([].slice.call(arguments)))
}


/**
 * get config path
 * @param {string} path
 * @return {string} path parsed
 */
function getConfigPath(path){
	return path + configFile;
}


/**
 * get parent dir list and this dir
 * @param {string} path
 * @return {array<string>} dir path list
 */
function getDirList(path){
	let dirList = []
	, paths
	;
	paths = path.split('/');
	
	paths.forEach((v, i)=>{
		let path = paths.slice(0, paths.length - i).join('/')
		;
		dirList.push(fixDirPath(path));
	});
		
	return dirList;
}


/**
 * parse path to unix like and add '/' in path ending
 * @param {string} path
 * @return {string} path parsed
 */
function fixDirPath(path){
	path = path.replace(/\\/g, '/');
	return path.slice(-1) === '/' ? path : path + '/';
}


/**
 * get current workspace and powerfile path
 * @return {undefined}
 */
function initPowerfile(){
	getDirList(cwd).forEach((dir)=>{
		if(fs.existsSync(getConfigPath(dir))){
			workspace = dir;
			configPath = getConfigPath(dir);
		}
	});
}


/**
 * get current workspace and powerfile path
 * @return {undefined}
 */
function init(){
	initPowerfile();
	
	if(configPath){
		if(workspace !== cwd){
			process.chdir(workspace);
			print('workspace change to ' + workspace)
		}
		
		spawnRun(['node', configPath, '--color'].concat(process.argv.slice(2)), {cwd: workspace});
	}else{
		print('powerfile not found!')
	}
}


/**
 * parse string or stream with this encoding to utf8 encoding
 * @param {array<string>} argv
 * @param {object} [op]
 * @param {string} [op.cwd]
 * @param {object} [op.stdio]
 * @return {object<child_process>}
 */
function spawnRun(argv, op){
	let spawn = require('child_process').spawn
	, child
	;
	op = op || {};
	op.stdio = op.stdio || 'inherit';
	
	child = spawn(argv[0], argv.slice(1), op);
	child.on('exit', (code, signal)=>{
		process.on('exit', ()=>{
			if(signal){
				process.kill(process.pid, signal);
			}else{
				process.exit(code);
			}
		});
	});
	
	return child;
};