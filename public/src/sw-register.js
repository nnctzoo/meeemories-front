if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
                           .then(registration => {
                               registration.update();
                           })
                           .catch(console.error.bind(console));
}


