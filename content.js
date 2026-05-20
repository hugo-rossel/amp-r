(function() {
    console.log("Selligent EXTender (DEV) chargé.");

    // Gestion du clic extérieur pour fermer le volet
    document.addEventListener('mousedown', (e) => {
        const window = document.querySelector('.x-window.bt-window');
        if (!window) return;

        const isClickInside = window.contains(e.target);
        const isDropdown = e.target.closest('.x-boundlist');
        const isExtModal = e.target.closest('.selligent-extender-modal');
        const isExtOverlay = e.target.classList.contains('selligent-extender-modal-overlay');

        if (!isClickInside && !isDropdown && !isExtModal && !isExtOverlay) {
            const cancelBtn = window.querySelector('.btnCancel');
            if (cancelBtn) {
                cancelBtn.click();
            }
        }
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList.contains('x-boundlist') || node.querySelector('.x-boundlist')) {
                        const boundList = node.classList.contains('x-boundlist') ? node : node.querySelector('.x-boundlist');
                        addSearchFieldToList(boundList);
                    }
                    checkDescriptionField(node);
                    checkModalWindows(node);
                    // Nouvelle fonctionnalité : Coloration des offres
                    checkOfferList(node);
                    // Assistant nomenclature Engage
                    checkEngageNomenclature();
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check for current page type
    checkEngageNomenclature();

    // --- FONCTIONNALITÉ 1 : RECHERCHE AVANCÉE ---

    function addSearchFieldToList(boundList) {
        if (boundList.querySelector('.selligent-extender-search-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'selligent-extender-search-wrapper';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'selligent-extender-search-input';
        input.placeholder = 'Rechercher...';
        input.autocomplete = 'off';

        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '&times;';
        clearBtn.className = 'selligent-extender-clear-btn';
        clearBtn.title = 'Vider la recherche';

        const noResult = document.createElement('div');
        noResult.className = 'selligent-extender-no-result';
        noResult.textContent = 'Aucun résultat trouvé';
        noResult.style.display = 'none';

        wrapper.appendChild(input);
        wrapper.appendChild(clearBtn);

        const listEl = boundList.querySelector('.x-boundlist-list-ct') || boundList.firstChild;
        boundList.insertBefore(wrapper, listEl);
        boundList.appendChild(noResult);

        input.addEventListener('click', (e) => e.stopPropagation());
        input.addEventListener('mousedown', (e) => e.stopPropagation());

        const filterItems = () => {
            const rawSearch = input.value;
            const searchText = rawSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const items = boundList.querySelectorAll('.x-boundlist-item');
            let visibleCount = 0;

            clearBtn.style.display = rawSearch ? 'block' : 'none';

            items.forEach(item => {
                // On stocke l'innerHTML original si ce n'est pas déjà fait
                if (item.dataset.originalHtml === undefined) {
                    item.dataset.originalHtml = item.innerHTML;
                }
                
                const originalHtml = item.dataset.originalHtml;
                // Pour la recherche, on utilise le textContent (sans balises)
                const normalizedContent = item.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                if (normalizedContent.includes(searchText)) {
                    item.classList.remove('hidden-by-filter');
                    visibleCount++;
                    
                    if (searchText) {
                        // Si l'item contient des balises complexes (comme une table), on ne fait pas de highlight 
                        // pour éviter de corrompre le HTML. On restaure juste l'original.
                        if (originalHtml.includes('<table') || originalHtml.includes('<TABLE')) {
                            item.innerHTML = originalHtml;
                        } else {
                            const regex = new RegExp(`(${escapeRegExp(rawSearch)})`, 'gi');
                            item.innerHTML = originalHtml.replace(regex, '<span class="selligent-extender-highlight">$1</span>');
                        }
                    } else {
                        item.innerHTML = originalHtml;
                    }
                } else {
                    item.classList.add('hidden-by-filter');
                }
            });

            noResult.style.display = (visibleCount === 0) ? 'block' : 'none';
        };

        input.addEventListener('input', filterItems);
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            filterItems();
            input.focus();
        });

        setTimeout(() => input.focus(), 100);
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // --- FONCTIONNALITÉ 2 : ASSISTANT DESCRIPTION ---

    function checkDescriptionField(container) {
        const labels = container.querySelectorAll('label');
        labels.forEach(label => {
            if (label.textContent.trim() === "Description") {
                const panel = label.closest('div[id$="-innerCt"]');
                if (panel) {
                    const textarea = panel.querySelector('textarea[name="Description"]');
                    if (textarea && !panel.querySelector('.selligent-extender-desc-btn')) {
                        const isGlobal = label.style.width === "568px" || panel.id.includes('panel-1829') || panel.id.includes('panel-2827');
                        const btnText = isGlobal ? "Ajouter une description" : "Lien du contenu lié";
                        
                        const btn = document.createElement('button');
                        btn.className = 'selligent-extender-desc-btn';
                        btn.textContent = btnText;
                        
                        label.parentNode.insertBefore(btn, label);

                        const updateVisibility = () => {
                            btn.style.display = (textarea.value.trim() === "") ? "inline-block" : "none";
                        };
                        
                        const valObserver = new MutationObserver(updateVisibility);
                        valObserver.observe(textarea, { attributes: true, attributeFilter: ['value'] });
                        
                        textarea.addEventListener('input', updateVisibility);
                        textarea.addEventListener('change', updateVisibility);
                        
                        let checkCount = 0;
                        const interval = setInterval(() => {
                            updateVisibility();
                            if (++checkCount > 40) clearInterval(interval);
                        }, 500);

                        updateVisibility();

                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            showDescriptionModal(isGlobal, (data) => {
                                if (isGlobal) {
                                    textarea.value = `Objectif : ${data.val1}\n\nJM lié : ${data.val2}`;
                                } else {
                                    textarea.value = `Lien du contenu lié : ${data.val1}`;
                                }
                                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                                textarea.dispatchEvent(new Event('change', { bubbles: true }));
                                updateVisibility();
                            });
                        });
                    }
                }
            }
        });
    }

    function showDescriptionModal(isGlobal, callback) {
        const overlay = document.createElement('div');
        overlay.className = 'selligent-extender-modal-overlay';
        
        const title = isGlobal ? "Assistant Description" : "Lien Contenu";
        const label1 = isGlobal ? "Objectif de la campagne" : "Lien du contenu lié";
        const label2 = "Lien du JM lié";
        
        overlay.innerHTML = `
            <div class="selligent-extender-modal">
                <h3>${title}</h3>
                <div class="selligent-extender-modal-field">
                    <label>${label1}</label>
                    <input type="text" id="ext-field-1" autocomplete="off">
                </div>
                ${isGlobal ? `
                <div class="selligent-extender-modal-field">
                    <label>${label2}</label>
                    <input type="text" id="ext-field-2" autocomplete="off">
                </div>
                ` : ''}
                <div class="selligent-extender-modal-actions">
                    <button class="selligent-extender-btn selligent-extender-btn-cancel" id="ext-cancel">Annuler</button>
                    <button class="selligent-extender-btn selligent-extender-btn-save" id="ext-save">Valider</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        const f1 = document.getElementById('ext-field-1');
        f1.focus();

        const close = () => document.body.removeChild(overlay);
        document.getElementById('ext-cancel').onclick = close;
        document.getElementById('ext-save').onclick = () => {
            const data = {
                val1: f1.value,
                val2: isGlobal ? document.getElementById('ext-field-2').value : ''
            };
            callback(data);
            close();
        };
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
    }

    // --- FONCTIONNALITÉ 3 : STYLING DES FENÊTRES ---

    function checkModalWindows(container) {
        const windows = container.classList?.contains('x-window') ? [container] : container.querySelectorAll('.x-window.bt-window');
        windows.forEach(win => {
            const fieldsets = win.querySelectorAll('fieldset');
            fieldsets.forEach((fs, index) => {
                const legendTitle = fs.querySelector('.x-fieldset-header-text-collapsible');
                const text = legendTitle ? legendTitle.textContent : '';

                if (index === 0 && !legendTitle) {
                    fs.classList.add('se-section-global');
                } else if (text.includes('What?')) {
                    fs.classList.add('se-section-what');
                } else if (text.includes('When?')) {
                    fs.classList.add('se-section-when');
                    if (fs.classList.contains('x-fieldset-collapsed')) {
                        legendTitle.click();
                        setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
                    }
                }
            });
        });
    }

    // --- FONCTIONNALITÉ 4 : COLORATION DE LA LISTE D'OFFRES ---

    function checkOfferList(container) {
        // Dans Selligent, les lignes peuvent être des .x-grid-item, .x-grid-row ou .x-grid-table
        // On cherche tous les candidats potentiels dans le container
        const items = container.querySelectorAll('.x-grid-item, .x-grid-row, .x-grid-table');
        
        items.forEach(item => processRow(item));

        // Si le container lui-même est une ligne
        if (container.classList && (
            container.classList.contains('x-grid-item') || 
            container.classList.contains('x-grid-row') || 
            container.classList.contains('x-grid-table')
        )) {
            processRow(container);
        }
    }

    function processRow(row) {
        // Éviter de recalculer si déjà coloré avec succès
        if (row.dataset.seColorized === 'true') return;

        // On cherche l'icône de statut
        const icon = row.querySelector('.bt-icon-Live, .bt-icon-Paused, .bt-icon-Finished, .bt-icon-Design');
        
        if (icon) {
            let statusClass = '';
            if (icon.classList.contains('bt-icon-Live')) statusClass = 'se-row-live';
            else if (icon.classList.contains('bt-icon-Paused')) statusClass = 'se-row-paused';
            else if (icon.classList.contains('bt-icon-Finished')) statusClass = 'se-row-stopped';
            else if (icon.classList.contains('bt-icon-Design')) statusClass = 'se-row-planned';

            if (statusClass) {
                row.classList.add(statusClass);
                row.dataset.seColorized = 'true';
            }
        }
    }

    // --- FONCTIONNALITÉ 5 : NOMENCLATURE ENGAGE ---

    let engageNomState = {
        creator: 'CX',
        showBrands: false,
        isSiteContent: false,
        selectedBrands: [],
        customBrand: '',
        type: 'OS',
        objective: 'ACQ',
        desc: ''
    };

    function checkEngageNomenclature() {
        if (!window.location.href.includes('rossel.emsecure.net')) return;
        if (!window.location.href.includes('properties/Message')) return;

        const nameInput = document.querySelector('input[formcontrolname="name"]');
        const apiInput = document.querySelector('input[formcontrolname="apiName"]');

        if (nameInput && !nameInput.dataset.seNomenclatureReady) {
            injectNomenclatureBtn(nameInput, 'clean');
            nameInput.dataset.seNomenclatureReady = 'true';
        }
        if (apiInput && !apiInput.dataset.seNomenclatureReady) {
            injectNomenclatureBtn(apiInput, 'tech');
            apiInput.dataset.seNomenclatureReady = 'true';
        }
    }

    function injectNomenclatureBtn(input, type) {
        const btn = document.createElement('button');
        btn.className = 'se-nomenclature-btn';
        btn.innerHTML = '💡';
        btn.title = 'Générer la nomenclature';
        
        // Placement à droite du champ
        const parent = input.parentNode;
        parent.style.display = 'flex';
        parent.style.alignItems = 'center';
        parent.appendChild(btn);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showNomenclatureModal((nomenclature) => {
                const nameInput = document.querySelector('input[formcontrolname="name"]');
                if (nameInput) {
                    nameInput.value = nomenclature.human;
                    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });
    }

    function showNomenclatureModal(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'selligent-extender-modal-overlay';
        
        const creators = ['CX', 'VDN', 'NL', 'RNP', 'SUD', 'CTR', 'LS', 'SM', 'MES'];
        const brands = ['CP', 'AN', 'PN', 'VDN', 'NL', 'NLH', 'UN', 'AR', 'EE', 'LC', 'MESS', 'MESH', 'SUD', 'CTR', 'LS', 'SM'];
        const objectives = [
            { label: 'Acquisition (ACQ)', value: 'ACQ' },
            { label: 'Diminution du churn (CHURN)', value: 'CHURN' },
            { label: 'Conversion (CONV)', value: 'CONV' },
            { label: 'Engagement (ENGMT)', value: 'ENGMT' },
            { label: 'Surf Connecté (SURFCO)', value: 'SURFCO' },
            { label: 'Connaissance Client (VOC)', value: 'VOC' }
        ];
        
        overlay.innerHTML = `
            <div class="selligent-extender-modal">
                <div class="selligent-extender-modal-header">
                    <h3>Assistant Nomenclature Engage</h3>
                    <button class="se-btn-last-values" id="se-nom-load-last" title="Restaurer les valeurs de la dernière génération réussie">Utiliser les dernières valeurs</button>
                </div>
                
                <div class="se-modal-form-group">
                    <label>Créateur</label>
                    <select id="se-nom-creator">
                        ${creators.map(c => `<option value="${c}" ${engageNomState.creator === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>

                <div class="se-modal-form-group">
                    <label>Objectif marketing</label>
                    <select id="se-nom-objective">
                        ${objectives.map(o => `<option value="${o.value}" ${engageNomState.objective === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
                    </select>
                </div>

                <div class="se-modal-form-group">
                    <label class="se-checkbox-group">
                        <input type="checkbox" id="se-nom-is-site" ${engageNomState.isSiteContent ? 'checked' : ''}>
                        <span>Contenu SITE</span>
                    </label>
                </div>

                <div class="se-modal-form-group">
                    <label class="se-checkbox-group">
                        <input type="checkbox" id="se-nom-show-brands" ${engageNomState.showBrands ? 'checked' : ''}>
                        <span>Choix des marques</span>
                    </label>
                    <div id="se-nom-brand-wrapper" class="se-brand-container" style="${engageNomState.showBrands ? 'display:block;' : 'display:none;'}">
                        <div class="se-brand-grid" id="se-nom-brands">
                            ${brands.map(b => `<div class="se-brand-chip ${engageNomState.selectedBrands.includes(b) ? 'active' : ''}" data-brand="${b}">${b}</div>`).join('')}
                            <div class="se-brand-chip ${engageNomState.customBrand ? 'active' : ''}" id="se-nom-brand-other">Autre</div>
                        </div>
                        <input type="text" id="se-nom-brand-custom" placeholder="Autre (4 car. max)" style="${engageNomState.customBrand ? 'display:block;' : 'display:none;'}" maxlength="4" value="${engageNomState.customBrand}">
                    </div>
                </div>

                <div class="se-modal-form-group">
                    <label>Type</label>
                    <select id="se-nom-type">
                        <option value="OS" ${engageNomState.type === 'OS' ? 'selected' : ''}>One Shot</option>
                        <option value="REC" ${engageNomState.type === 'REC' ? 'selected' : ''}>Récurrent</option>
                    </select>
                </div>

                <div class="se-modal-form-group">
                    <label>Nom du contenu (obligatoire)</label>
                    <input type="text" id="se-nom-desc" placeholder="ex: Soldes ete" value="${engageNomState.desc}">
                </div>

                <div class="selligent-extender-modal-actions">
                    <button class="selligent-extender-btn selligent-extender-btn-cancel" id="se-nom-cancel">Annuler</button>
                    <button class="selligent-extender-btn selligent-extender-btn-save" id="se-nom-save">Générer</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const brandWrapper = document.getElementById('se-nom-brand-wrapper');
        const showBrandsCb = document.getElementById('se-nom-show-brands');
        const isSiteCb = document.getElementById('se-nom-is-site');
        const creatorSelect = document.getElementById('se-nom-creator');
        const objectiveSelect = document.getElementById('se-nom-objective');
        const typeSelect = document.getElementById('se-nom-type');
        const descInput = document.getElementById('se-nom-desc');
        const customInput = document.getElementById('se-nom-brand-custom');
        const otherChip = document.getElementById('se-nom-brand-other');
        const brandChips = overlay.querySelectorAll('.se-brand-chip');

        showBrandsCb.onchange = () => brandWrapper.style.display = showBrandsCb.checked ? 'block' : 'none';

        let currentSelectedBrands = [...engageNomState.selectedBrands];

        const updateChipsUI = () => {
            brandChips.forEach(chip => {
                const b = chip.dataset.brand;
                if (b) {
                    chip.classList.toggle('active', currentSelectedBrands.includes(b));
                }
            });
        };

        brandChips.forEach(chip => {
            chip.onclick = () => {
                if (chip.id === 'se-nom-brand-other') {
                    if (chip.classList.contains('active')) {
                        chip.classList.remove('active');
                        customInput.style.display = 'none';
                    } else {
                        chip.classList.add('active');
                        customInput.style.display = 'block';
                        customInput.focus();
                    }
                } else {
                    const b = chip.dataset.brand;
                    if (chip.classList.contains('active')) {
                        chip.classList.remove('active');
                        currentSelectedBrands = currentSelectedBrands.filter(x => x !== b);
                    } else {
                        chip.classList.add('active');
                        currentSelectedBrands.push(b);
                    }
                }
            };
        });

        document.getElementById('se-nom-load-last').onclick = () => {
            const saved = localStorage.getItem('se_engage_nom_last_values');
            if (saved) {
                const last = JSON.parse(saved);
                creatorSelect.value = last.creator;
                objectiveSelect.value = last.objective;
                typeSelect.value = last.type;
                descInput.value = last.desc;
                showBrandsCb.checked = last.showBrands;
                showBrandsCb.dispatchEvent(new Event('change'));
                isSiteCb.checked = last.isSiteContent || false;
                currentSelectedBrands = [...last.selectedBrands];
                updateChipsUI();
                if (last.customBrand) {
                    otherChip.classList.add('active');
                    customInput.style.display = 'block';
                    customInput.value = last.customBrand;
                } else {
                    otherChip.classList.remove('active');
                    customInput.style.display = 'none';
                    customInput.value = '';
                }
            } else {
                alert("Aucune valeur enregistrée pour le moment.");
            }
        };

        const close = () => document.body.removeChild(overlay);
        document.getElementById('se-nom-cancel').onclick = close;
        
        document.getElementById('se-nom-save').onclick = () => {
            const creator = creatorSelect.value;
            const objective = objectiveSelect.value;
            const type = typeSelect.value;
            const desc = descInput.value.trim();
            const showBrands = showBrandsCb.checked;
            const isSiteContent = isSiteCb.checked;
            const isOtherActive = otherChip.classList.contains('active');
            const customBrandValue = customInput.value.trim().toUpperCase();

            if (!desc) { alert('Le nom du contenu est obligatoire'); return; }

            engageNomState = {
                creator: creator,
                objective: objective,
                type: type,
                desc: desc,
                showBrands: showBrands,
                isSiteContent: isSiteContent,
                selectedBrands: currentSelectedBrands,
                customBrand: isOtherActive ? customBrandValue : ''
            };

            localStorage.setItem('se_engage_nom_last_values', JSON.stringify(engageNomState));

            let brandsList = [...currentSelectedBrands];
            if (showBrands && isOtherActive && customBrandValue) {
                brandsList.push(customBrandValue);
            }

            const date = new Date().toISOString().split('T')[0].substring(2).replace(/-/g, '');
            
            let cleanDesc = desc.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
            cleanDesc = cleanDesc.replace(/[-']/g, ' '); 
            cleanDesc = cleanDesc.replace(/\s+/g, ' ').trim(); 

            let humanParts = [creator];
            if (type === 'OS') humanParts[0] += date;
            if (isSiteContent) humanParts.push('SITE');
            humanParts.push(objective);
            humanParts.push(cleanDesc);
            if (showBrands && brandsList.length > 0) humanParts.push(brandsList.join('_'));
            const resHuman = humanParts.join(' - ');

            callback({
                human: resHuman,
                tech: '' 
            });
            close();
        };

        overlay.onclick = (e) => { if (e.target === overlay) close(); };
    }

    // --- FONCTIONNALITÉ 6 : BANDEAU DE NOTIFICATION DE MISE A JOUR ---

    async function checkExtensionUpdate() {
        if (typeof chrome === "undefined" || !chrome.storage) return;

        try {
            const data = await chrome.storage.local.get(['latestVersion', 'downloadUrl', 'dismissedVersion']);
            const currentVersion = chrome.runtime.getManifest().version;
            
            if (!data.latestVersion) return;

            // Si la version distante est strictement supérieure à la version actuelle
            if (isVersionGreater(data.latestVersion, currentVersion)) {
                // Et si l'utilisateur n'a pas déjà ignoré cette version spécifique
                if (data.dismissedVersion !== data.latestVersion) {
                    showUpdateBanner(data.latestVersion, data.downloadUrl);
                }
            }
        } catch (e) {
            console.warn("Selligent EXTender : Erreur de vérification locale de mise à jour :", e);
        }
    }

    // Comparaison de versions X.Y.ZZZZ ou X.Y
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

    function showUpdateBanner(newVersion, downloadUrl) {
        if (document.getElementById('se-update-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'se-update-banner';
        banner.className = 'se-update-banner-container';
        
        banner.innerHTML = `
            <div class="se-update-banner-content">
                <div class="se-update-banner-icon">🚀</div>
                <div class="se-update-banner-text">
                    <span class="se-update-title">Mise à jour disponible !</span>
                    <span class="se-update-desc">Une nouvelle version stable de <strong>Selligent EXTender</strong> (${newVersion}) est en ligne.</span>
                </div>
                <div class="se-update-banner-actions">
                    <a href="${downloadUrl}" target="_blank" class="se-update-btn-download" id="se-update-btn-go">Mettre à jour</a>
                    <button class="se-update-btn-dismiss" id="se-update-btn-ignore">Plus tard</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        document.getElementById('se-update-btn-go').onclick = () => {
            banner.remove();
        };

        document.getElementById('se-update-btn-ignore').onclick = async () => {
            if (typeof chrome !== "undefined" && chrome.storage) {
                await chrome.storage.local.set({ dismissedVersion: newVersion });
            }
            banner.classList.add('se-update-banner-out');
            setTimeout(() => banner.remove(), 400);
        };
    }

    // Lancer la vérification au chargement
    checkExtensionUpdate();
})();
