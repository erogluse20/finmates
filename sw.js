const CACHE_NAME = 'finmates-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/variables.css',
    './css/style.css',
    './css/components.css',
    './css/forms.css',
    './js/app.js',
    './js/components/FeedItem.js',
    './js/views/CreatePortfolio.js',
    './assets/icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
