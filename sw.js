const CACHE_NAME = 'finmates-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/variables.css',
    './css/style.css',
    './css/components.css',
    './css/forms.css',
    './js/app.js',
    './js/components/FeedItem.js',
    './js/views/CreatePortfolio.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force update
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy for development
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
