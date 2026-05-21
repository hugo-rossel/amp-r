document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const toggleSiteUi = document.getElementById('toggle-site-ui');
    const toggleSlgNamer = document.getElementById('toggle-slg-namer');
    const toggleSentinel = document.getElementById('toggle-sentinel');
    const toggleCdnConverter = document.getElementById('toggle-cdn-converter');
    const extVersion = document.getElementById('ext-version');
    const updateBtn = document.getElementById('update-btn');
    const statusMessage = document.getElementById('status-message');

    // 1. Display Current Extension Version
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        extVersion.textContent = 'v' + manifest.version;
    }

    // 2. Load settings from storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get({
            siteUi: true,
            slgNamer: false,
            sentinel: true,
            cdnConverter: true
        }, function (items) {
            toggleSiteUi.checked = items.siteUi;
            toggleSlgNamer.checked = items.slgNamer;
            toggleSentinel.checked = items.sentinel;
            toggleCdnConverter.checked = items.cdnConverter;
            updateStatusText();
        });
    }

    // 3. Save settings on change
    function saveSetting(key, val) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            const data = {};
            data[key] = val;
            chrome.storage.local.set(data, function() {
                updateStatusText();
            });
        }
    }

    toggleSiteUi.addEventListener('change', () => saveSetting('siteUi', toggleSiteUi.checked));
    toggleSlgNamer.addEventListener('change', () => saveSetting('slgNamer', toggleSlgNamer.checked));
    toggleSentinel.addEventListener('change', () => saveSetting('sentinel', toggleSentinel.checked));
    toggleCdnConverter.addEventListener('change', () => saveSetting('cdnConverter', toggleCdnConverter.checked));

    function updateStatusText() {
        const activeCount = [
            toggleSiteUi.checked,
            toggleSlgNamer.checked,
            toggleSentinel.checked,
            toggleCdnConverter.checked
        ].filter(Boolean).length;

        if (activeCount === 4) {
            statusMessage.innerHTML = '<span class="status-success">Toutes les fonctionnalités sont actives.</span>';
        } else if (activeCount === 0) {
            statusMessage.innerHTML = '<span style="color: var(--text-secondary)">Toutes les fonctionnalités sont inactives.</span>';
        } else {
            statusMessage.innerHTML = `<span style="color: var(--text-secondary)">${activeCount} / 4 fonctionnalités actives.</span>`;
        }
    }

    // 4. Update Check Action
    if (updateBtn) {
        updateBtn.addEventListener('click', function () {
            updateBtn.disabled = true;
            updateBtn.classList.add('loading');
            statusMessage.innerHTML = 'Connexion à GitHub...';

            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                // Trigger manual update check forcing bypass of 12h interval
                chrome.runtime.sendMessage({ action: 'triggerUpdateCheck', force: true }, function (response) {
                    // Slight delay for premium feel
                    setTimeout(() => {
                        updateBtn.disabled = false;
                        updateBtn.classList.remove('loading');

                        if (response && response.success) {
                            chrome.storage.local.get(['latestVersion', 'downloadUrl'], function (data) {
                                const currentVersion = chrome.runtime.getManifest().version;
                                if (data.latestVersion && isVersionGreater(data.latestVersion, currentVersion)) {
                                    statusMessage.innerHTML = `<span class="status-update">MàJ disponible ! <a href="${data.downloadUrl}" target="_blank">Télécharger v${data.latestVersion}</a></span>`;
                                } else {
                                    statusMessage.innerHTML = '<span class="status-success">Votre extension est à jour !</span>';
                                }
                            });
                        } else {
                            statusMessage.innerHTML = '<span style="color: var(--error)">Échec de la connexion. Réessayez.</span>';
                        }
                    }, 800);
                });
            } else {
                setTimeout(() => {
                    updateBtn.disabled = false;
                    updateBtn.classList.remove('loading');
                    statusMessage.innerHTML = '<span class="status-success">Votre extension est à jour !</span>';
                }, 800);
            }
        });
    }

    // Version parsing helper X.Y.ZZZZ or X.Y
    function isVersionGreater(remote, local) {
        const remoteParts = remote.split('.').map(Number);
        const localParts = local.split('.').map(Number);
        
        for (let i = 0; i < Math.max(remoteParts.length, localParts.length); i++) {
            const r = remoteParts[i] || 0;
            const l = localParts[i] || 0;
            if (r > l) return true;
            if (r < l) return false;
        }
        return false;
    }
});
