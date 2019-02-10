import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        current_type: '',
        offset: 0,
        emotions: [],
        selected_emotions: [],
        photos: [],
        is_loading: true
    },
    actions: {
        async fetchEmotions({ commit }) {
            const res = await axios.get('http://localhost:3000/emotions').catch(e => {
                throw new Error(e);
            });
            if (res.data.length) {
                commit('setEmotions', res.data.map(emotion => {
                    return {
                        name: emotion,
                        active: false
                    }
                }));
            }
        },
        async fetchPhotos({ commit, state }) {
            let emotion = state.emotions.find(em => em.active);
            if (emotion) emotion = emotion.name;
            let res;
            console.log(emotion);
            if (emotion) {
                if (state.current_type !== emotion) {
                    commit('setOffset', 0);
                    commit('setPhotos', []);
                    commit('setIsLoading', true);
                } else {
                    commit('setOffset', state.offset + 11);
                }
                res = await axios.get(`http://localhost:3000/filterPhotos?offset=${state.offset}&emotion=${emotion}`).catch(e => {
                    throw new Error(e);
                });
            } else {
                if (state.current_type !== 'all') {
                    commit('setPhotos', []);
                    commit('setOffset', 0);
                    commit('setIsLoading', true);
                } else {
                    commit('setOffset', state.offset + 11);
                }
                res = await axios.get(`http://localhost:3000/photos?offset=${state.offset}`).catch(e => {
                    throw new Error(e);
                });
                commit('setCurrentType', 'all');
            }



            if (res.data.length) {
                const new_photos = [...state.photos];
                console.log('b4', new_photos);
                new_photos.push(...res.data.map(photo => {
                    return {
                        url: photo.url
                    }
                }));
                console.log('after', new_photos);
                commit('setPhotos', new_photos);
                commit('setIsLoading', false);
            }
        },
    },
    mutations: {
        setEmotions(state, val) { state.emotions = val },
        setPhotos(state, val) { state.photos = val },
        setIsLoading(state, val) { state.is_loading = val },
        setCurrentType(state, val) { state.current_type = val },
        setOffset(state, val) { state.offset = val }
    }
})