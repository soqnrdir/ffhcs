import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/cameragroups-edit/:id',
    name: 'cameragroupsEdit',
    component: () => import('../views/CameraGroups-Edit'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/Users.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/users-edit/:id',
    name: 'usersEdit',
    component: () => import('../views/Users-Edit.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/playlogs',
    name: 'playlogs',
    component: () => import('../views/Playlogs.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/playlogCount',
    name: 'playlogCount',
    component: () => import('../views/PlaylogCount.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('../views/Logout.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/admin-edit',
    name: 'adminEdit',
    component: () => import('../views/AdminEdit.vue'),
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
      let admin = store.state.admin
      console.log(`router -> '${to.fullPath}' id=${admin.id}`)
      if (!admin.id) {
        next({
            path: '/login',
            params: { nextUrl: to.fullPath }
          })
      } else {
        if (to.matched.some(record => record.meta.admin)) {
            if(admin.level) {
              next()
            }
            else{
              next({ name: 'home'})
            }
        } else {
          next()
        }
      }
  } else {
    console.log('router -> navigating a guest page:', to.fullPath)
    next()
  }
})

export default router
