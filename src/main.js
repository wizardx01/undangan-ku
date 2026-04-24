import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Views
import LandingView from './views/LandingView.vue'
import WeddingView from './views/WeddingView.vue'
import LoginView from './views/LoginView.vue'
import ProfileView from './views/ProfileView.vue'
import AdminView from './views/AdminView.vue'
import DashboardListView from './views/DashboardListView.vue'
import DashboardEditView from './views/DashboardEditView.vue'


// CSS
import 'aos/dist/aos.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    { path: '/', component: LandingView },
    { path: '/login', component: LoginView },
    { path: '/wedding/:slug', component: WeddingView },
    
    // Auth required routes
    { path: '/dashboard', component: DashboardListView, meta: { requiresAuth: true } },
    { path: '/dashboard/edit', component: DashboardEditView, meta: { requiresAuth: true } },
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    
    // Admin only routes
    { path: '/admin', component: AdminView, meta: { requiresAuth: true, role: 'admin' } },
  ]
})

// Navigation Guard with session expiry
router.beforeEach((to, from) => {
  const session = JSON.parse(localStorage.getItem('session') || 'null')
  
  // Cek expired
  if (session && session.expires) {
    if (session.expires < Date.now()) {
      localStorage.removeItem('session')
      if (to.meta.requiresAuth) {
        return '/login'
      }
    }
  }
  
  const user = session?.user
  
  // Cek auth required
  if (to.meta.requiresAuth) {
    if (!user) {
      return '/login'
    }
    
    // Cek role
    if (to.meta.role && user.role !== to.meta.role) {
      return '/dashboard'
    }
  }
  
  // Allow navigation
  return true
})

const app = createApp(App)
app.use(router)
app.mount('#app')