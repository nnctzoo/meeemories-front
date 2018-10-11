'use strict';

const CACHE_NAME = '%CACHE_NAME%';
const urlsToCache = [
  //libファイル
  '/lib/jquery-3.3.1.min.js',
  '/lib/stimulus.umd.js',
  '/lib/jsrender.min.js',
  //ソースファイル
  '/src/stimulus.extensions.js',
  '/src/controllers/index.js',
  '/src/controllers/logo.js',
  '/src/controllers/app.js',
  '/src/controllers/list.js',
  '/src/controllers/media-item.js',
  '/src/controllers/uploading-item.js',
  '/src/controllers/popup.js',
  '/src/controllers/menu.js',
  '/src/sw-register.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('Opened cache');

      // 指定されたリソースをキャッシュに追加する
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // ホワイトリストにないキャッシュ(古いキャッシュ)は削除する
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method.toUpperCase() !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.headers.get('Cache-Control') === 'no-cache') {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.method.toUpperCase() !== 'GET' && event.request.url === 'https://api.meeemori.es/contents') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  const cacheKey = event.request.url;
  event.respondWith(
    caches.match(cacheKey)
    .then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response)
            return response;

          if (response.status !== 200 && response.type !== 'opaque')
            return response;
          
          if (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')
            return response;

          if (response.headers.get('Cache-Control') === 'no-cache')
            return response;
          

          // 重要：レスポンスを clone する。レスポンスは Stream で
          // ブラウザ用とキャッシュ用の2回必要。なので clone して
          // 2つの Stream があるようにする
          let responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(cacheKey, responseToCache);
            });

          return response;
        });
    })
  );
});
