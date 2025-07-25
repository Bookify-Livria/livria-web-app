import { createWebHistory, createRouter } from 'vue-router';

import Home from '../public/pages/home.component.vue';
import Account from '../public/pages/account.component.vue';
import Communities from "../public/pages/communities.component.vue";
import GenreCardshow from '../public/pages/genre-cardshow.component.vue';
import SingularBook from '../public/pages/book-page.component.vue';
import Recommendation from "../public/pages/recommendation.component.vue";
import Search from "../public/pages/search-component.vue";
import Login from "../public/pages/login-page.component.vue";
import Register from "../public/pages/register-page.component.vue";
import Purchase from "../public/pages/purchase.component.vue";
import SubscriptionComponent from "../public/pages/subscription.component.vue";
import CommunityView from '../public/pages/view-communities.component.vue';
import Shop from '../public/pages/shop.component.vue';
import Dashboard from '../public/pages/dashboard.component.vue';
import BooksManagement from '../public/pages/books-management.component.vue'
import OrdersManagement from '../public/pages/orders-management.component.vue'
import InventoryManagement from '../public/pages/inventory-management.component.vue'
import StatisticsManagement from '../public/pages/statistics-management.component.vue'
import Settings from '../public/pages/settings.component.vue'
import AdminPinPage from "../public/pages/admin-pin-page.component.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: Login},
        {path: '/home', component: Home},
        {path: '/account', component: Account},
        {path: '/communities', component: Communities},
        {path: '/login', component: Login},
        {path: '/register', component: Register},
        {path: '/access', component: AdminPinPage},
        {path: "/purchase", component: Purchase},
        {path: "/shop", component: Shop},
        {path: "/dashboard", component: Dashboard},
        {path: "/books-management", component: BooksManagement},
        {path: "/orders-management", component: OrdersManagement},
        {path: "/inventory-management", component: InventoryManagement},
        {path: "/statistics-management", component: StatisticsManagement},
        {path: "/settings", component: Settings},
        {
            path: '/bookl',
            name: 'LiteratureBooks',
            component: GenreCardshow,
            props: { genre: 'literature' }
        },
        {
            path: '/booknf',
            name: 'NoFictionBooks',
            component: GenreCardshow,
            props: { genre: 'non_fiction' }
        },
        {
            path: '/bookf',
            name: 'FictionBooks',
            component: GenreCardshow,
            props: { genre: 'fiction' }
        },
        {
            path: '/bookmc',
            name: 'MangasycomicsBooks',
            component: GenreCardshow,
            props: { genre: 'mangas_comics' }
        },
        {
            path: '/bookj',
            name: 'JuvenilBooks',
            component: GenreCardshow,
            props: { genre: 'juvenile' }
        },
        {
            path: '/bookc',
            name: 'ChildrenBooks',
            component: GenreCardshow,
            props: { genre: 'children' }
        },
        {
            path: '/bookea',
            name: 'EaBooks',
            component: GenreCardshow,
            props: { genre: 'ebooks_audiobooks' }
        },
        {
            path: '/recommendations',
            name: 'Recommendations',
            component: Recommendation
        },
        {
            path: '/books/:title',
            name: 'BookDetail',
            component: SingularBook
        },
        {
            path: '/search',
            name: 'BookSearch',
            component: Search
        },
        {
            path: '/subscription',
            name: 'CommunitySubscription',
            component: SubscriptionComponent
        },
        {
            path: '/communities/:name',
            name: 'CommunityView',
            component: CommunityView
        },
    ]
})


export default router;