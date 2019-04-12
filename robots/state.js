const fs = require('fs');

function save(data){
	const dataString = JSON.stringify(data);
	return fs.writeFileSync('./database.json', dataString);
}
function saveScript(content){
	const contentString = JSON.stringify(content);
	const scriptString = `var content = ${contentString}`;
	return fs.writeFileSync('./content/after-effects-script.js', scriptString);
}
function load(){
	const fileBuffer = fs.readFileSync('./database.json', 'utf-8');
	const dataJSON = JSON.parse(fileBuffer);
	return dataJSON;
}
module.exports = {
	save,
	load,
	saveScript
}