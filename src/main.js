import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import '@/assets/icon/style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
