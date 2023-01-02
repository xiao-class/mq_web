<template>
  <!--设备管理-->
  <div class="app-container">
    <el-tabs v-model="activeName">
      <el-tab-pane label="已绑定" name="first">
        <customtable status="1" ref="first"/>
      </el-tab-pane>
      <el-tab-pane label="未绑定" name="second">
        <customtable status="0" ref="second"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import customtable from './components/list'
export default {
  name: "EquipmentIndex",
  components: {customtable},
  data() {
    return {
      activeName: "first",
    };
  },
  computed: {},
  watch: {
    $route: function () {
      this.$refs.first.getList();
      this.$refs.second.getList();
      this.$refs.third.getList();
    },
  },
  created() {
  },
  mounted() {
  },
  methods: {},
}
</script>

<style scoped>

</style>
