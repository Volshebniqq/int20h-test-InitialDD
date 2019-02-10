<template>
    <div class="sidebar">
        <div class="panel knowledge">

            <h2>Emotions</h2>

            <div class="divider"></div>

            <p class="emotion" v-for="emotion in emotions" @click="toggleActive(emotion)"
               :class="{ active: emotion.active }">
                {{ emotion.name }}
            </p>

        </div>
    </div>
</template>

<script>
    export default {
        name: 'Sidebar',
        methods: {
            toggleActive(emotion) {
                this.emotions.forEach(em => {
                    if (em.name !== emotion.name) em.active = false;
                });
                emotion.active = !emotion.active;
                this.$store.dispatch('fetchPhotos');
            }
        },
        computed: {
            emotions: {
                get() { return this.$store.state.emotions; },
                set(val) { this.$store.commit('setEmotions', emotions) }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .knowledge {
        position: absolute;
        top: 50%;
        right: 20px;
        left: 20px;
        transform: translateY(-50%);
    }
    .emotion {
        padding-left: 20px;
        font-family: "GothamPro Medium";
        color: #191919;
        text-transform: capitalize;
        font-size: 20px;
        cursor: pointer;
        margin: 5px 0;
        position: relative;
    }
    .emotion.active:before {
        content: " ";
        display: block;
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        left: 5px;
        top: 50%;
        transform: translateY(-50%);
        background-color: #53ac74;
    }
</style>