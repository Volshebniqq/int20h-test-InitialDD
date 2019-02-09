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
            const otherPages = await loadAllPhotosetPages(page + 1);
            data.photoset.photo.push(...otherPages);
        }
        return data.photoset.photo;
    };


    const loadPhotoset = async (user_id, photoset_id) => {
        const photos = await loadAllPhotosetPages(user_id, photoset_id, 1);
        console.log('got al photos from flickr');
        const storedPhotos = photos.map(async (photo) => {
            photo.url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
            photo.raw = await downloadPhoto(photo);
            await cachePhoto(photo);
            return photo;
        })
        return await Promise.all(storedPhotos);
    };

    const downloadPhoto = async (photo) => {
            const { data } = await axios.get(photo.url);
            return data;
    } 

    const getTagPhotos = async (tags) => {
        const { data } = await request.get('', {
            params: {
                method: 'flickr.photos.search',
                api_key,
                tags,
                format: 'json'
            }
        });
        console.log(data);
    };

    const cachePhoto = async (photo) => {
        return cache.savePhoto(photo);
    };

    return { loadPhotoset, getTagPhotos };
}


module.exports = flickr;
