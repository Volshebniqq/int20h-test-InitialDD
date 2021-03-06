const bluebird = require('bluebird');
const redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
    host: process.env.REDIS_HOST
});


const wrapper = () => {
    const savePhoto = (photo) => {
        return Promise.all([
            client.zaddAsync('photos', 0, photo.id),
            client.hmsetAsync(photo.id, 'url', photo.url)
        ]);
    };

    const appendEmotion = (photo_id, emotion) => {
        return client.zaddAsync(emotion, 0, photo_id);
    };

    const getPhoto = (id) => {
        return client.hgetallAsync(id);
    };

    const getByEmotion = async (emotion, offset) => {
        const photos_id = await client.zrangeAsync(emotion, offset, parseInt(offset) + parseInt(process.env.PHOTOS_PER_PAGE) - 1);
        const photos = photos_id.map(id => getPhoto(id));
        return Promise.all(photos);
    };

    const getPhotos = async (offset) => {
        const photos_id = await client.zrangeAsync('photos', offset, parseInt(offset) + parseInt(process.env.PHOTOS_PER_PAGE - 1));
        return Promise.all(photos_id.map(id => client.hgetallAsync(id)));
    };

    return { savePhoto, appendEmotion, getPhoto, getByEmotion, getPhotos };
};

module.exports = wrapper;
