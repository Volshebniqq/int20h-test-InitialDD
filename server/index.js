require('dotenv').config();

const express = require('express');
const app = express();

const flickr = require('./worker/worker'),
        cache = require('./worker/redis')(),
        facePlusPlus = require('./worker/facePlusPlus'),
        worker = flickr(process.env.FLICKR_API_KEY, process.env.FLICKR_SECRET),
        fppClient = facePlusPlus(process.env.FACEPLUSPLUS_API_KEY, process.env.FACEPLUSPLUS_SECRET);

let dataProcessed = false;

async function run() {
    const photos = await worker.loadPhotoset(process.env.FLICKR_USER_ID, process.env.FLICKR_PHOTOSET_ID);
    await fppClient.analyzePhotos(photos);
    dataProcessed = true;
    console.log('processed all pictures');
}
run();

app.get('/photos', async (req, res) => {
    console.log('processed all', dataProcessed);
    res.send(await cache.getPhotos(req.query.offset));
});

app.get('/emotions', (req, res) => {
    res.send(['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise'])
});

app.get('/filterPhotos', async(req, res) => {
    res.send(await cache.getByEmotion(req.query.emotion, req.query.offset));
})

app.listen(3000);
