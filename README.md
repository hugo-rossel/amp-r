# 📥 [Télécharger la dernière version](https://github.com/hugo-rossel/amp-r/releases/latest)

---

# 🚀 ÅMP-r (Ampli Rossel)

**ÅMP-r** (anciennement *Selligent EXTender*) est une extension Chrome interne de pointe développée pour enrichir l'expérience utilisateur, fluidifier les diagnostics et simplifier l'utilisation quotidienne des plateformes internes et des sites média du groupe Rossel.

Elle dispose d'un panneau d'options moderne vous permettant d'**activer ou de désactiver chaque fonctionnalité individuellement** selon vos besoins.

---

## ✨ Les 4 Fonctionnalités Principales

### 1. 🎨 SITE UI (Selligent SITE)
* **Coloration dynamique** : Mise en évidence visuelle immédiate des lignes du tableau des offres selon leur statut de diffusion (Vert pour *Live*, Orange pour *Paused*, Rouge pour *Stopped*, Bleu pour *Planned*) avec survol lumineux amélioré.
* **Fermeture par clic extérieur** : Fermeture instantanée et ergonomique des tiroirs et fenêtres modales en cliquant en dehors du panneau.
* **Recherche et filtres** : Recherche ultra-rapide avec surbrillance directe dans les listes déroulantes complexes.
* **Assistant descriptions** : Insertion rapide et standardisée de descriptions documentées en un clic.

### 2. 💡 SLG namer (experimental) (Selligent Engage)
* **Standardisation de la Nomenclature** : Générateur intelligent injecté directement à côté des champs de texte de nommage sur `rossel.emsecure.net`.
* **Mémoire locale** : Mémorisation de vos dernières sélections (créateur, marques, objectifs) pour générer des noms structurés en un clin d'œil (`[CREA+DATE] - [SITE (opt)] - [OBJ] - [CLEAN_NAME] - [BRANDS]`).

### 3. 🔍 Sentinel (Rossel Web Sentinel)
* **Panneau de Diagnostic News** : Un volet d'analyse en verre dépoli (glassmorphism) injecté nativement sur tous les sites Rossel (ex: Le Soir, Sudinfo, etc.).
* **didomi Tracker** : Visualisation claire des consentements accordés ou refusés.
* **dataLayer & Cookies** : Explorateur instantané des variables du dataLayer et des cookies de session.
* **Décodeur JWT** : Décodage instantané à la volée des payloads des tokens d'authentification.
* **Vérificateur d'offres CRM** : Détection des offres Selligent chargées sur le site avec mise en surbrillance vibrante.

### 4. ⚡ CDN Interceptor
* Interception intelligente et conversion automatique à la volée des requêtes d'images Azure blob storage vers les domaines de distribution CDN Rossel pour des performances accrues.

---

## ⚙️ Panneau de Configuration

Grâce à la popup de l'extension (accessible en cliquant sur l'icône de l'extension dans votre barre d'outils Chrome) :
- Vous pouvez **activer ou désactiver de façon indépendante** chacune de ces 4 fonctionnalités.
- Vous pouvez lancer manuellement une vérification des mises à jour à tout moment.

---

## 📥 Guide d'Installation

Pour installer l'extension sur Google Chrome :

1. **Télécharger l'extension** :
   - Rendez-vous sur la page des **[Releases GitHub](https://github.com/hugo-rossel/amp-r/releases)**.
   - Téléchargez l'archive compressée **`selligent-extender.zip`** (le package officiel) de la dernière version stable.
2. **Extraire l'archive** :
   - Extrayez le contenu de l'archive dans un dossier permanent et sécurisé de votre disque dur (ex : `C:\AMP-r`).
   - **⚠️ Important** : Ne supprimez pas ce dossier après installation, Chrome s'y réfère continuellement.
3. **Charger l'extension dans Chrome** :
   - Allez à l'adresse **`chrome://extensions/`** dans Chrome.
   - Activez le **Mode développeur** en haut à droite.
   - Cliquez sur **Charger l'extension non empaquetée** (Load unpacked) en haut à gauche.
   - Sélectionnez le dossier décompressé (celui contenant le fichier `manifest.json`).
4. **C'est prêt !** L'extension est active. Vous pouvez configurer vos préférences en cliquant sur son icône.

---

## 🔄 Guide de Mise à Jour

Lorsqu'une mise à jour de l'extension est disponible, un élégant bandeau d'alerte s'affiche automatiquement en bas à droite de votre écran sur Selligent. 

1. Cliquez sur **Mettre à jour** dans le bandeau (cela ouvrira la page des Releases sur GitHub).
2. Téléchargez le nouveau fichier **`selligent-extender.zip`**.
3. Extrayez-le et remplacez les fichiers existants dans votre dossier d'installation permanent (ex : `C:\AMP-r`).
4. Accédez à **`chrome://extensions/`** et cliquez sur le bouton **Actualiser 🔄** sur la carte de l'extension *ÅMP-r*.
