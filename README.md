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
- **Premium (P)** : diaporama de 3 images dans la bannière, section vidéo (`#visite`), animations GSAP au défilement (`premium.js`, `premium.css`, bibliothèques locales dans `vendor/`).

`?version=statique` ou `?version=premium` dans l'adresse force le choix. La vidéo attendue est `assets/video-visite.mp4` (tant qu'elle manque, la photo d'affiche s'affiche).
