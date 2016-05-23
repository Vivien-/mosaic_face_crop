# Installation

## Prérequis

1. nodejs, l'installation dépend de l'os mais tout est très bien expliqué ici (même pour mac) : https://nodejs.org/en/
2. npm, qui est installé avec node. https://docs.npmjs.com/getting-started/installing-node

## Mise en place de l'application

`git clone https://github.com/Vivien-/mosaic_face_crop.git`

`cd mosaic_face_crop`

`npm install` install les dépendances

#Configuration

Le fichier config.js permet de configurer votre application :
Modifiez `config.options.root` par le chemin `$root/public`
Modifiez `config.port` par le port sur lequel vous voulez lancer l'application

# Run 

1. Pour lancer l'appli, se déplacer dans $root et lancer la commande suivante : `node server.js`
2. Dans un navigateur, lancer localhost:3000

# Usage 

1. Uploader des images avec le bouton à droite, lors de l'upload une unique detection automatique des yeux est faite, et est suggéré un rectangle de crop.

2. Cette zone de crop peut soit être validée, sinon il est possible d'en faire une via l'outil graphique.

3. Cliquer sur Validate ROI pour valider la zone de crop
