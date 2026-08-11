export type HomeFeature = {
  value: string
  label: string
}

export type HomeCollection = {
  name: string
  text: string
  image_url: string
}

export type HomeRitual = {
  title: string
}

export type HomeLuxuryPick = {
  title: string
  label: string
  price: string
  image_url: string
}

export type HomeService = {
  title: string
  text: string
}

export type HomeContent = {
  hero: {
    eyebrow: string
    title: string
    text: string
    primary_label: string
    secondary_label: string
    image_url: string
    badge_title: string
    badge_text: string
  }
  features: HomeFeature[]
  collections: HomeCollection[]
  editorial: {
    eyebrow: string
    title: string
    image_url: string
    label: string
    heading: string
    text: string
    button_label: string
  }
  featured: {
    eyebrow: string
    title: string
  }
  fallback_picks: HomeLuxuryPick[]
  ritual: {
    eyebrow: string
    title: string
    items: HomeRitual[]
  }
  service: {
    eyebrow: string
    title: string
    items: HomeService[]
  }
  final_cta: {
    eyebrow: string
    title: string
    button_label: string
  }
  visibility: {
    stats: boolean
    collections: boolean
    editorial: boolean
    featured: boolean
    ritual: boolean
    service: boolean
    final_cta: boolean
  }
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  hero: {
    eyebrow: 'Nouvelle selection 2026',
    title: 'Cosmetiques premium pour une routine beaute elegante.',
    text: 'Decouvrez des soins, parfums et essentiels beaute choisis pour leur efficacite, leur texture et leur finition luxueuse.',
    primary_label: 'Explorer la boutique',
    secondary_label: 'Voir les nouveautes',
    image_url: '',
    badge_title: 'Routine complete',
    badge_text: 'Soins, parfums et accessoires',
  },
  features: [
    { value: '48h', label: 'Livraison urbaine' },
    { value: '+80', label: 'References beaute' },
    { value: '4.9', label: 'Note moyenne' },
  ],
  collections: [
    {
      name: 'Soins visage',
      text: 'Textures fines, actifs precis et resultats visibles au quotidien.',
      image_url: '',
    },
    {
      name: 'Parfums signature',
      text: 'Sillages elegants pour les moments qui meritent une empreinte.',
      image_url: '',
    },
    {
      name: 'Glow routine',
      text: 'Essentiels eclat pour une peau lumineuse sans surcharge.',
      image_url: '',
    },
    {
      name: 'Coffrets premium',
      text: 'Idees cadeaux et routines completes pretes a offrir.',
      image_url: '',
    },
  ],
  editorial: {
    eyebrow: 'Maison beaute',
    title: 'Une selection inspiree des comptoirs premium.',
    image_url: '',
    label: 'Selection experte',
    heading: 'Des essentiels choisis pour la sensation, la tenue et le fini.',
    text: 'Chaque produit est pense pour trouver sa place dans une routine simple: soin net, parfum juste, geste efficace et presentation soignee.',
    button_label: 'Decouvrir les essentiels',
  },
  featured: {
    eyebrow: 'Selections',
    title: 'Les pieces fortes du moment.',
  },
  fallback_picks: [
    {
      title: 'Edition peau parfaite',
      label: 'Routine complete',
      price: 'A partir de 18 000 FCFA',
      image_url: '',
    },
    {
      title: 'Parfum de soiree',
      label: 'Signature intense',
      price: 'A partir de 25 000 FCFA',
      image_url: '',
    },
    {
      title: 'Coffret eclat',
      label: 'Selection cadeau',
      price: 'A partir de 32 000 FCFA',
      image_url: '',
    },
  ],
  ritual: {
    eyebrow: 'Rituel',
    title: 'Composer une routine elegante en quatre gestes.',
    items: [
      { title: 'Nettoyer avec douceur' },
      { title: 'Hydrater en profondeur' },
      { title: 'Illuminer le teint' },
      { title: 'Signer avec un parfum' },
    ],
  },
  service: {
    eyebrow: 'Service premium',
    title: 'Une experience soignee, du panier a la reception.',
    items: [
      { title: 'Commande accompagnee', text: 'Confirmation et prise en charge rapide par WhatsApp.' },
      { title: 'Preparation attentive', text: 'Commande verifiee avant expedition.' },
      { title: 'Suivi client', text: 'Historique et statut accessibles depuis votre compte.' },
    ],
  },
  final_cta: {
    eyebrow: 'Boutique',
    title: 'Trouvez la routine qui signe votre style.',
    button_label: 'Entrer dans le catalogue',
  },
  visibility: {
    stats: true,
    collections: true,
    editorial: true,
    featured: true,
    ritual: true,
    service: true,
    final_cta: true,
  },
}
