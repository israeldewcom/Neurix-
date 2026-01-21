/**
 * ChangeX Neurix - Service Worker
 * Enables offline functionality and improves performance
 */

const CACHE_NAME = 'changex-neurix-v2.0.0';
const API_CACHE_NAME = 'changex-neurix-api-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/components.css',
    '/styles/animations.css',
    '/styles/mobile.css',
    '/scripts/app.js',
    '/scripts/api.js',
    '/scripts/components.js',
    '/scripts/models.js',
    '/scripts/utils.js',
    '/assets/icons/favicon.ico',
    '/assets/icons/apple-touch-icon.png',
    '/assets/images/logo.svg',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation completed');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip extension requests
    if (url.protocol === 'chrome-extension:') return;
    
    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }
    
    // Handle page navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(handlePageNavigation(event.request));
        return;
    }
    
    // Handle static assets
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                // Fetch from network
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone response
                    const responseToCache = response.clone();
                    
                    // Cache the response
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            })
            .catch(() => {
                // If both cache and network fail, show offline page
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                return new Response('Network error happened', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                });
            })
    );
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const cacheKey = request.url;
    
    try {
        // Try to get from cache first
        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);
        
        if (cachedResponse) {
            // Check if cache is still valid (less than 5 minutes old for GET requests)
            const cachedTime = new Date(cachedResponse.headers.get('sw-cached-time'));
            const now = new Date();
            const cacheAge = now - cachedTime;
            
            if (cacheAge < 5 * 60 * 1000 && request.method === 'GET') {
                return cachedResponse;
            }
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        // Clone response to cache
        const responseToCache = networkResponse.clone();
        
        // Add cache timestamp header
        const headers = new Headers(responseToCache.headers);
        headers.append('sw-cached-time', new Date().toISOString());
        
        const cachedResponseWithTime = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
        });
        
        // Cache successful GET responses
        if (networkResponse.ok && request.method === 'GET') {
            await cache.put(cacheKey, cachedResponseWithTime);
        }
        
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        const cache = await caches.open(API_CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // No cache available, return error
        return new Response(JSON.stringify({
            success: false,
            error: 'Network error',
            message: 'You are offline and no cached data is available.'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle page navigation
async function handlePageNavigation(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        
        // Cache the page
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // No cache, return offline page
        return caches.match('/offline.html');
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-requests') {
        event.waitUntil(syncPendingRequests());
    }
});

// Handle push notifications
self.addEventListener('push', event => {
    console.log('Service Worker: Push received');
    
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body || 'New notification from ChangeX Neurix',
        icon: '/assets/icons/notification-icon.png',
        badge: '/assets/icons/badge.png',
        tag: data.tag || 'general',
        data: data.data || {},
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'ChangeX Neurix', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Sync pending requests when back online
async function syncPendingRequests() {
    try {
        const db = await openRequestsDatabase();
        const requests = await getAllPendingRequests(db);
        
        for (const request of requests) {
            try {
                const response = await fetch(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: request.body
                });
                
                if (response.ok) {
                    // Remove from pending requests
                    await deletePendingRequest(db, request.id);
                    
                    // Show success notification
                    self.registration.showNotification('ChangeX Neurix', {
                        body: 'Pending request completed successfully',
                        icon: '/assets/icons/notification-icon.png'
                    });
                }
            } catch (error) {
                console.error('Failed to sync request:', error);
            }
        }
        
        await db.close();
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Database for pending requests (IndexedDB)
function openRequestsDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NeurixRequests', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('pendingRequests')) {
                const store = db.createObjectStore('pendingRequests', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

function getAllPendingRequests(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingRequests', 'readonly');
        const store = transaction.objectStore('pendingRequests');
        const index = store.index('timestamp');
        const request = index.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deletePendingRequest(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('pendingRequests', 'readwrite');
        const store = transaction.objectStore('pendingRequests');
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Message handling
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME);
        caches.delete(API_CACHE_NAME);
    }
    
    if (event.data.type === 'CACHE_API_RESPONSE') {
        const { url, response } = event.data;
        caches.open(API_CACHE_NAME).then(cache => {
            cache.put(url, response);
        });
    }
});

// Periodic sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        if (event.tag === 'cleanup-cache') {
            event.waitUntil(cleanupOldCacheEntries());
        }
    });
}

async function cleanupOldCacheEntries() {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const cachedTime = new Date(response.headers.get('sw-cached-time'));
            if (cachedTime && cachedTime.getTime() < oneWeekAgo) {
                await cache.delete(request);
            }
        }
    }
}
