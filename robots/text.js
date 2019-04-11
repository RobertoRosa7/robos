// Começando pela camada de abstração, e utilização da interface pública
const algorithmia = require('algorithmia');
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd');
const watsonApiKey = require('../credentials/watson.json').apikey
const watsonApiURL = require('../credentials/watson.json').url
const naturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const state = require('./state.js');

const nlu = new naturalLanguageUnderstandingV1({
	iam_apikey: watsonApiKey,
	version:'2018-04-05',
	url:watsonApiURL
});

async function robot(){
	const content = state.load()
	
	await fetchContentFromWikipedia(content);
	sanitizeContent(content);
	breakContentIntoSentences(content);
	limitMaxSentences(content);
	await fetchKeywordsOfAllSentences(content);
	
	state.save(content);

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
	}
	function limitMaxSentences(content){
		content.sentences = content.sentences.slice(0, content.maxSentences);
	}
	async function fetchKeywordsOfAllSentences(content){
		for(let sentence of content.sentences){
			sentence.keywords = await fetchWatsonReturnKeywords(sentence.text);
		}
	}
	async function fetchWatsonReturnKeywords(sentence){
	return new Promise((resolve, reject) =>{
		nlu.analyze({
			text: sentence,
			features:{
				keywords:{}
			}
		}, (err, response) =>{
			if(err) { 
				throw new Error;
			}
			const keywords = response.keywords.map(keyword =>{
				return keyword.text;
			});
			resolve(keywords);
		});
	});
}
}
module.exports = robot