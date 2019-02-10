const axios = require('axios');
const cache = require('./redis')();

const request = axios.create({
    baseURL: 'https://api.flickr.com/services/rest/',
    timeout: 30000,
    headers: {'X-Custom-Header': 'foobar'}
});

const flickr = (api_key) => {

    const loadAllPhotosetPages = async (user_id, photoset_id, page) => {
        const { data } = await request.get('', {
            params: {
                method: 'flickr.photosets.getPhotos',
                api_key,
                user_id,
                photoset_id,
                format: 'json',
                nojsoncallback: 1,
                page,
            }
        });
        if (data.photoset.pages > page) {
            const otherPages = await loadAllPhotosetPages(user_id, photoset_id, page + 1);
            data.photoset.photo.push(...otherPages);
        }
        return data.photoset.photo;
    };


    const loadPhotos = async (user_id, photoset_id, tags) => {
        const photos = await Promise.all([
            loadAllPhotosetPages(user_id, photoset_id, 1),
            loadAllTagsPages(tags, 1)
        ]);
        const mergedPhotos = photos[0].concat(photos[1].filter(photo => photos[0].indexOf(photo) < 0));
        const storedPhotos = mergedPhotos.map(async (photo) => {
            photo.url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
            await cache.savePhoto(photo);
            return photo;
        });
        return await Promise.all(storedPhotos);
    };


    const loadAllTagsPages = async (tags, page) => {
        const { data } = await request.get('', {
            params: {
                method: 'flickr.photos.search',
                api_key,
                tags,
                format: 'json',
                nojsoncallback: 1,
                page,
            }
        });
        if (data.photos.pages > page) {
            const otherPages = await loadAllTagsPages(tags, page + 1);
            data.photos.photo.push(...otherPages);
        }
        return data.photos.photo;
    };

    return { loadPhotos };
};


module.exports = flickr;
