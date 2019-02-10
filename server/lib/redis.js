const bluebird = require('bluebird');
const redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
    host: '127.0.0.1'
});


const wrapper = () => {
    const savePhoto = (photo) => {
        return Promise.all([
            client.zaddAsync('photos', 0, photo.id),
            client.hmsetAsync(photo.id, 'raw', photo.raw, 'url', photo.url)
        ]);
    };

    const appendEmotion = (photo_id, emotion) => {
        return client.zaddAsync(emotion, 0, photo_id);
    };

    const getPhoto = (id) => {
        return client.hgetallAsync(id);
    };

    const getByEmotion = (emotion, offset) => {
        return client.zrangeAsync(emotion, offset, process.env.PHOTOS_PER_PAGE);
    };

    const getPhotos = async (offset) => {
        const photos_id = await client.zrangeAsync('photos', offset, process.env.PHOTOS_PER_PAGE);
        console.log(process.env.PHOTOS_PER_PAGE);
        console.log(photos_id);
        return Promise.all(photos_id.map(id => client.hgetallAsync(id)));
    };

    return { savePhoto, appendEmotion, getPhoto, getByEmotion, getPhotos };
};

module.exports = wrapper;
