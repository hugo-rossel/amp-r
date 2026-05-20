const GITHUB_REPO = "hugo-rossel/selligent-extender";
const CHECK_INTERVAL = 12 * 60 * 60 * 1000; // 12 heures en millisecondes

// Vérifie si une mise à jour est disponible sur GitHub
async function checkForUpdates() {
    try {
        const storage = await chrome.storage.local.get(['lastCheckTime', 'latestVersion']);
        const now = Date.now();

        // Éviter de surcharger l'API GitHub (limite d'appels d'API non authentifiés)
        if (storage.lastCheckTime && (now - storage.lastCheckTime < CHECK_INTERVAL)) {
            console.log("Selligent EXTender : Vérification récente, reportée.");
            return;
        }

        console.log("Selligent EXTender : Vérification des mises à jour sur GitHub...");
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        
        if (!response.ok) {
            throw new Error(`Erreur API GitHub : ${response.status}`);
        }

        const data = await response.json();
        const rawTag = data.tag_name; // Exemple: "v1.3.1812" ou "1.3.1812"
        const cleanVersion = rawTag.replace(/^v/, ""); // Retire le 'v' initial
        const downloadUrl = data.html_url;

        // Enregistre les informations dans le stockage de l'extension
        await chrome.storage.local.set({
            latestVersion: cleanVersion,
            downloadUrl: downloadUrl,
            lastCheckTime: now
        });
        
        console.log(`Selligent EXTender : Dernière version GitHub trouvée : ${cleanVersion}`);
    } catch (error) {
        console.error("Selligent EXTender : Échec de la vérification de mise à jour", error);
    }
}

// Lancement à l'initialisation de l'extension ou lors de la navigation
chrome.runtime.onInstalled.addListener(checkForUpdates);
chrome.runtime.onStartup.addListener(checkForUpdates);

// Écoute les requêtes du Content Script ou d'autres parties de l'extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "triggerUpdateCheck") {
        checkForUpdates().then(() => sendResponse({ success: true }));
        return true; // Garde le canal ouvert pour sendResponse asynchrone
    }
});
