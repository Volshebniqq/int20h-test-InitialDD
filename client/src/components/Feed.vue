<template>
    <div class="feed-container">
        <Loader v-if="is_loading" />
        <template v-else>
            <div class="content-panel article" v-for="photo in photos">
                <img :src="photo.url" alt="">
            </div>
        </template>
    </div>
</template>

<script>
    import Loader from "./Loader";
    export default {
        name: 'Feed',
        components: { Loader },
        computed: {
            photos() { return this.$store.state.photos },
            is_loading() { return this.$store.state.is_loading }
        }
    }
</script>

<style lang="scss" scoped>
    .article {
        margin-top: 20px;
        img {
            width: 100%;
            height: auto;
        }
    }
    .feed-container {
        min-height: 100vh;
    }
</style>