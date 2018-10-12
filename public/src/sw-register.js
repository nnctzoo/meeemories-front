if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js')
                       .catch(console.error.bind(console));
    navigator.serviceWorker.getRegistration().then(registration => {
        registration.update();
    })
}


