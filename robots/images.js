const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const state = require('./state');
const googleSearchCredentials = require('../credentials/google-custom-search.json');
const imageDownloader = require('image-downloader');

async function robot(){
	const content = state.load();
	
	await fetchImagesOfAllSentences(content);
	await downloadAllImages(content);
	
	state.save(content);

	async function fetchImagesOfAllSentences(content){
		for(const sentence of content.sentences){
			const query = `${content.searchTerm} ${sentence.keywords[0]}`;
			sentence.images = await fetchGoogleAndReturnImagesLinks(query);
			
			sentence.googleSearchQuery = query;
		}
	}
	async function fetchGoogleAndReturnImagesLinks(query){
		const response = await customSearch.cse.list({
			auth: googleSearchCredentials.apikey,
			cx: googleSearchCredentials.searchEngineId,
			q: query,
			searchType:'image',
			imgSize: 'huge',
			num: 2,
		});
		const imagesUrl = response.data.items.map(item => item.link);
		return imagesUrl;
	}
	async function downloadAllImages(content){
		content.dowloadedImages = [];
		for(let sentencesIndex = 0; sentencesIndex < content.sentences.length; sentencesIndex++){
			const images = content.sentences[sentencesIndex].images;
			for(let imageIndex = 0; imageIndex < images.length; imageIndex++){
				const imageUrl = images[imageIndex];
				try{
					if(content.dowloadedImages.includes(imageUrl)){
						throw new Error('Image already dowloaded');
					}
					await downloadAndSave(imageUrl, `${sentencesIndex}-original.png`);
					content.dowloadedImages.push(imageUrl);
					console.log(`> [${sentencesIndex}] [${imageIndex}] get image: ${imageUrl}`);
					break;
				}catch(err){
					console.log(`>  [${sentencesIndex}] [${imageIndex}] Erro: Not get image (${imageUrl}): ${err}`);
				}
			}
		}
	}
	async function downloadAndSave(url, fileName){
		return imageDownloader.image({
			url, url,
			dest: `./content/${fileName}`,
		});
	}
}
module.exports = robot;