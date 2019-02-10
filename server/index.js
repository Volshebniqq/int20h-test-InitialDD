require('dotenv').config();

const express = require('express');
const app = express();

const flickr = require('./lib/flickr'),
    cache = require('./lib/redis')(),
    facePlusPlus = require('./lib/facePlusPlus'),
    worker = flickr(process.env.FLICKR_API_KEY, process.env.FLICKR_SECRET),
    fppClient = facePlusPlus(process.env.FACEPLUSPLUS_API_KEY, process.env.FACEPLUSPLUS_SECRET);

let isProcessing = true;

async function run() {
    const photos = await worker.loadPhotos(
        process.env.FLICKR_USER_ID,
        process.env.FLICKR_PHOTOSET_ID,
        process.env.FLICKR_TAGS
    );
    await fppClient.analyzePhotos(photos);
    isProcessing = false;
}
run();

app.get('/photos', async (req, res) => {
    res.send(await cache.getPhotos(parseInt(req.query.offset)));
});

app.get('/emotions', (req, res) => {
    res.send(['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']);
});

app.get('/filterPhotos', async(req, res) => {
    res.send(await cache.getByEmotion(req.query.emotion, parseInt(req.query.offset)));
});

app.get('/is_processing', (req, res) => {
    res.send(isProcessing);
});

app.listen(3000);

