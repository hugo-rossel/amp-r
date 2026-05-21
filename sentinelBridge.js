(function () {
    'use strict';

    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get({ sentinel: true }, function (data) {
            const sentinelEnabled = data.sentinel !== false;
            
            // Set DOM attribute on the html tag for sentinel.js to access synchronously
            document.documentElement.setAttribute('data-se-sentinel-enabled', sentinelEnabled.toString());

            // Fire a custom window event in case sentinel.js has already executed or is listening
            window.dispatchEvent(new CustomEvent('SelligentExtenderSettings', {
                detail: { sentinel: sentinelEnabled }
            }));
        });
    }
})();
