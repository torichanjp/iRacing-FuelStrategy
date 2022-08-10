import FuelMain from './components/FuelMain.vue'
import {createRouter, createWebHashHistory, Router} from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'fuelMain',
        component: FuelMain,
        props: (route: any) => ({ query: route.query })
    }
]

export default createRouter({
    history: createWebHashHistory(),
    routes: routes
})
