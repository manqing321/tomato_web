import { createRouter, createWebHistory } from 'vue-router'
 
const routes = [
    {
        path: "/",
        alias: ["/index"],
        component: () => import("@/views/Index.vue")
    },
    {
        path: "/auth",
        alias: ["/login", "/register"],
        component: () => import("@/views/Auth.vue")
    }]

const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export default router