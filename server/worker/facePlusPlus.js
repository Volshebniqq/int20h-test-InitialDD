const axios = require('axios');
const cache = require('./redis')();

const request = axios.create({
    baseURL: 'https://api-us.faceplusplus.com/facepp/v3',
    timeout: 30000
});

const facePlusPlus = (api_key, api_secret) => {

    const analyzePhoto = async (image_url, photo_id) => {
        try {
            const { data } = await request.post('/detect', null, {
                params: {
                    api_key,
                    api_secret,
                    image_url,
                    return_attributes: 'emotion'
                }
            });
            if (data.faces.length) {
                processFaces(photo_id, data.faces);
            }
            return data;
        } catch(e) {
            console.log('err fpp', e.message);
        }
    }
    const analyzePhotos = async (photos) => {
        return new Promise(resolve => {
            console.log('analyzing photos');
            const photosCopy = photos.map(el => el);
            const interval = setInterval(async () =>{
                if (photosCopy.length === 0) {
                    clearInterval(interval);
                    resolve();
                }
                photo = photosCopy.pop();
                await analyzePhoto(photo.url, photo.id);
            }, 2500);
        })
    }

    const processFaces = async (photo_id, faces) => {
        const processedFaces = faces.map(async face => {
            const processedEmotions = [];
            if (!face.attributes) {
                return Promise.resolve();
            }
            for(const key of Object.keys(face.attributes.emotion)) {
                if (face.attributes.emotion[key] >= process.env.EMOTION_THRESHOLD) {
                    processedEmotions.push(cache.appendEmotion(photo_id, key));
                }
            }
            return Promise.all(processedEmotions);
        });
        await Promise.all(processedFaces);
    }

    return { analyzePhotos };
}


module.exports = facePlusPlus;
