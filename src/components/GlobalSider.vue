<template>
  <div id="globalSider">
    <a-layout-sider
      width="200"
      breakpoint="lg"
      collapsed-width="0"
      v-if="loginUserStroe.loginUser.id">
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      >
      </a-menu>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import {  h, ref } from 'vue'
import { PictureOutlined,UserOutlined} from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStroe } from '@/stores/useLoginUserStroe'
const current = ref<string[]>(['/'])

const loginUserStroe = useLoginUserStroe()
//未经过滤的菜单项
const menuItems = [
  {
    key: '/',
    icon: h(PictureOutlined),
    label: '公共图库',
  },
  {
    key: '/my_space',
    icon: h(UserOutlined),
    label: '我的空间',
  },
]
const router = useRouter()
//路由跳转事件
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}
//路由监听(路由跳转后更新菜单选中状态——当前要高亮的菜单项)
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}

</style>
