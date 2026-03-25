import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './styles/readability.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const pinia = createPinia()

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')


