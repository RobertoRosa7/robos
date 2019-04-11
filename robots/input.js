const readline = require('readline-sync');
const state = require('./state.js');

function robot() {
	const content = {
		maxSentences: 7
	};
	content.searchTerm = askAndReturnSearchTerm();
	content.prefix = askAndReturnPrefix();
	state.save(content);
	function askAndReturnSearchTerm(){
		return readline.question('type a wikipedia search term: ');
	}
	function askAndReturnPrefix(){
		const prefixes = ['Who is', 'What is', 'The history of'];
		const selectedPrefixIndex = readline.keyInSelect(prefixes, 'choose on option: ');
		const selectedPrefixText = prefixes[selectedPrefixIndex];
		return selectedPrefixText;
	}
}
module.exports = robot
