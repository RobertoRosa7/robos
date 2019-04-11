const fs = require('fs');
// const database = require('./database.json');

function save(data){
	const dataString = JSON.stringify(data);
	return fs.writeFileSync('./database.json', dataString);

	// fs.writeFile('message.txt', data, (err) => {
	// 	if (err) throw err;
	// 	console.log('The file has been saved!');
	//   });
}
function load(){
	const fileBuffer = fs.readFileSync('./database.json', 'utf-8');
	const dataJSON = JSON.parse(fileBuffer);
	return dataJSON;
}
module.exports = {
	save,
	load,
}