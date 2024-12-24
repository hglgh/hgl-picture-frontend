import router from '@/router'
import { useLoginUserStroe } from '@/stores/useLoginUserStroe'
import { message } from 'ant-design-vue'

//是否为首次获取登录用户信息
let isFirstGetLoginUser = true

/**
 * 全局权限校验，每次路由跳转时（切换页面），都会执行该函数
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStroe = useLoginUserStroe()
  let loginUser = loginUserStroe.loginUser
  //确保页面刷新时，首次加载时，能等待后端返回登录用户信息在校验权限
  if (isFirstGetLoginUser) {
    await loginUserStroe.fetchLoginUser()
    loginUser = loginUserStroe.loginUser
    isFirstGetLoginUser = false
  }
  const toUrl = to.fullPath
  //可以自定义权限校验逻辑，例如：管理员才能访问 /admin开头的页面
  if (toUrl.startsWith('/admin')) {
    if (!loginUser.userRole || loginUser.userRole !== 'admin') {
      message.error('没有权限')
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
