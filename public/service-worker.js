'use strict';

const CACHE_NAME = 'cache-v1';
const urlsToCache = [
  //libファイル
  '/lib/jquery-3.3.1.min.js',
  '/lib/stimulus.umd.js',
  '/lib/jsrender.min.js',
  //ソースファイル
  '/src/stimulus.extensions.js',
  '/src/controllers/index.js',
  '/src/controllers/app.js',
  '/src/controllers/list.js',
  '/src/controllers/media-item.js',
  '/src/controllers/uploading-item.js',
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
  event.respondWith(
    caches.match(event.request)
    .then((response) => {
      if (response) {
        return response;
      }

      // 重要：リクエストを clone する。リクエストは Stream なので
      // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
      // 必要なので、リクエストは clone しないといけない
      let fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 重要：レスポンスを clone する。レスポンスは Stream で
          // ブラウザ用とキャッシュ用の2回必要。なので clone して
          // 2つの Stream があるようにする
          let responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
    })
  );
});