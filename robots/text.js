// Começando pela camada de abstração, e utilização da interface pública
const algorithmia = require('algorithmia');
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd');

async function robot(content){
	await fetchContentFromWikipedia(content);
	sanitizeContent(content);
	breakContentIntoSentences(content);

	async function fetchContentFromWikipedia(content){
		const algorithmiaAuthenticated = algorithmia.client(algorithmiaKey);
		const wikipediaAugorithmia = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
		const wikipediaResponse = await wikipediaAugorithmia.pipe(content.searchTerm);
		const wikipediaContent = wikipediaResponse.get();
		content.sourceContentOriginal = wikipediaContent.content;
	}
	function sanitizeContent(content){
		const noBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal);
		const noDatesParentese = removeDates(noBlankLinesAndMarkDown);
		content.sourceContentSanitized = noDatesParentese
		
		function removeBlankLinesAndMarkDown(text){
			const allLines = text.split('\n');
			const noBlankLinesAndMarkDown = allLines.filter(lines =>{
				if(lines.trim().length === 0 || lines.trim().startsWith('=')){
					return false;
				}
				return true;
			});
			return noBlankLinesAndMarkDown.join(' ');
		}
	}
	function removeDates(text){
		return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm,'').replace(/ /g,' ');
	}
	function breakContentIntoSentences(content){
		content.sentences = [];

		const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
		sentences.forEach(sentence =>{
			content.sentences.push({
				text: sentence,
				keywords: [],
				images: []
			});
		});
		console.log(sentences);
	}
}
module.exports = robot