const CACHE_NAME = "azde-prep-v1.0.0";

const STATIC_FILES = [

    "./",
    "./index.html",
    "./databricks.html",
    "./databricks_old.html",
    "./old.html",

    "./manifest.json",

    "./icon-192.png"

];


// INSTALL

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME).then(async cache => {

            for (const file of STATIC_FILES) {

                try {

                    await cache.add(file);

                    console.log("✅ Cached:", file);

                } catch (err) {

                    console.error("❌ Failed:", file, err);

                }

            }

        })

    );

});


// ACTIVATE

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME)

                        return caches.delete(key);

                })

            )

        )

    );

    self.clients.claim();

});


// FETCH

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request)

            .then(cacheResponse => {

                if (cacheResponse)

                    return cacheResponse;

                return fetch(event.request)

                    .then(networkResponse => {

                        const clone = networkResponse.clone();

                        caches.open(CACHE_NAME)

                            .then(cache => cache.put(event.request, clone));

                        return networkResponse;

                    })

                    .catch(() => caches.match("./index.html"));

            })

    );

});
