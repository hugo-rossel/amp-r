# 🚀 Selligent EXTender (Production)

**Selligent EXTender** est une extension Chrome interne développée pour enrichir l'expérience utilisateur et simplifier l'utilisation quotidienne de la plateforme Selligent. 

Elle est conçue avec soin pour apporter des améliorations esthétiques, fluidifier la navigation et automatiser certaines tâches complexes.

---

## ✨ Fonctionnalités Clés

* **💡 Assistant Nomenclature Engage** : Génération semi-automatisée et intelligente de nomenclatures standardisées (respect du formalisme `[CREA+DATE] - [SITE] - [OBJ] - [CLEAN_NAME] - [BRANDS]`) directement sur les formulaires de message, avec mémoire persistante (`localStorage`).
* **🔍 Recherche Avancée** : Recherche instantanée et filtrage avec surbrillance dans les listes déroulantes complexes de Selligent.
* **🎨 Coloration de la Liste d'Offres (SITE)** : Coloration dynamique des lignes du tableau des offres selon leur statut de diffusion (Vert pour *Live*, Orange pour *Paused*, Rouge pour *Finished*, Bleu pour *Design*), avec survol lumineux amélioré.
* **📝 Assistant de Description** : Remplissage rapide et standardisé des champs de description pour documenter en un clic vos campagnes.
* **📊 Optimisation des Tableaux Engage** : Ajustement automatique de la largeur des colonnes dans les grands tableaux (ex : colonnes de nom élargies à 450px minimum, troncature propre des colonnes types et descriptions).
* **🔔 Notification de Mise à Jour** : Alerte visuelle premium de type "glassmorphism" qui s'affiche automatiquement en bas à droite de Selligent dès qu'une nouvelle version stable de l'extension est publiée sur GitHub.

---

## 📥 Guide d'Installation (Première installation)

Pour installer l'extension sur Google Chrome, suivez ces étapes simples :

1. **Télécharger l'extension** :
   - Allez sur la page des **[Releases GitHub](https://github.com/hugo-rossel/selligent-extender/releases)** de ce dépôt.
   - Téléchargez le fichier compressé **`selligent-extender.zip`** de la version la plus récente.
2. **Extraire l'archive** :
   - Extrayez le contenu du fichier `.zip` dans un dossier permanent et sécurisé sur votre disque dur (par exemple : `C:\SelligentExtender` ou un dossier dédié dans vos documents).
   - **⚠️ Important** : Ne supprimez pas ce dossier après installation, car Chrome a besoin d'y accéder en permanence pour faire fonctionner l'extension.
3. **Charger l'extension dans Chrome** :
   - Ouvrez Google Chrome et accédez à la page des extensions en saisissant **`chrome://extensions/`** dans la barre d'adresse.
   - En haut à droite de l'écran, activez l'option **Mode développeur**.
   - En haut à gauche, cliquez sur le bouton **Charger l'extension non empaquetée** (Load unpacked).
   - Sélectionnez le dossier dans lequel vous avez extrait le fichier `.zip` (le dossier contenant le fichier `manifest.json`).
4. **C'est prêt !** L'extension est désormais active et opérationnelle sur vos pages Selligent (`site.slgnt.eu` et `rossel.emsecure.net`).

---

## 🔄 Guide de Mise à Jour (Nouvelle version)

Lorsqu'une mise à jour de l'extension est disponible, un bandeau d'alerte moderne apparaîtra automatiquement sur Selligent. Pour installer la mise à jour :

1. Cliquez sur le bouton **Mettre à jour** du bandeau d'alerte (cela ouvrira la page des Releases sur GitHub).
2. Téléchargez le nouveau fichier **`selligent-extender.zip`**.
3. Extrayez son contenu et **remplacez tous les fichiers existants** dans votre dossier d'installation permanent actuel (ex : `C:\SelligentExtender`).
4. Allez sur **`chrome://extensions/`** dans Chrome.
5. Sur la carte de l'extension *Selligent EXTender*, cliquez sur l'icône **Actualiser 🔄** (la flèche circulaire en bas à droite de la carte).
6. **Terminé !** La nouvelle version est active immédiatement sans qu'il soit nécessaire de relancer Chrome.

---

## 🛠️ Stack Technique

* **Format** : Google Chrome Extension (Manifest V3)
* **Design & CSS System** : CSS3 Vanilla de pointe, variables d'état harmonisées et composants de type glassmorphism floutés.
* **Service Worker** : Vérification asynchrone découplée en arrière-plan pour interroger l'API GitHub sans altérer les performances de chargement des pages Selligent.
