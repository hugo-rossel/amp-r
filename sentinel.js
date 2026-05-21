(function () {
    'use strict';

    function initSentinel() {
        const enabledAttr = document.documentElement.getAttribute('data-se-sentinel-enabled');
        if (enabledAttr === 'false') {
            console.log("Rossel Sentinel désactivé par l'extension.");
            return;
        }

        if (enabledAttr === 'true') {
            runInit();
        } else {
            // Wait for settings bridge event from isolated world
            let initialized = false;
            window.addEventListener('SelligentExtenderSettings', function(e) {
                if (initialized) return;
                if (e.detail && e.detail.sentinel === false) {
                    console.log("Rossel Sentinel désactivé par l'extension.");
                    return;
                }
                initialized = true;
                runInit();
            });

            // Robust fallback to initialize if no bridge response after 500ms
            setTimeout(() => {
                if (!initialized) {
                    initialized = true;
                    runInit();
                }
            }, 500);
        }
    }

    function runInit() {
        // Only run on desktop viewport sizes
        if (window.innerWidth < 768) return;

        // Avoid double injection
        if (document.getElementById('slg-sliding-panel')) return;

        /*----------------------------------------------------------------------------------------------------------------------------
        CREATION OF VISUAL ELEMENTS (SLIDING PANEL)
        ----------------------------------------------------------------------------------------------------------------------------*/
        const slidingPanel = document.createElement('aside');
        slidingPanel.setAttribute('id', 'slg-sliding-panel');
        slidingPanel.setAttribute('class', 'slg-sliding-panel');
        slidingPanel.setAttribute('aria-hidden', 'true');
        
        slidingPanel.innerHTML = `
            <!-- Floating Side Actions Wrapper -->
            <div class="slg-side-buttons">
                <button id="slg-refresh-button" class="slg-side-button slg-hidden-button" aria-label="Actualiser les données" title="Actualiser les données">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                </button>

                <button id="slg-toggle-button" class="slg-side-button" aria-label="Afficher le Sentinel" title="Afficher le Sentinel">
                    <svg id="slg-icon-eye" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg id="slg-icon-close" class="slg-icon-hidden" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <button id="slg-copy-button" class="slg-side-button slg-hidden-button" aria-label="Copier le rapport d'incident" title="Copier le rapport d'incident">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>

            <!-- Panel Navigation Header -->
            <div class="slg-panel-header">
                <h2>Rossel Sentinel</h2>
                <div class="slg-panel-selector">
                    <button class="slg-selector-button slg-active" data-target="slg-sub-panel-datalayer">DataLayer</button>
                    <button class="slg-selector-button" data-target="slg-sub-panel-didomi">Didomi</button>
                    <button class="slg-selector-button" data-target="slg-sub-panel-jwt">JWT</button>
                    <button class="slg-selector-button" data-target="slg-sub-panel-crm">CRM</button>
                    <button class="slg-selector-button" data-target="slg-sub-panel-piano">Piano</button>
                    <button class="slg-selector-button" data-target="slg-sub-panel-kameleoon">Kameleoon</button>
                    <button class="slg-selector-button" data-target="slg-sub-panel-cookies">Cookies</button>
                </div>
            </div>

            <!-- Panel Content Wrapper -->
            <div class="slg-panel-content">

                <!-- 1. DATALAYER SUB-PANEL -->
                <div id="slg-sub-panel-datalayer" class="slg-sub-panel slg-sub-panel-grid slg-visible">
                    <div class="slg-search-wrapper">
                        <svg class="slg-search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="slg-search-datalayer" class="slg-search-field" placeholder="Filtrer les variables DataLayer...">
                    </div>
                    <div id="msg-dl" class="panel-message"></div>
                    
                    <div class="slg-card">
                        <h3>Valeurs utilisateur</h3>
                        <ul id="list-dl-user" class="slg-badge-list"></ul>
                    </div>
                    
                    <div class="slg-card">
                        <h3>Valeurs contextuelles</h3>
                        <ul id="list-dl-context" class="slg-badge-list"></ul>
                    </div>
                    
                    <div class="slg-card">
                        <h3>Valeurs vides / non définies</h3>
                        <ul id="list-dl-empty" class="slg-badge-list empty-items"></ul>
                    </div>
                </div>

                <!-- 2. DIDOMI SUB-PANEL -->
                <div id="slg-sub-panel-didomi" class="slg-sub-panel slg-sub-panel-grid">
                    <div class="slg-search-wrapper">
                        <svg class="slg-search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="slg-search-didomi" class="slg-search-field" placeholder="Filtrer les vendors Didomi...">
                    </div>
                    <div id="msg-didomi" class="panel-message"></div>
                    
                    <div class="slg-card">
                        <h3>Sans consentement (Refusé / Absent)</h3>
                        <ul id="list-didomi-no" class="slg-badge-list didomi-no-list"></ul>
                    </div>
                    
                    <div class="slg-card">
                        <h3>Avec consentement (Accepté)</h3>
                        <ul id="list-didomi-yes" class="slg-badge-list didomi-yes-list"></ul>
                    </div>
                </div>

                <!-- 3. JWT SUB-PANEL -->
                <div id="slg-sub-panel-jwt" class="slg-sub-panel">
                    <div id="msg-jwt" class="panel-message"></div>
                    <div class="slg-card">
                        <h3>Contenu du Token Décodé</h3>
                        <ul id="list-jwt" class="slg-jwt-list"></ul>
                    </div>
                </div>

                <!-- 4. CRM & QIOTA SUB-PANEL -->
                <div id="slg-sub-panel-crm" class="slg-sub-panel">
                    <div class="slg-crm-top-bar">
                        <div id="msg-crm" class="panel-message warning-message"></div>
                        <button id="slg-refresh-crm-btn" class="slg-crm-refresh-btn" title="Actualiser les offres CRM">
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: inline-block; vertical-align: middle;">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                            </svg>Actualiser les offres
                        </button>
                    </div>
                    
                    <div class="slg-card">
                        <h3>Offres Selligent SITE Détectées</h3>
                        <ul id="list-site" class="slg-crm-list"></ul>
                    </div>
                    
                    <div class="slg-card">
                        <h3>Configuration Wall Qiota</h3>
                        <ul id="list-qiota" class="slg-qiota-list slg-badge-list"></ul>
                    </div>
                    
                    <div class="slg-card">
                        <h3>Statut Tracker Selligent</h3>
                        <ul id="list-selligent-status" class="slg-badge-list"></ul>
                    </div>
                </div>

                <!-- 5. PIANO ANALYTICS SUB-PANEL -->
                <div id="slg-sub-panel-piano" class="slg-sub-panel">
                    <div class="slg-search-wrapper" style="margin-bottom: 16px;">
                        <svg class="slg-search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="slg-search-piano" class="slg-search-field" placeholder="Filtrer les propriétés Piano...">
                    </div>
                    <div id="msg-piano" class="panel-message"></div>
                    <div class="slg-card">
                        <h3>Propriétés Piano Analytics (pa)</h3>
                        <ul id="list-piano-properties" class="slg-badge-list"></ul>
                    </div>
                </div>

                <!-- 6. KAMELEOON SUB-PANEL -->
                <div id="slg-sub-panel-kameleoon" class="slg-sub-panel">
                    <div id="msg-kameleoon" class="panel-message"></div>
                    <div class="slg-card">
                        <h3>Statut Kameleoon</h3>
                        <ul id="list-kameleoon-status" class="slg-badge-list"></ul>
                    </div>
                </div>

                <!-- 7. COOKIES SUB-PANEL -->
                <div id="slg-sub-panel-cookies" class="slg-sub-panel">
                    <div class="slg-search-wrapper" style="margin-bottom: 16px;">
                        <svg class="slg-search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="slg-search-cookies" class="slg-search-field" placeholder="Filtrer les cookies...">
                    </div>
                    <div class="slg-card">
                        <h3>Cookies Actifs sur ce Domaine</h3>
                        <ul id="list-cookies" class="slg-cookies-list"></ul>
                    </div>
                </div>
            </div>

            <!-- Toast Notification Inside Panel -->
            <div id="slg-toast" class="slg-toast">Rapport copié !</div>
        `;
        document.body.appendChild(slidingPanel);

        /*----------------------------------------------------------------------------------------------------------------------------
        DOM ELEMENTS REFERENCES
        ----------------------------------------------------------------------------------------------------------------------------*/
        const toggleButton = document.getElementById('slg-toggle-button');
        const refreshButton = document.getElementById('slg-refresh-button');
        const copyButton = document.getElementById('slg-copy-button');

        const iconEye = document.getElementById('slg-icon-eye');
        const iconClose = document.getElementById('slg-icon-close');

        const selectorButtons = document.querySelectorAll('.slg-selector-button');
        const subPanels = document.querySelectorAll('.slg-sub-panel');
        const panelContent = document.querySelector('.slg-panel-content');

        // Lists references
        const listDlUser = document.getElementById('list-dl-user');
        const listDlContext = document.getElementById('list-dl-context');
        const listDlEmpty = document.getElementById('list-dl-empty');
        const msgDl = document.getElementById('msg-dl');

        const listDidomiYes = document.getElementById('list-didomi-yes');
        const listDidomiNo = document.getElementById('list-didomi-no');
        const msgDidomi = document.getElementById('msg-didomi');

        const listJwt = document.getElementById('list-jwt');
        const msgJwt = document.getElementById('msg-jwt');

        const listSite = document.getElementById('list-site');
        const listQiota = document.getElementById('list-qiota');
        const listSelligentStatus = document.getElementById('list-selligent-status');
        const msgCrm = document.getElementById('msg-crm');

        const listKameleoonStatus = document.getElementById('list-kameleoon-status');
        const msgKameleoon = document.getElementById('msg-kameleoon');

        const listPianoProperties = document.getElementById('list-piano-properties');
        const msgPiano = document.getElementById('msg-piano');

        const listCookies = document.getElementById('list-cookies');

        /*----------------------------------------------------------------------------------------------------------------------------
        PANEL TOGGLE OPEN / CLOSE
        ----------------------------------------------------------------------------------------------------------------------------*/
        if (toggleButton && slidingPanel) {
            toggleButton.addEventListener('click', function () {
                const isOpen = slidingPanel.classList.toggle('slg-open');
                slidingPanel.setAttribute('aria-hidden', !isOpen);

                if (isOpen) {
                    iconEye.classList.add('slg-icon-hidden');
                    iconClose.classList.remove('slg-icon-hidden');
                    toggleButton.classList.add('slg-button-active');
                    refreshRws();
                } else {
                    iconEye.classList.remove('slg-icon-hidden');
                    iconClose.classList.add('slg-icon-hidden');
                    toggleButton.classList.remove('slg-button-active');
                    // Close stats view inside list if open
                    const popstats = document.getElementById('popstats');
                    if (popstats) popstats.remove();
                }

                refreshButton.classList.toggle('slg-hidden-button', !isOpen);
                copyButton.classList.toggle('slg-hidden-button', !isOpen);
            });
        }

        // Add actual actions for refresh and copy buttons
        if (refreshButton) refreshButton.addEventListener('click', refreshRws);
        if (copyButton) copyButton.addEventListener('click', copyReport);

        // Add action for CRM refresh button
        const refreshCrmBtn = document.getElementById('slg-refresh-crm-btn');
        if (refreshCrmBtn) {
            refreshCrmBtn.addEventListener('click', function () {
                const icon = refreshCrmBtn.querySelector('svg');
                if (icon) {
                    icon.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    icon.style.transform = 'rotate(360deg)';
                    setTimeout(() => {
                        icon.style.transform = '';
                    }, 600);
                }
                sentinelGetCRM();
                showToast("Offres CRM actualisées !");
            });
        }

        // Helper for text search filtering
        function bindSearchFilter(inputId, listIds, keySelector) {
            const input = document.getElementById(inputId);
            if (!input) return;

            input.addEventListener('input', function () {
                const query = this.value.toLowerCase().trim();
                listIds.forEach(listId => {
                    const list = document.getElementById(listId);
                    if (!list) return;

                    const items = list.querySelectorAll('li:not(.slg-list-placeholder)');
                    items.forEach(item => {
                        const keyElem = item.querySelector(keySelector);
                        if (keyElem) {
                            const keyText = keyElem.textContent.toLowerCase();
                            if (keyText.includes(query)) {
                                item.classList.remove('slg-hidden');
                            } else {
                                item.classList.add('slg-hidden');
                            }
                        }
                    });
                });
            });
        }

        // Bind searches
        bindSearchFilter('slg-search-datalayer', ['list-dl-user', 'list-dl-context', 'list-dl-empty'], '.slg-badge-key');
        bindSearchFilter('slg-search-didomi', ['list-didomi-yes', 'list-didomi-no'], '.slg-didomi-key');
        bindSearchFilter('slg-search-piano', ['list-piano-properties'], '.slg-badge-key');
        bindSearchFilter('slg-search-cookies', ['list-cookies'], '.slg-cookie-name');

        /*----------------------------------------------------------------------------------------------------------------------------
        TAB SELECTOR LOGIC
        ----------------------------------------------------------------------------------------------------------------------------*/
        if (selectorButtons.length > 0 && subPanels.length > 0) {
            selectorButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const targetId = this.getAttribute('data-target');

                    selectorButtons.forEach(btn => btn.classList.remove('slg-active'));
                    this.classList.add('slg-active');

                    subPanels.forEach(panel => panel.classList.remove('slg-visible'));

                    const targetPanel = document.getElementById(targetId);
                    if (targetPanel) {
                        targetPanel.classList.add('slg-visible');
                        if (panelContent) {
                            panelContent.scrollTop = 0;
                        }
                    }
                });
            });
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        HELPER: GET COOKIE BY NAME
        ----------------------------------------------------------------------------------------------------------------------------*/
        function getCookieByName(name) {
            const cookieString = document.cookie;
            const cookies = cookieString.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    return cookie.substring(name.length + 1);
                }
            }
            return null;
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        UTILITY: SHOW TOAST
        ----------------------------------------------------------------------------------------------------------------------------*/
        function showToast(message) {
            const toast = document.getElementById('slg-toast');
            if (!toast) return;
            toast.textContent = message;
            toast.classList.add('slg-toast-visible');
            setTimeout(() => {
                toast.classList.remove('slg-toast-visible');
            }, 2500);
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        FEATURE: REFRESH DATA
        ----------------------------------------------------------------------------------------------------------------------------*/
        function refreshRws() {
            // Clear search fields on full data refresh
            const searchDl = document.getElementById('slg-search-datalayer');
            const searchDidomi = document.getElementById('slg-search-didomi');
            const searchPiano = document.getElementById('slg-search-piano');
            const searchCookies = document.getElementById('slg-search-cookies');
            if (searchDl) searchDl.value = '';
            if (searchDidomi) searchDidomi.value = '';
            if (searchPiano) searchPiano.value = '';
            if (searchCookies) searchCookies.value = '';

            // Defensive dataLayer fetching
            let dl = window.dataLayer;
            let args = null;
            let dlMsg = 'dataLayer absent ou vide';

            if (Array.isArray(dl) && dl.length > 0) {
                // Tenter de trouver le member_status_v2
                args = dl.find(e => e && e.member_status_v2);
                dlMsg = 'dataLayer générique';
                
                if (!args) {
                    args = dl.find(e => e && e.event === 'general_page_loaded');
                    dlMsg = 'dataLayer general_page_loaded';
                }
                
                if (!args) {
                    args = dl[0];
                    dlMsg = 'dataLayer[0]';
                }
            }

            // Exécuter tous les modules de collecte
            sentinelGetDlInfos(args, dlMsg);
            sentinelGetCookies();
            sentinelGetCRM();
            sentinelGetDidomi();
            sentinelGetJwt();
            sentinelGetPiano();
            sentinelGetKameleoon();
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: PARSE DATALAYER INFO
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetDlInfos(args, msg) {
            listDlUser.innerHTML = '';
            listDlContext.innerHTML = '';
            listDlEmpty.innerHTML = '';
            msgDl.innerHTML = 'Source : ' + msg;

            if (!args || typeof args !== 'object') {
                msgDl.innerHTML = 'Source : ' + msg + ' (Aucun objet parseable)';
                return;
            }

            for (const key in args) {
                if (Object.prototype.hasOwnProperty.call(args, key)) {
                    const listElement = document.createElement("li");
                    const val = args[key];
                    listElement.innerHTML = `<span class="slg-badge-key">${key}</span><span class="slg-badge-val">${val !== undefined && val !== null ? val : 'null'}</span>`;

                    // Classification
                    const lkey = key.toLowerCase();
                    if (lkey.includes('statu') || lkey.includes('user')) {
                        listDlUser.appendChild(listElement);
                    } else if (val === undefined || val === null || val === '') {
                        listDlEmpty.appendChild(listElement);
                    } else {
                        listDlContext.appendChild(listElement);
                    }
                }
            }

            // Fallbacks in case lists are empty
            if (listDlUser.children.length === 0) listDlUser.innerHTML = '<li class="slg-list-placeholder">Aucune info utilisateur trouvée</li>';
            if (listDlContext.children.length === 0) listDlContext.innerHTML = '<li class="slg-list-placeholder">Aucune info contextuelle trouvée</li>';
            if (listDlEmpty.children.length === 0) listDlEmpty.innerHTML = '<li class="slg-list-placeholder">Aucune valeur vide détectée</li>';
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: GET DOMAIN COOKIES
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetCookies() {
            listCookies.innerHTML = '';
            const cookieString = document.cookie;
            if (!cookieString) {
                listCookies.innerHTML = '<li class="slg-list-placeholder">Aucun cookie détecté sur ce domaine</li>';
                return;
            }

            const cookies = cookieString.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                const parts = cookie.split('=');
                const name = parts.shift();
                const value = parts.join('=');

                const listElement = document.createElement("li");
                listElement.innerHTML = `
                    <div class="slg-cookie-meta">
                        <span class="slg-cookie-name">${name}</span>
                        <span class="slg-cookie-value">${value}</span>
                    </div>
                    <button class="slg-mini-action-btn slg-btn-delete" data-cookie="${name}" title="Supprimer ce cookie">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                `;

                const deleteBtn = listElement.querySelector('.slg-btn-delete');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        const cookieName = this.getAttribute('data-cookie');
                        if (confirm(`Supprimer le cookie "${cookieName}" ?`)) {
                            deleteCookie(cookieName);
                            sentinelGetCookies();
                            showToast(`Cookie "${cookieName}" supprimé !`);
                        }
                    });
                }

                listCookies.appendChild(listElement);
            }
        }

        function deleteCookie(name) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            const hostParts = window.location.hostname.split('.');
            for (let i = 0; i < hostParts.length - 1; i++) {
                const domain = hostParts.slice(i).join('.');
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + domain + ';';
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + domain + ';';
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: CRM & QIOTA
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetCRM() {
            listSite.innerHTML = '';
            listQiota.innerHTML = '';
            msgCrm.innerHTML = '';

            let dl = window.dataLayer;
            let foundOffers = false;

            // Inspect dataLayer to find loaded offers
            if (Array.isArray(dl)) {
                dl.forEach(args => {
                    if (args && typeof args === 'object') {
                        for (const key in args) {
                            if (Object.prototype.hasOwnProperty.call(args, key) && key.toLowerCase().includes('loaded_offer')) {
                                const offerId = args[key];
                                foundOffers = true;

                                const listElement = document.createElement("li");
                                listElement.className = 'slg-crm-offer-item';
                                listElement.setAttribute("data-offer", offerId);
                                
                                listElement.innerHTML = `
                                    <div class="slg-offer-header">
                                        <span class="slg-offer-id">${offerId}</span>
                                        <div class="slg-offer-actions">
                                            <button class="slg-mini-action-btn slg-btn-highlight" data-offer="${offerId}" title="Scroller et surligner l'offre">
                                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                            <button class="slg-mini-action-btn slg-btn-stats" data-offer="${offerId}" title="Afficher les stats Piano Analytics">
                                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none">
                                                    <line x1="18" y1="20" x2="18" y2="10"></line>
                                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                `;
                                listSite.appendChild(listElement);

                                // Add button event listeners
                                listElement.querySelector('.slg-btn-highlight').addEventListener("click", siteHighlight);
                                listElement.querySelector('.slg-btn-stats').addEventListener("click", showStats);
                            }
                        }
                    }
                });
            }

            if (!foundOffers) {
                listSite.innerHTML = '<li class="slg-list-placeholder">Aucune offre Selligent SITE détectée</li>';
            }

            // Qiota detection
            let hasQiotaData = false;

            // Scenario ID
            const qiotaElem = document.querySelector('[data-idscenario]');
            if (qiotaElem && qiotaElem.dataset.idscenario) {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">ID du Wall</span><span class="slg-badge-val">${qiotaElem.dataset.idscenario}</span>`;
                listQiota.appendChild(li);
            }

            // Scenario Name (Cookie)
            const scenarioName = getCookieByName('ck_q_name_scenario');
            if (scenarioName) {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">Nom du Scénario</span><span class="slg-badge-val">${decodeURIComponent(scenarioName)}</span>`;
                listQiota.appendChild(li);
            }

            // Wall Name (Cookie)
            const wallName = getCookieByName('ck_q_name_paywall');
            if (wallName) {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">Nom du Wall</span><span class="slg-badge-val">${decodeURIComponent(wallName)}</span>`;
                listQiota.appendChild(li);
            }

            // AB Test (Cookie)
            const abtest = getCookieByName('qiota_abtest');
            if (abtest) {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">Statut AB Test</span><span class="slg-badge-val active-status">En cours (${abtest})</span>`;
                listQiota.appendChild(li);
            }

            // Live Qiota Globals on Window
            if (window.q_logged !== undefined) {
                hasQiotaData = true;
                const li = document.createElement('li');
                const isLogged = !!window.q_logged;
                li.innerHTML = `<span class="slg-badge-key">q_logged (Connexion)</span><span class="slg-badge-val ${isLogged ? 'active-status' : ''}" style="${!isLogged ? 'color: var(--se-color-error); font-weight: bold;' : ''}">${isLogged ? 'Connecté' : 'Non connecté'}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_subscribed !== undefined) {
                hasQiotaData = true;
                const li = document.createElement('li');
                const isSub = !!window.q_subscribed;
                li.innerHTML = `<span class="slg-badge-key">q_subscribed (Abonnement)</span><span class="slg-badge-val ${isSub ? 'active-status' : ''}" style="${!isSub ? 'color: var(--se-color-error); font-weight: bold;' : ''}">${isSub ? 'Abonné' : 'Non abonné'}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_consent !== undefined) {
                hasQiotaData = true;
                const li = document.createElement('li');
                const isConsent = !!window.q_consent;
                li.innerHTML = `<span class="slg-badge-key">q_consent (Consentement)</span><span class="slg-badge-val ${isConsent ? 'active-status' : ''}" style="${!isConsent ? 'color: var(--se-color-error); font-weight: bold;' : ''}">${isConsent ? 'Oui' : 'Non'}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_email !== undefined && window.q_email !== '') {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">q_email (Compte)</span><span class="slg-badge-val" style="color: #38bdf8; font-family: monospace;">${window.q_email}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_token !== undefined && window.q_token !== '') {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">q_token (Session)</span><span class="slg-badge-val" style="color: #38bdf8; font-family: monospace;">${window.q_token}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_id_article !== undefined && window.q_id_article !== '') {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">q_id_article (Article)</span><span class="slg-badge-val" style="color: #38bdf8; font-family: monospace;">${window.q_id_article}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_content_class !== undefined && window.q_content_class !== '') {
                hasQiotaData = true;
                const li = document.createElement('li');
                li.innerHTML = `<span class="slg-badge-key">q_content_class (Cible)</span><span class="slg-badge-val" style="color: #38bdf8; font-family: monospace;">${window.q_content_class}</span>`;
                listQiota.appendChild(li);
            }

            if (window.q_ressource_uri !== undefined && window.q_ressource_uri !== '') {
                hasQiotaData = true;
                const li = document.createElement('li');
                const cleanUri = window.q_ressource_uri.length > 35 ? window.q_ressource_uri.substring(0, 32) + '...' : window.q_ressource_uri;
                li.innerHTML = `<span class="slg-badge-key">q_ressource_uri</span><span class="slg-badge-val" title="${window.q_ressource_uri}" style="color: #38bdf8; font-family: monospace; font-size: 0.72rem;">${cleanUri}</span>`;
                listQiota.appendChild(li);
            }

            if (!hasQiotaData) {
                listQiota.innerHTML = '<li class="slg-list-placeholder">Aucune information Qiota détectée</li>';
            }

            // Selligent Tracker status
            if (listSelligentStatus) {
                listSelligentStatus.innerHTML = '';
                
                const selligentExecLoaded = typeof window.selligent_exec === 'function';
                const rSelligentLoaded = typeof window.rSelligent === 'function';
                const iSelligentLoaded = typeof window.iSelligent === 'function';
                const wSelligentLoaded = typeof window.wSelligent === 'function';
                
                const isSelligentActive = selligentExecLoaded || rSelligentLoaded || iSelligentLoaded || wSelligentLoaded;
                
                const liMain = document.createElement('li');
                liMain.innerHTML = `<span class="slg-badge-key">Statut Global</span><span class="slg-badge-val ${isSelligentActive ? 'active-status' : ''}" style="${!isSelligentActive ? 'color: var(--se-color-error); font-weight: bold;' : ''}">${isSelligentActive ? 'Actif' : 'Inactif'}</span>`;
                listSelligentStatus.appendChild(liMain);
                
                if (selligentExecLoaded) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="slg-badge-key">selligent_exec <span class="slg-info-icon" data-tooltip="Centralise l'exécution et le déclenchement des campagnes et scénarios CRM.">ⓘ</span></span><span class="slg-badge-val active-status">Chargé (Fonction)</span>`;
                    listSelligentStatus.appendChild(li);
                }
                
                if (rSelligentLoaded) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="slg-badge-key">rSelligent (Tracking) <span class="slg-info-icon" data-tooltip="Gère les requêtes d'envoi et de réception des événements comportementaux.">ⓘ</span></span><span class="slg-badge-val active-status">Chargé (Fonction)</span>`;
                    listSelligentStatus.appendChild(li);
                }
                
                if (iSelligentLoaded) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="slg-badge-key">iSelligent (Tracking) <span class="slg-info-icon" data-tooltip="Initialise et écoute les interactions visuelles sur les offres.">ⓘ</span></span><span class="slg-badge-val active-status">Chargé (Fonction)</span>`;
                    listSelligentStatus.appendChild(li);
                }
                
                if (wSelligentLoaded) {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="slg-badge-key">wSelligent (Tracking) <span class="slg-info-icon" data-tooltip="Initialise les liaisons globales et fenêtres de cookies Selligent.">ⓘ</span></span><span class="slg-badge-val active-status">Chargé (Fonction)</span>`;
                    listSelligentStatus.appendChild(li);
                }
            }

            // Disconnected status detection
            const offlineCookie = getCookieByName('CxCrmDcnt');
            if (offlineCookie) {
                msgCrm.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right:8px;vertical-align:middle;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>L'utilisateur est considéré comme déconnecté par les outils CRM (cookie CxCrmDcnt présent)`;
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        FEATURE: SCROLL & HIGHLIGHT OFFER ELEMENT IN PAGE
        ----------------------------------------------------------------------------------------------------------------------------*/
        function siteHighlight(e) {
            e.stopPropagation();
            const offer = this.dataset.offer;
            const lookedUp = document.querySelector('[data-slg-offer="' + offer + '"]');
            
            if (lookedUp) {
                const container = lookedUp.closest('[data-site-info]');
                if (container) {
                    // Scroll to item
                    container.scrollIntoView({ behavior: "smooth", block: "center" });

                    // Remove any previous highlight class
                    container.classList.remove('se-offer-highlight-pulsate');
                    // Add beautiful modern CSS pulsate animation
                    void container.offsetWidth; // Force reflow to restart animation
                    container.classList.add('se-offer-highlight-pulsate');

                    showToast(`Offre ${offer} localisée !`);
                } else {
                    lookedUp.scrollIntoView({ behavior: "smooth", block: "center" });
                    showToast(`Élément [data-slg-offer] localisé.`);
                }
            } else {
                alert(`Impossible de trouver l'élément visuel pour l'offre ${offer} sur cette page.`);
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: DIDOMI CONSENT
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetDidomi() {
            listDidomiYes.innerHTML = '';
            listDidomiNo.innerHTML = '';
            msgDidomi.innerHTML = '';

            let dl = window.dataLayer;
            let didomiLoadedEvent = null;

            if (Array.isArray(dl)) {
                didomiLoadedEvent = dl.find(e => e && e.event === 'custom-didomi-loaded');
            }

            if (!didomiLoadedEvent || !didomiLoadedEvent.vendors) {
                msgDidomi.innerHTML = 'Aucun événement "custom-didomi-loaded" ou vendors détecté dans le dataLayer.';
                listDidomiYes.innerHTML = '<li class="slg-list-placeholder">Consentements indéterminés</li>';
                listDidomiNo.innerHTML = '<li class="slg-list-placeholder">Consentements indéterminés</li>';
                return;
            }

            const vendors = didomiLoadedEvent.vendors;
            let yesCount = 0;
            let noCount = 0;

            for (const key in vendors) {
                if (Object.prototype.hasOwnProperty.call(vendors, key)) {
                    const li = document.createElement("li");
                    const consent = vendors[key];
                    li.innerHTML = `<span class="slg-didomi-key">${key}</span><span class="slg-didomi-val">${consent}</span>`;

                    if (consent === false || consent === undefined || consent === 'false') {
                        noCount++;
                        listDidomiNo.appendChild(li);
                    } else {
                        yesCount++;
                        listDidomiYes.appendChild(li);
                    }
                }
            }

            msgDidomi.innerHTML = `Didomi chargé. Consentement accordé pour <strong>${yesCount}</strong> vendors, refusé ou absent pour <strong>${noCount}</strong> vendors.`;

            if (yesCount === 0) listDidomiYes.innerHTML = '<li class="slg-list-placeholder">Aucun consentement accordé</li>';
            if (noCount === 0) listDidomiNo.innerHTML = '<li class="slg-list-placeholder">Aucun refus détecté</li>';
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: JWT TOKEN DECODER
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetJwt() {
            listJwt.innerHTML = '';
            msgJwt.innerHTML = '';

            const jwtToken = getCookieByName('jwtToken');
            let decodedObj = null;

            if (jwtToken) {
                try {
                    const parts = jwtToken.split(".");
                    if (parts.length >= 2 && parts[1]) {
                        // Support unicode base64 decoding correctly
                        const base64Url = parts[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));

                        decodedObj = JSON.parse(jsonPayload);
                    }
                } catch (e) {
                    console.error("Sentinel JWT decode error:", e);
                    msgJwt.innerHTML = 'Erreur lors du décodage du cookie "jwtToken"';
                }
            }

            if (decodedObj) {
                msgJwt.innerHTML = 'Cookie "jwtToken" détecté et décodé avec succès.';
                
                for (const key in decodedObj) {
                    if (Object.prototype.hasOwnProperty.call(decodedObj, key)) {
                        const li = document.createElement("li");
                        const val = decodedObj[key];
                        
                        if (key === 'd' && typeof val === 'object') {
                            li.innerHTML = `<span class="slg-jwt-key">data (d)</span><pre class="slg-jwt-pre">${JSON.stringify(val, null, 2)}</pre>`;
                        } else {
                            li.innerHTML = `<span class="slg-jwt-key">${key}</span><span class="slg-jwt-val">${typeof val === 'object' ? JSON.stringify(val) : val}</span>`;
                        }
                        listJwt.appendChild(li);
                    }
                }
            } else {
                msgJwt.innerHTML = 'Aucun cookie "jwtToken" valide trouvé sur ce domaine';
                listJwt.innerHTML = '<li class="slg-list-placeholder">Aucune session active JWT</li>';
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: PIANO ANALYTICS
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetPiano() {
            if (!listPianoProperties || !msgPiano) return;
            listPianoProperties.innerHTML = '';
            msgPiano.innerHTML = '';

            if (typeof window.pa === 'undefined') {
                msgPiano.innerHTML = 'Piano Analytics (pa) n\'est pas chargé sur cette page.';
                listPianoProperties.innerHTML = '<li class="slg-list-placeholder">Piano Analytics absent</li>';
                return;
            }

            let visitorId = 'Indéterminé';
            try {
                if (typeof window.pa.getVisitorId === 'function') {
                    visitorId = window.pa.getVisitorId();
                }
            } catch(e) {
                console.error("Sentinel Piano Visitor ID error:", e);
            }

            msgPiano.innerHTML = `Piano Analytics détecté.<br><strong>Visitor ID :</strong> <span style="font-family: monospace; color: #38bdf8;">${visitorId}</span>`;

            let hasProps = false;
            const props = window.pa._properties;
            if (props && typeof props === 'object') {
                for (const key in props) {
                    if (Object.prototype.hasOwnProperty.call(props, key)) {
                        const propObj = props[key];
                        let val = '';
                        if (propObj && typeof propObj === 'object') {
                            val = propObj.value !== undefined ? propObj.value : '';
                        } else {
                            val = propObj;
                        }

                        hasProps = true;
                        const li = document.createElement('li');
                        li.innerHTML = `<span class="slg-badge-key">${key}</span><span class="slg-badge-val" style="${val === '' || val === null ? 'font-style: italic; color: var(--se-brand-orange);' : ''}">${val !== '' && val !== null ? val : 'null'}</span>`;
                        listPianoProperties.appendChild(li);
                    }
                }
            }

            if (!hasProps) {
                listPianoProperties.innerHTML = '<li class="slg-list-placeholder">Aucune propriété Piano Analytics détectée</li>';
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        MODULE: KAMELEOON
        ----------------------------------------------------------------------------------------------------------------------------*/
        function sentinelGetKameleoon() {
            if (!listKameleoonStatus || !msgKameleoon) return;
            listKameleoonStatus.innerHTML = '';
            msgKameleoon.innerHTML = '';

            let hasKameleoon = typeof window.Kameleoon !== 'undefined';
            let visitorCode = 'Inconnu';

            // 1. Get Visitor Code
            if (hasKameleoon && window.Kameleoon.API) {
                if (window.Kameleoon.API.visitorCode) {
                    visitorCode = window.Kameleoon.API.visitorCode;
                } else if (typeof window.Kameleoon.API.getVisitorCode === 'function') {
                    visitorCode = window.Kameleoon.API.getVisitorCode();
                }
            }
            if (visitorCode === 'Inconnu') {
                try {
                    const lsCode = localStorage.getItem('kameleoonVisitorCode');
                    if (lsCode) visitorCode = lsCode;
                } catch(e) {}
            }
            if (visitorCode === 'Inconnu') {
                try {
                    const match = document.cookie.match(/(?:^|; )kameleoonVisitorCode=([^;]*)/);
                    if (match) visitorCode = decodeURIComponent(match[1]);
                } catch(e) {}
            }

            // 2. Discover tests/campaigns
            const detectedTests = {}; // keyed by type + id

            if (hasKameleoon && window.Kameleoon.API) {
                const API = window.Kameleoon.API;

                // a. Experiments.getActive()
                if (API.Experiments && typeof API.Experiments.getActive === 'function') {
                    try {
                        const activeExps = API.Experiments.getActive();
                        if (Array.isArray(activeExps)) {
                            activeExps.forEach(exp => {
                                const id = exp.id;
                                const name = exp.name || '';
                                let varName = 'Inconnue';
                                if (exp.associatedVariation) {
                                    varName = exp.associatedVariation.name || exp.associatedVariation.id || 'Variation';
                                }
                                detectedTests[`exp-${id}`] = {
                                    id: id,
                                    name: name,
                                    type: 'Expérience',
                                    variation: varName,
                                    source: 'API (Actif)',
                                    isActive: true
                                };
                            });
                        }
                    } catch(e) { console.error("Sentinel getActive Experiments error:", e); }
                }

                // b. Personalizations.getActive()
                if (API.Personalizations && typeof API.Personalizations.getActive === 'function') {
                    try {
                        const activePers = API.Personalizations.getActive();
                        if (Array.isArray(activePers)) {
                            activePers.forEach(pers => {
                                const id = pers.id;
                                const name = pers.name || '';
                                let varName = 'Inconnue';
                                if (pers.associatedVariation) {
                                    varName = pers.associatedVariation.name || pers.associatedVariation.id || 'Variation';
                                }
                                detectedTests[`pers-${id}`] = {
                                    id: id,
                                    name: name,
                                    type: 'Personnalisation',
                                    variation: varName,
                                    source: 'API (Actif)',
                                    isActive: true
                                };
                            });
                        }
                    } catch(e) { console.error("Sentinel getActive Personalizations error:", e); }
                }

                // c. Experiments.getActivatedInVisit()
                if (API.Experiments && typeof API.Experiments.getActivatedInVisit === 'function') {
                    try {
                        const visitExps = API.Experiments.getActivatedInVisit();
                        if (Array.isArray(visitExps)) {
                            visitExps.forEach(exp => {
                                const id = exp.id;
                                const name = exp.name || '';
                                let varName = 'Inconnue';
                                if (exp.associatedVariation) {
                                    varName = exp.associatedVariation.name || exp.associatedVariation.id || 'Variation';
                                }
                                const key = `exp-${id}`;
                                if (!detectedTests[key]) {
                                    detectedTests[key] = {
                                        id: id,
                                        name: name,
                                        type: 'Expérience',
                                        variation: varName,
                                        source: 'API (Visite)',
                                        isActive: false
                                    };
                                }
                            });
                        }
                    } catch(e) { console.error("Sentinel getActivatedInVisit Experiments error:", e); }
                }

                // d. Personalizations.getActivatedInVisit()
                if (API.Personalizations && typeof API.Personalizations.getActivatedInVisit === 'function') {
                    try {
                        const visitPers = API.Personalizations.getActivatedInVisit();
                        if (Array.isArray(visitPers)) {
                            visitPers.forEach(pers => {
                                const id = pers.id;
                                const name = pers.name || '';
                                let varName = 'Inconnue';
                                if (pers.associatedVariation) {
                                    varName = pers.associatedVariation.name || pers.associatedVariation.id || 'Variation';
                                }
                                const key = `pers-${id}`;
                                if (!detectedTests[key]) {
                                    detectedTests[key] = {
                                        id: id,
                                        name: name,
                                        type: 'Personnalisation',
                                        variation: varName,
                                        source: 'API (Visite)',
                                        isActive: false
                                    };
                                }
                            });
                        }
                    } catch(e) { console.error("Sentinel getActivatedInVisit Personalizations error:", e); }
                }

                // e. Old getActiveCampaigns()
                if (typeof API.getActiveCampaigns === 'function') {
                    try {
                        const campaigns = API.getActiveCampaigns();
                        if (campaigns && typeof campaigns === 'object') {
                            for (const cid in campaigns) {
                                const variation = campaigns[cid];
                                let varName = typeof variation === 'object' ? (variation.name || variation.id || JSON.stringify(variation)) : variation;
                                const key = `camp-${cid}`;
                                if (!detectedTests[key]) {
                                    detectedTests[key] = {
                                        id: cid,
                                        name: '',
                                        type: 'Campagne',
                                        variation: varName,
                                        source: 'API (Campagnes)',
                                        isActive: true
                                    };
                                }
                            }
                        }
                    } catch(e) { console.error("Sentinel getActiveCampaigns error:", e); }
                }
            }

            // 3. Scan LocalStorage for Kameleoon keys
            let hasLSEntries = false;
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!key) continue;

                    let type = '';
                    let id = '';
                    let prefix = '';

                    if (key.startsWith('kameleoonExperiment-')) {
                        type = 'Expérience';
                        id = key.replace('kameleoonExperiment-', '');
                        prefix = 'exp-';
                    } else if (key.startsWith('kameleoonPersonalization-')) {
                        type = 'Personnalisation';
                        id = key.replace('kameleoonPersonalization-', '');
                        prefix = 'pers-';
                    }

                    if (type && id) {
                        hasLSEntries = true;
                        const uniqueKey = `${prefix}${id}`;
                        const storedVal = localStorage.getItem(key);
                        let variationVal = 'Assignée';
                        if (storedVal) {
                            try {
                                const parsed = JSON.parse(storedVal);
                                if (parsed && typeof parsed === 'object') {
                                    variationVal = parsed.variationId || parsed.value || parsed.variation || JSON.stringify(parsed);
                                } else {
                                    variationVal = parsed;
                                }
                            } catch(e) {
                                variationVal = storedVal;
                            }
                        }

                        if (!detectedTests[uniqueKey]) {
                            detectedTests[uniqueKey] = {
                                id: id,
                                name: '',
                                type: type,
                                variation: variationVal,
                                source: 'Stockage local',
                                isActive: false
                            };
                        }
                    }
                }
            } catch(e) {
                console.error("Sentinel scan localStorage for Kameleoon error:", e);
            }

            // Determine Kameleoon status message
            let isKameleoonDetected = hasKameleoon || visitorCode !== 'Inconnu' || hasLSEntries;

            if (isKameleoonDetected) {
                if (hasKameleoon) {
                    msgKameleoon.innerHTML = 'Kameleoon est actif sur cette page.';
                } else {
                    msgKameleoon.innerHTML = 'Kameleoon est présent (données détectées dans le stockage/cookies).';
                }

                // Add Visitor Code badge
                let isJsonVisitor = false;
                let visitorId = visitorCode;
                let visitorExpiry = '';

                try {
                    const parsed = JSON.parse(visitorCode);
                    if (parsed && typeof parsed === 'object') {
                        isJsonVisitor = true;
                        visitorId = parsed.value || visitorCode;
                        if (parsed.expirationDate) {
                            const expDate = new Date(parsed.expirationDate);
                            if (!isNaN(expDate.getTime())) {
                                visitorExpiry = expDate.toLocaleDateString('fr-FR') + ' ' + expDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                            } else {
                                visitorExpiry = parsed.expirationDate;
                            }
                        }
                    }
                } catch (e) {
                    // Not JSON, treat as plain string
                }

                const liVisitor = document.createElement('li');
                liVisitor.className = 'slg-kameleoon-item';
                let htmlVisitor = `<strong>Code Visiteur</strong>`;
                htmlVisitor += `<span class="slg-kameleoon-detail">Identifiant : <span class="slg-kameleoon-val-inline">${visitorId}</span></span>`;
                if (visitorExpiry) {
                    htmlVisitor += `<span class="slg-kameleoon-detail">Date d'expiration : <span class="slg-kameleoon-expiry-inline">${visitorExpiry}</span></span>`;
                }
                liVisitor.innerHTML = htmlVisitor;
                listKameleoonStatus.appendChild(liVisitor);

                // Add all detected tests
                const testKeys = Object.keys(detectedTests);
                if (testKeys.length > 0) {
                    testKeys.forEach(tKey => {
                        const test = detectedTests[tKey];
                        const displayName = test.name ? `${test.name} (#${test.id})` : `#${test.id}`;
                        const statusLabel = test.isActive ? 'Actif' : 'Assigné';
                        const li = document.createElement('li');
                        li.className = 'slg-kameleoon-item';
                        li.innerHTML = `
                            <strong>${test.type}</strong>
                            <span class="slg-kameleoon-detail">Nom : <span class="slg-kameleoon-val-inline">${displayName}</span></span>
                            <span class="slg-kameleoon-detail">Variation : <span class="slg-kameleoon-val-inline">${test.variation}</span> <span class="slg-kameleoon-source-info">(${statusLabel} via ${test.source})</span></span>
                        `;
                        listKameleoonStatus.appendChild(li);
                    });
                } else {
                    const liNone = document.createElement('li');
                    liNone.className = 'slg-kameleoon-item';
                    liNone.innerHTML = `<strong>Expériences/Tests</strong><span class="slg-kameleoon-detail" style="font-style: italic; color: var(--se-sentinel-text-secondary);">Aucune campagne active ou assignée détectée</span>`;
                    listKameleoonStatus.appendChild(liNone);
                }
            } else {
                msgKameleoon.innerHTML = 'Kameleoon n\'est pas détecté ou chargé sur cette page.';
                listKameleoonStatus.innerHTML = '<li class="slg-list-placeholder">Kameleoon absent</li>';
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        FEATURE: STATS / PIANO ANALYTICS POPUP MODAL
        ----------------------------------------------------------------------------------------------------------------------------*/
        function showStats(e) {
            e.stopPropagation();
            
            // Remove previous popstats if already open
            const oldPop = document.getElementById('popstats');
            if (oldPop) oldPop.remove();

            const offer = this.dataset.offer;
            const container = this.closest('li');

            const popstats = document.createElement("div");
            popstats.setAttribute("id", "popstats");
            popstats.className = "slg-popstats-container";
            
            popstats.innerHTML = `
                <div class="slg-popstats-header">
                    <h4>Piano Analytics Body - Offre ${offer}</h4>
                    <p>Requête des événements et visiteurs uniques sur les 7 derniers jours.</p>
                </div>
                <textarea id="pianoapibody" readonly class="slg-stats-textarea"></textarea>
                <div class="slg-popstats-actions">
                    <button id="close-button-stats" class="slg-stats-btn slg-stats-btn-cancel">Fermer</button>
                    <button id="gotopiano" class="slg-stats-btn slg-stats-btn-primary">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="margin-right:6px;vertical-align:middle;">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>Copier & Ouvrir Piano
                    </button>
                </div>
            `;

            container.appendChild(popstats);

            // Calculate Date range: Last 7 days to yesterday
            const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const dateTo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
            const endDate = dateTo.toISOString().split('T')[0];
            const startDate = dateFrom.toISOString().split('T')[0];

            const apibody = document.getElementById('pianoapibody');
            apibody.value = JSON.stringify({
                "columns": [
                    "event_level_3",
                    "event_level_2",
                    "event_level_4",
                    "m_events",
                    "m_unique_visitors"
                ],
                "sort": [
                    "-m_events"
                ],
                "filter": {
                    "property": {
                        "$AND": [
                            {
                                "event_level_1": {
                                    "$eq": "selligent"
                                }
                            },
                            {
                                "event_level_3": {
                                    "$eq": offer
                                }
                            }
                        ]
                    }
                },
                "space": {
                    "s": [
                        618481, 618452, 618453, 618451, 618450, 618342, 618333, 94191,
                        618335, 618340, 618339, 618338, 618341, 618454, 618449, 631996,
                        629410, 629411, 629412, 629413, 629420, 629421, 629426, 629427,
                        629428, 638036
                    ]
                },
                "period": {
                    "p1": [
                        {
                            "type": "D",
                            "start": startDate,
                            "end": endDate
                        }
                    ]
                },
                "max-results": 50,
                "page-num": 1,
                "options": {
                    "ignore_null_properties": true,
                    "eco_mode": true
                }
            }, null, 2);

            // Bind events
            document.getElementById('gotopiano').addEventListener("click", goToPiano);
            document.getElementById("close-button-stats").addEventListener("click", closeStats);
        }

        function closeStats(e) {
            if (e) e.stopPropagation();
            const popstats = document.getElementById('popstats');
            if (popstats) popstats.remove();
        }

        function goToPiano(e) {
            e.stopPropagation();
            const copyText = document.getElementById("pianoapibody");
            if (copyText) {
                copyText.select();
                copyText.setSelectionRange(0, 99999999);
                navigator.clipboard.writeText(copyText.value);
                
                showToast("Body de l'API copié !");
                setTimeout(() => {
                    window.open('https://analytics.piano.io/dataquery/#/designer', '_blank').focus();
                }, 400);
            }
        }

        /*----------------------------------------------------------------------------------------------------------------------------
        FEATURE: COPY COMPREHENSIVE INCIDENT REPORT
        ----------------------------------------------------------------------------------------------------------------------------*/
        function copyReport() {
            const dreport = new Date();

            let html = '<p>Navigation</p><ul><li>Page : '
                + window.location.href
                + '</li><li>Timing : '
                + dreport.toString()
                + '</li></ul><div><br>||--------------------------<br>||DataLayer<br>||--------------------------</div>'
                + msgDl.innerHTML
                + listDlUser.innerHTML
                + listDlContext.innerHTML
                + listDlEmpty.innerHTML
                + '<div><br>||--------------------------<br>||JWT<br>||--------------------------</div>'
                + msgJwt.innerHTML
                + listJwt.innerHTML
                + '<div><br>||--------------------------<br>||Didomi<br>||--------------------------</div>'
                + msgDidomi.innerHTML
                + listDidomiYes.innerHTML
                + listDidomiNo.innerHTML
                + '<div><br>||--------------------------<br>||CRM & QIOTA<br>||--------------------------</div>'
                + msgCrm.innerHTML
                + listSite.innerHTML
                + listQiota.innerHTML
                + (listSelligentStatus ? listSelligentStatus.innerHTML : '')
                + '<div><br>||--------------------------<br>||Piano Analytics<br>||--------------------------</div>'
                + msgPiano.innerHTML
                + (listPianoProperties ? listPianoProperties.innerHTML : '')
                + '<div><br>||--------------------------<br>||Kameleoon<br>||--------------------------</div>'
                + msgKameleoon.innerHTML
                + (listKameleoonStatus ? listKameleoonStatus.innerHTML : '')
                + '<div><br>||--------------------------<br>||Cookies<br>||--------------------------</div>'
                + listCookies.innerHTML;

            // Format HTML into pretty text matching Tampermonkey parser exactly
            html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
            html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
            html = html.replace(/<\/div>/ig, '\n');
            html = html.replace(/<\/li>/ig, '\n');
            html = html.replace(/<li>/ig, '  *  ');
            html = html.replace(/<\/ul>/ig, '\n');
            html = html.replace(/<\/p>/ig, '\n');
            html = html.replace(/<br\s*[\/]?>/gi, "\n");
            
            // Custom adjustments to make badges look nice in plain text
            html = html.replace(/<span class="slg-badge-key"[^>]*>([^<]+)<\/span><span class="slg-badge-val"[^>]*>([^<]+)<\/span>/g, '$1 : $2');
            html = html.replace(/<span class="slg-cookie-name"[^>]*>([^<]+)<\/span>\s*<span class="slg-cookie-value"[^>]*>([^<]+)<\/span>/g, '$1 : $2');
            html = html.replace(/<span class="slg-didomi-key"[^>]*>([^<]+)<\/span><span class="slg-didomi-val"[^>]*>([^<]+)<\/span>/g, '$1 : $2');
            html = html.replace(/<span class="slg-jwt-key"[^>]*>([^<]+)<\/span><span class="slg-jwt-val"[^>]*>([^<]+)<\/span>/g, '$1 : $2');
            
            html = html.replace(/<[^>]+>/ig, '');
            
            // Clean duplicate empty lines
            html = html.split('\n').map(line => line.trim()).filter((line, i, arr) => line !== '' || arr[i - 1] !== '').join('\n');

            navigator.clipboard.writeText(html).then(() => {
                showToast("Rapport d'incident copié !");
            }).catch(err => {
                console.error("Report copy failed:", err);
                alert("Erreur lors de la copie du rapport dans le presse-papiers.");
            });
        }
    }

    /*----------------------------------------------------------------------------------------------------------------------------
    INITIALIZATION LOADER
    ----------------------------------------------------------------------------------------------------------------------------*/
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSentinel();
    } else {
        window.addEventListener('load', initSentinel);
    }
})();
