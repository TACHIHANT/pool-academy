const produits = [
  {
    id: 1,
    titre: 'Guide Complet du Traitement de l\'Eau de Piscine',
    slug: 'guide-traitement-piscine',
    description: 'Maîtrisez le traitement de l\'eau de votre piscine avec ce guide PDF complet : équilibre du pH, dosage du chlore et du brome, utilisation du stabilisant, floculants, traitement choc, et calendrier d\'entretien hebdomadaire détaillé pour une eau cristalline toute l\'année.',
    prix: 14.99,
    badge: 'Meilleure vente',
    couleur: '#0284c7',
    image: 'images/cover-traitement.svg',
    icone: 'fas fa-water',
    categorie: 'traitement',
    pages: 45,
    format: 'PDF',
    toc: [
      'Introduction à la chimie de l\'eau',
      'Comprendre et équilibrer le pH',
      'Le chlore : types, dosage et stabilisation',
      'Traitement aux bromes et alternatives',
      'Les correcteurs pH et alcalinité',
      'Le stabilisant (acide cyanurique)',
      'Les floculants et clarifiants',
      'Traitement choc vs traitement lent',
      'Calendrier d\'entretien hebdomadaire',
      'Guide de dépannage rapide',
    ]
  },
  {
    id: 2,
    titre: 'Solutions aux Problèmes Courants de Piscine',
    slug: 'solutions-problemes-piscine',
    description: 'Diagnostiquez et résolvez tous les problèmes de votre piscine avec ce guide PDF : eau verte, algues persistantes, eau trouble ou laiteuse, mauvaises odeurs, dépôts calcaires, pannes de filtration et de pompe — solutions étape par étape et guide préventif inclus.',
    prix: 12.99,
    badge: 'Nouveau',
    couleur: '#059669',
    image: 'images/cover-solutions.svg',
    icone: 'fas fa-circle-check',
    categorie: 'problemes',
    pages: 38,
    format: 'PDF',
    toc: [
      'Pourquoi l\'eau devient verte ?',
      'Traitement des algues : vertes, jaunes, noires',
      'Eau trouble ou laiteuse : causes et solutions',
      'Mauvaises odeurs et irritations',
      'Dépôt de calcaire et tartre',
      'Problèmes de filtration',
      'Pompe qui ne fonctionne pas',
      'Système de chauffage en panne',
      'Piscine qui fuit : diagnostic',
      'Guide préventif pour éviter les problèmes'
    ]
  },
  {
    id: 3,
    titre: 'Entretien Saisonnier de la Piscine',
    slug: 'entretien-saisonnier-piscine',
    description: 'Guide PDF complet pour l\'entretien saisonnier de votre piscine : hivernage actif et passif, protection contre le gel, remise en route printanière pas à pas, traitement de l\'eau après hivernage, gestion des fortes chaleurs, et calendrier annuel d\'entretien avec checklist mensuelle.',
    prix: 11.99,
    badge: 'Populaire',
    couleur: '#7c3aed',
    image: 'images/cover-saisonnier.svg',
    icone: 'fas fa-calendar-alt',
    categorie: 'saisonnier',
    pages: 35,
    format: 'PDF',
    toc: [
      'Préparer sa piscine pour l\'hiver',
      'Hivernage actif vs passif',
      'Protection des équipements contre le gel',
      'Remise en route au printemps : étapes clés',
      'Traitement de l\'eau après hivernage',
      'Entretien d\'été : fréquence et astuces',
      'Gestion des fortes chaleurs',
      'Préparation pour l\'automne',
      'Calendrier annuel d\'entretien',
      'Liste de vérification mensuelle'
    ]
  },
  {
    id: 4,
    titre: 'Guide des Équipements de Piscine',
    slug: 'guide-equipements-piscine',
    description: 'Guide PDF expert pour choisir, installer et entretenir les équipements de votre piscine : filtration (sable, cartouche, diatomées), pompe, chauffage (pompe à chaleur, solaire, gaz), robots automatiques, électrolyse au sel, éclairage LED, couvertures et volets automatiques — avec budget et guide d\'achat détaillé.',
    prix: 13.99,
    badge: null,
    couleur: '#d97706',
    image: 'images/cover-equipements.svg',
    icone: 'fas fa-cogs',
    categorie: 'equipement',
    pages: 40,
    format: 'PDF',
    toc: [
      'Comprendre le circuit de filtration',
      'Choisir la bonne pompe',
      'Filtre à sable, cartouche ou diatomées ?',
      'Le chauffage : pompe à chaleur, solaire, gaz',
      'Robots de piscine : automatiques vs manuels',
      'Système de désinfection : électrolyse au sel',
      'Éclairage de piscine : LED, halogène, fibre',
      'Couvertures et volets automatiques',
      'Maintenance et remplacement des équipements',
      'Budget et guide d\'achat'
    ]
  }
];

const categories = [
  { id: 'tous', label: 'Tous' },
  { id: 'traitement', label: 'Traitement' },
  { id: 'problemes', label: 'Problèmes' },
  { id: 'saisonnier', label: 'Saisonnier' },
  { id: 'equipement', label: 'Équipement' },
];

function getProductById(id) {
  return produits.find(p => p.id === parseInt(id));
}

function getProductBySlug(slug) {
  return produits.find(p => p.slug === slug);
}
