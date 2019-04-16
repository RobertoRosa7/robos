const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const imageDownloader = require('image-downloader');
const gm = require('gm').subClass({imageMagick: true});
const state = require('./state');
const googleSearchCredentials = require('../credentials/google-custom-search.json');

async function robot(){
	const content = state.load();
	
	// await fetchImagesOfAllSentences(content);
	// await downloadAllImages(content);
	// await convertAllImages(content);
	// await createAllSentenceImages(content);
	await createThumbnailYoutube(content);
	// state.save(content);

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
	async function convertAllImages(content){
		for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
			await convertImage(sentenceIndex);
		}
	}
	async function convertImage(sentenceIndex){
		return new Promise(function(resolve, reject){
			const inputFile = `./content/${sentenceIndex}-original.png[0]`;
			const outputFile = `./content/${sentenceIndex}-converted.png`;
			const width = 1920;
			const height = 1080;

			gm()
			.in(inputFile)
			.out('(')
				.out('-clone')
				.out('0')
				.out('-background', 'white')
				.out('-blur', '0x9')
				.out('-resize', `${width}x${height}^`)
			.out(')')
			.out('(')
				.out('-clone')
				.out('0')
				.out('-background', 'white')
				.out('-resize', `${width}x${height}`)
			.out(')')
			.out('-delete', '0')
			.out('-gravity', 'center')
			.out('-compose', 'over')
			.out('-composite')
			.out('-extent', `${width}x${height}`)
			.write(outputFile, err =>{
				if(err) return reject(err);
				console.log(`> image converted: ${inputFile}`);
				resolve();
			});
		});
	}
	async function createAllSentenceImages(content){
		for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
			await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text);
		}
	}
	async function createSentenceImage(sentenceIndex, sentenceText){
		return new Promise(function(resolve, reject){
			const outputFile = `./content/${sentenceIndex}-sentence.png`;
			const templateSettings = {
				0:{
					size: '1920x400',
					gravity: 'center'
				},
				1:{
					size: '1920x1080',
					gravity:'center'
				},
				2:{
					size:'800x800',
					gravity: 'west'
				},
				3:{
					size:'1920x400',
					gravity: 'center'
				},
				4:{
					size:'1920x1080',
					gravity: 'center'
				},
				5:{
					size:'800x800',
					gravity: 'west'
				},
				6:{
					size: '1920x400',
					gravity:'center'
				}
			}
			gm()
			.out('-size', templateSettings[sentenceIndex].size)
			.out('-gravity', templateSettings[sentenceIndex].gravity)
			.out('-background', 'transparent')
			.out('-fill', 'white')
			.out('-kerning', '-1')
			.out(`caption:${sentenceText}`)
			.write(outputFile, function(err){
				if(err) return reject(err);
				console.log(`> Sentence created: ${outputFile}`);
				resolve();
			});
		});
	}
	async function createThumbnailYoutube(content){
		return new Promise(function(resolve, reject){
			gm()
				.in('./content/0-converted.png')
				.write('./content/youtube-thumbnail.jpg', function(err){
					if(err) return reject(err);
					console.log('> create youtube thumbnail...');
				});
		});
	}
}
module.exports = robot;