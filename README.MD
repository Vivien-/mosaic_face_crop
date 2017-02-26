# Résultats

## Avec un upload d'image individuel

L'administrateur choisit :

1. Son image
2. Optionnel (par défault 0) la limite de détection : un nombre qui indique le niveau d'assurance pour la détection des yeux. Si ce nombre est élevé seul les yeux les plus apparant seront sélectionner (et donc beaucoup d'yeux seront manquant). Si ce nombre est faible tout ce qui resemble à une paire d'yeux sera séletionné (est donc avec des faux positifs). Un bon ordre d'idée de ce nombre est entre -1 et 1.
![s4](https://cloud.githubusercontent.com/assets/8009496/22622645/3a5ec470-eb40-11e6-9844-b760fe00d8bc.png)

- Les yeux détecter détéctés par le server sont indiqués en surbrillance :
![s5](https://cloud.githubusercontent.com/assets/8009496/22622644/3a5d41e0-eb40-11e6-8697-87b2bdc9b0ff.png)

- L'administrateur peut sélectionner les paires d'yeux non détecter par le server en cliquant et glissant sa souris sur la zone voulue / et supprimer les fausses détections avec un ctrl+clic (suppression de la zone la plus proche du clic)
![s6](https://cloud.githubusercontent.com/assets/8009496/22622646/3a602234-eb40-11e6-8d3e-0dbd0f144b7b.png)

- Et valide lorsqu'il est satisfait des zones représentant les yeux
![s7](https://cloud.githubusercontent.com/assets/8009496/22622647/3a69645c-eb40-11e6-93a3-d41afdedca6a.png)


## Avec un ensemble d'images

En uploadant un fichier .tar contenant une arborescence de dossiers et d'images :
1. L'UI indique l'avancement des différentes phase du job (upload, détection des yeux, crop des images)
![s1](https://cloud.githubusercontent.com/assets/8009496/22622641/3a50c276-eb40-11e6-84dc-a1da0fdd29ad.png)

2. Dans la partie publique se trouve l'accès aux images avec la même arborescence que dans le tar fourni par l'utilisateur.
![s2](https://cloud.githubusercontent.com/assets/8009496/22622642/3a5427f4-eb40-11e6-8f34-2589bbeeed16.png)

3. Les images sont découpés pour ne laisser que les yeux détectés, et lorsque l'utilisateur clique sur l'une d'entre elle c'est l'image original qui apparait. 
![s3](https://cloud.githubusercontent.com/assets/8009496/22622643/3a54e4a0-eb40-11e6-8acd-66939e5e69c9.png)

# Installation

## Prérequis

1. nodejs, l'installation dépend de l'os mais tout est très bien expliqué ici (même pour mac) : https://nodejs.org/en/
2. npm, qui est installé avec node. https://docs.npmjs.com/getting-started/installing-node
3. Pour avoir les features d'auto-detection : utiliser detect-eyes (https://github.com/Vivien-/detect-eyes), compiler et placer l'executable dans la racine du projet mosaic_face_crop

## Mise en place de l'application

`git clone https://github.com/Vivien-/mosaic_face_crop.git`

`cd mosaic_face_crop`

`npm install` 
install les dépendances

# Configuration

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
