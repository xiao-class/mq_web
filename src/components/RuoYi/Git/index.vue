<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'RuoYiGit',
  data() {
    return {
      url: 'https://gitee.com/class-java/mq_system'
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>
