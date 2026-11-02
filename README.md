# Cocathédrale Saint-Antoine-de-Padoue — maquette

Maquette visuelle et responsive de la page d’accueil, destinée à une présentation client. Le site est statique (`dist/`) et peut être ouvert directement avec un serveur HTTP local.

Les photographies ont été générées à partir de références visuelles et servent à définir une direction artistique. Les dates d’activités, horaires et textes pratiques doivent être validés avec la paroisse avant une mise en ligne publique. Les boutons de don ne traitent aucun paiement; le formulaire prépare un fichier texte local et ne transmet pas de données.

## Prévisualisation locale

```sh
python3 -m http.server 4173 --directory dist
```

Ouvrir `http://localhost:4173/`.

## Deux versions : statique / premium

Le sélecteur « Version S / P » (en-tête, ou menu sur mobile) bascule en direct entre :
- **Statique (S)** : site basique, sans animation, première image de la bannière seulement, sans vidéo.
- **Premium (P)** : diaporama de 3 images dans la bannière, section des portes (`#visite`), photos qui défilent de droite à gauche (`#gallery`), animations GSAP au défilement (`premium.js`, `premium.css`, bibliothèques locales dans `vendor/`).

`?version=statique` ou `?version=premium` dans l'adresse force le choix.

Section des portes : `assets/portes.mp4` (1080p, ordinateur) et `assets/portes-mobile.mp4` (recadrage vertical, ≤ 760 px) avancent avec le défilement (section épinglée). La vidéo est encodée avec une image clé à chaque image (`ffmpeg -g 1`) pour que le retour en arrière reste fluide. `portes-debut.jpg` sert d'affiche, `portes-fin.jpg` remplace la vidéo quand l'appareil réduit les animations.

Galerie : `assets/galerie/galerie-01.jpg` à `-12.jpg` (800 × 1000). En statique, seules les 4 premières s'affichent.
