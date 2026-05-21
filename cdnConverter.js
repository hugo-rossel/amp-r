(function () {
    'use strict';

    // Verify if CDN converter is active in Chrome storage (defaults to true)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get({ cdnConverter: true }, function (data) {
            if (data.cdnConverter === false) {
                console.log("ÅMP-r (DEV) : Convertisseur CDN désactivé.");
                return;
            }

            performRedirect();
        });
    } else {
        performRedirect();
    }

    function performRedirect() {
        try {
            const url = new URL(window.location.href);
            const path = url.pathname;
            const cdnDom = 'https://statics-slg.rosselcdn.net';
            
            console.log(`ÅMP-r (DEV) : Redirection CDN de ${url.hostname} vers ${cdnDom}...`);
            window.location.href = cdnDom + path;
        } catch (e) {
            console.error(`ÅMP-r (DEV) : Erreur lors de la redirection CDN :`, e);
        }
    }
})();
