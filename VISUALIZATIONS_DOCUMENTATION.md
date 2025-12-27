# Outils Visuels Avancés - Documentation

## Vue d'ensemble

Ce document décrit les nouvelles fonctionnalités de visualisation ajoutées à l'application DataPredict pour améliorer l'analyse des modèles de machine learning.

## Nouvelles Fonctionnalités

### 1. **Matrice de Confusion Détaillée** (Classification)

#### Caractéristiques :
- **Affichage visuel amélioré** : Matrice 2x2 avec codes couleur
  - Vert : Vrais Positifs (TP) et Vrais Négatifs (TN)
  - Rouge : Faux Positifs (FP) et Faux Négatifs (FN)
- **Labels clairs** : TN, FP, FN, TP pour chaque cellule
- **Pourcentages** : Affichage du pourcentage de chaque catégorie
- **Hover effects** : Interaction visuelle au survol

#### Métriques par Classe :
Pour chaque classe, affichage de :
- **Précision** : TP / (TP + FP)
- **Rappel** : TP / (TP + FN)
- **F1-Score** : Moyenne harmonique de la précision et du rappel

### 2. **Visualisations de Régression**

#### a) Prédictions vs Valeurs Réelles
- **Scatter plot** : Points représentant les prédictions vs valeurs réelles
- **Ligne idéale** : Ligne rouge montrant où les prédictions devraient se situer
- **Métriques affichées** :
  - **R² Score** : Coefficient de détermination
  - **RMSE** : Root Mean Squared Error
  - **MAE** : Mean Absolute Error
  - **MSE** : Mean Squared Error

#### b) Analyse des Résidus
- **Graphique des résidus** : Scatter plot des résidus vs prédictions
- **Ligne zéro** : Référence pour identifier les biais
- **Distribution des résidus** : Histogramme montrant la distribution des erreurs
  - 20 bins pour une analyse détaillée
  - Aide à identifier si les erreurs suivent une distribution normale

### 3. **Support du Mode Sombre**

Toutes les visualisations s'adaptent automatiquement au thème :
- Couleurs de fond adaptatives
- Texte avec contraste optimal
- Grilles et axes avec couleurs appropriées
- Tooltips stylisés selon le thème

## Navigation

### Onglets Disponibles

1. **Matrice de confusion** (Classification uniquement)
   - Affichage de la matrice de confusion
   - Métriques par classe

2. **Prédictions vs Réel** (Régression uniquement)
   - Scatter plot avec ligne idéale
   - Métriques de régression

3. **Analyse des résidus** (Régression uniquement)
   - Graphique des résidus
   - Distribution des résidus

4. **Courbe ROC** (Classification binaire)
   - Courbe ROC si disponible
   - Comparaison avec ligne de référence

5. **Importance des features**
   - Graphique en barres horizontales
   - Classement par importance

6. **Apprentissage**
   - Courbes d'apprentissage
   - Train vs Validation loss

## Utilisation

### Accès aux Visualisations

1. Entraîner un modèle via la page **Training**
2. Aller à la page **Results**
3. Cliquer sur **Visualisation** pour accéder aux graphiques détaillés

### Interprétation

#### Pour la Classification :
- **Matrice de confusion** : 
  - Diagonale (TP et TN) : Prédictions correctes
  - Hors diagonale (FP et FN) : Erreurs de classification
- **Métriques par classe** :
  - Précision élevée : Peu de faux positifs
  - Rappel élevé : Peu de faux négatifs
  - F1-Score élevé : Bon équilibre global

#### Pour la Régression :
- **Scatter plot** :
  - Points proches de la ligne rouge : Bonnes prédictions
  - Points éloignés : Erreurs importantes
- **Résidus** :
  - Distribution centrée sur zéro : Bon modèle
  - Pattern visible : Biais ou non-linéarité
- **Distribution des résidus** :
  - Distribution normale : Modèle bien calibré
  - Asymétrie : Biais systématique

## Améliorations Techniques

### Fichiers Modifiés

1. **`Visualization.tsx`**
   - Ajout de calculs de métriques par classe
   - Implémentation des graphiques de résidus
   - Distribution des erreurs
   - Support complet du mode sombre

2. **`Training.tsx`**
   - Ajout du support du mode sombre pour les graphiques de comparaison

### Dépendances

Utilise la bibliothèque **Recharts** déjà présente :
- `ScatterChart` : Pour les graphiques de dispersion
- `BarChart` : Pour les histogrammes
- `LineChart` : Pour les courbes
- Support complet des thèmes personnalisés

## Prochaines Étapes

### Améliorations Futures Possibles :

1. **Export des visualisations** :
   - Export en PNG/SVG
   - Export des données en CSV

2. **Visualisations supplémentaires** :
   - Courbe de précision-rappel
   - Calibration plot
   - Partial dependence plots

3. **Interactivité** :
   - Zoom et pan sur les graphiques
   - Sélection de points pour analyse détaillée
   - Comparaison de plusieurs modèles

4. **Backend** :
   - Endpoint API pour récupérer les données de visualisation
   - Calcul des métriques côté serveur
   - Stockage des résultats pour historique

## Conclusion

Ces nouvelles visualisations offrent une analyse approfondie des performances des modèles, permettant aux utilisateurs de :
- Identifier rapidement les forces et faiblesses des modèles
- Comprendre les types d'erreurs commises
- Prendre des décisions éclairées sur l'amélioration des modèles
- Avoir une vue complète des performances en classification et régression
