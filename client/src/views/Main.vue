<template>
    <div class="course-page">
        <div class="left-background-blog"></div>
        <div class="wrapper">
            <Sidebar />
            <div class="content-container" ref="container">
                <div class="content" ref="content">
                    <Feed />
                </div>
            </div>
        </div>
    </div>
</template>


<script>
  import Sidebar from "../components/Sidebar";
  import Feed from "../components/Feed";
  export default {
      name: 'MainPage',
      beforeMount() {
          this.$store.dispatch('fetchEmotions');
          this.$store.dispatch('fetchPhotos');
      },
      mounted() {
          this.scroll()
      },
      data() {
          return {
              sent: false
          }
      },
      components: { Feed, Sidebar },
      methods: {
          scroll() {
              this.$refs.container.onscroll = () => {
                  const { container, content } = this.$refs;
                  const reached_bottom = container.scrollTop + container.clientHeight >= content.clientHeight;
                  console.log(reached_bottom);
                  if (reached_bottom && !this.sent) {
                      this.$store.dispatch('fetchPhotos');
                      this.sent = true;
                      setTimeout(() => {
                        this.sent = false;
                      }, 3000)
                  }
              };
          },
      },
  }
</script>

