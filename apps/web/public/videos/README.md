# Assets Vidéos - Yamaha Demo Ride Tour

## 📹 Vidéos nécessaires

### Vidéo Hero (page d'accueil)
**Fichier:** `hero-video.mp4`

**Spécifications:**
- **Format:** MP4 (H.264 codec)
- **Résolution:** 1920x1080 minimum (Full HD)
- **Ratio:** Libre (sera en object-fit: cover)
- **Durée:** 10-30 secondes (loop automatique)
- **Poids:** <10 MB (idéalement 5-8 MB)
- **FPS:** 30 fps
- **Audio:** Optionnel (peut être muté par défaut)

**Contenu:**
- Motos Yamaha en action
- Routes sinueuses ou paysages français
- Atmosphère dynamique et attractive
- Qualité cinématographique

**Compression:**
```bash
# Exemple avec ffmpeg
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -vf scale=1920:1080 -c:a aac -b:a 128k hero-video.mp4
```

---

### Vidéo Promotionnelle
**Fichier:** `drt-promo.mp4`

**Spécifications:**
- **Format:** MP4 (H.264 codec)
- **Résolution:** 1280x720 ou 1920x1080
- **Ratio:** 16:9 (OBLIGATOIRE)
- **Durée:** 1-3 minutes
- **Poids:** <15 MB
- **FPS:** 30 fps
- **Audio:** OUI (important pour le contenu)

**Contenu:**
- Présentation du Demo Ride Tour
- Témoignages de participants
- Images des événements précédents
- Motos disponibles à l'essai
- Ambiance conviviale

**Compression:**
```bash
# Exemple avec ffmpeg
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 23 -vf scale=1920:1080 -c:a aac -b:a 192k drt-promo.mp4
```

---

## 🎬 Bonnes pratiques

### Optimisation Web
1. **Compression:** Utiliser H.264 avec CRF 23-28
2. **Streaming:** Activer le fast start pour lecture rapide
3. **Poster frame:** Fournir une image poster (voir `/images/`)
4. **Fallback:** Toujours prévoir une image de remplacement

### Accessibilité
- Ajouter des sous-titres si contenu parlé important
- Prévoir une transcription si nécessaire
- Contrôles visibles et accessibles

### Performance
- Lazy loading activé dans le code
- Vidéo hero: autoplay en muted
- Vidéo promo: lecture manuelle (controls)

### Formats alternatifs (optionnel)
Pour une compatibilité maximale, envisager:
- WebM (VP9) en complément
- Différentes résolutions (360p, 720p, 1080p)

## 📁 Structure finale

```
public/videos/
├── hero-video.mp4       ❌ À ajouter
├── drt-promo.mp4        ❌ À ajouter
└── README.md            ✅ Ce fichier
```

## 🔗 Outils recommandés

- **Compression:** HandBrake, FFmpeg
- **Édition:** Adobe Premiere, DaVinci Resolve
- **Validation:** MediaInfo (vérifier codec et specs)
- **Hébergement alternatif:** Envisager YouTube/Vimeo pour bande passante

## ⚠️ Important

- Les fichiers vidéo sont volumineux: ne pas les commit dans Git
- Utiliser Git LFS ou hébergement externe (CDN)
- Tester le chargement sur connexions 4G
- Vérifier l'affichage responsive

---

**Status:** ❌ Aucune vidéo ajoutée pour le moment
**Action requise:** Demander les vidéos au service marketing Yamaha France
