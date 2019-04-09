// Orquestrador - função que será responsável por agrupar tudo
const readline = require('readline-sync');

function start(){
	const content = {};
	content.searchTerm = askAndReturnSearchTerm();
	content.prefix = askAndReturnPrefix();

	function askAndReturnSearchTerm(){
		return readline.question('type a wikipedia search term: ');
	}
	function askAndReturnPrefix(){
		const prefixes = ['Who is', 'What is', 'The history of'];
		const selectedPrefixIndex = readline.keyInSelect(prefixes, 'choose on option: ');
		const selectedPrefixText = prefixes[selectedPrefixIndex];
		return selectedPrefixText;
	}
	console.log(content);
}
start();