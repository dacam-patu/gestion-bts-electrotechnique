import React from 'react';
import { useLocation } from 'react-router-dom';

const ReferentielDescriptionActivites = () => {
  // Données référentiel (pôles → activités → tâches)
  const poles = [
    { id: 'P1', name: 'Pôle « Conception - étude préliminaire »' },
    { id: 'P2', name: 'Pôle « Conception - étude détaillée du projet »' },
    { id: 'P3', name: 'Pôle « Analyse, diagnostic, maintenance »' },
    { id: 'P4', name: 'Pôle « Conduite de projet/chantier »' },
    { id: 'P5', name: 'Pôle « Réalisation, mise en service d’un projet »' }
  ];

  const activities = [
    { id: 'A1', poleId: 'P1', name: 'Activité 1 : conception - étude préliminaire' },
    { id: 'A2', poleId: 'P2', name: 'Activité 2 : conception - étude détaillée du projet' },
    { id: 'A3', poleId: 'P3', name: 'Activité 3 : analyse – diagnostic' },
    { id: 'A4', poleId: 'P3', name: 'Activité 4 : maintenance d’une installation électrique' },
    { id: 'A5', poleId: 'P4', name: 'Activité 5 : conduite de projet/chantier' },
    { id: 'A6', poleId: 'P5', name: 'Activité 6 : réalisation : installation – intégration' },
    { id: 'A7', poleId: 'P5', name: 'Activité 7 : mise en service' },
    { id: 'A8', poleId: 'P5', name: 'Activité 8 : communication' }
  ];

  const tasksByActivity = {
    A1: [
      { code: 'T 1.1', label: 'analyser et/ou élaborer les documents relatifs aux besoins du client/utilisateur' },
      { code: 'T 1.2', label: 'élaborer un avant-projet/chantier (ou avant-projet sommaire)' },
      { code: 'T 1.3', label: 'dimensionner les constituants de l’installation' },
      { code: 'T 1.4', label: 'définir les coûts pour préparer une offre commerciale' }
    ],
    A2: [
      { code: 'T 2.1', label: 'choisir les matériels' },
      { code: 'T 2.2', label: 'réaliser les documents techniques du projet/chantier' }
    ],
    A3: [
      { code: 'T 3.1', label: 'proposer un protocole pour analyser le fonctionnement et/ou le comportement de l’installation' },
      { code: 'T 3.2', label: 'mesurer et contrôler l’installation, exploiter les mesures pour faire le diagnostic' },
      { code: 'T 3.3', label: 'formuler des préconisations' }
    ],
    A4: [
      { code: 'T 4.1', label: 'organiser la maintenance' },
      { code: 'T 4.2', label: 'réaliser la maintenance préventive ou prévisionnelle' },
      { code: 'T 4.3', label: 'réaliser la maintenance corrective' }
    ],
    A5: [
      { code: 'T 5.1', label: 's’approprier et vérifier les informations relatives au projet/chantier' },
      { code: 'T 5.2', label: 'planifier les étapes du projet/chantier' },
      { code: 'T 5.3', label: 'assurer le suivi de la réalisation du projet/chantier (coûts, délais, qualité)' },
      { code: 'T 5.4', label: 'faire appliquer les règles liées à la santé, la sécurité et l’environnement' },
      { code: 'T 5.5', label: 'gérer et animer l’équipe projet/chantier' }
    ],
    A6: [
      { code: 'T 6.1', label: 'organiser l’espace de travail' },
      { code: 'T 6.2', label: 'implanter, poser, installer, câbler, raccorder les matériels électriques' },
      { code: 'T 6.3', label: 'programmer les applications métiers' }
    ],
    A7: [
      { code: 'T 7.1', label: 'réaliser les contrôles, les configurations, les essais fonctionnels' },
      { code: 'T 7.2', label: 'vérifier le fonctionnement de l’installation' },
      { code: 'T 7.3', label: 'réceptionner l’installation avec le client/utilisateur' }
    ],
    A8: [
      { code: 'T 8.1', label: 'constituer et mettre à jour les dossiers du projet/chantier' },
      { code: 'T 8.2', label: 'échanger, y compris en langue anglaise, avec les parties prenantes du projet/chantier' },
      { code: 'T 8.3', label: 'expliquer, y compris en langue anglaise, le fonctionnement de l’installation et former le client/utilisateur à son utilisation' },
      { code: 'T 8.4', label: 'préparer et animer des réunions' },
      { code: 'T 8.5', label: 'présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur' }
    ]
  };

  const [selectedPoleId, setSelectedPoleId] = React.useState(poles[0].id);
  const [openedTask, setOpenedTask] = React.useState(null);
  const [autoSelections, setAutoSelections] = React.useState({ autonomie: new Set(), responsabilites: new Set() });
  const location = useLocation();

  const getDefaultSelections = (taskCode) => {
    const d = taskDetails[taskCode];
    const auto = new Set();
    const resp = new Set();
    if (d?.autonomie) auto.add(d.autonomie);
    (d?.responsabilites || []).forEach(r => resp.add(r));
    return { autonomie: auto, responsabilites: resp };
  };

  // Synchroniser systématiquement les coches par défaut à l'ouverture d'une tâche
  React.useEffect(() => {
    if (openedTask?.code) {
      setAutoSelections(getDefaultSelections(openedTask.code));
    }
  }, [openedTask]);

  // Ouvre automatiquement la modale si un paramètre de requête ?task=Tx.x est présent
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskCode = params.get('task');
    if (!taskCode) return;

    // Trouver l'activité et le pôle correspondant à la tâche
    let foundActivity = null;
    let foundPole = null;
    let foundLabel = '';
    for (const act of activities) {
      const list = tasksByActivity[act.id] || [];
      const match = list.find(t => t.code === taskCode);
      if (match) {
        foundActivity = act;
        foundLabel = match.label;
        foundPole = poles.find(p => p.id === act.poleId) || null;
        break;
      }
    }
    if (foundActivity && foundPole) {
      // Sélectionner le bon pôle pour cohérence de l’affichage
      setSelectedPoleId(foundActivity.poleId);
      // Ouvrir la modale avec les informations complètes
      setOpenedTask({ code: taskCode, label: foundLabel, activity: foundActivity, pole: foundPole });
      // Préparer les sélections par défaut
      setAutoSelections(getDefaultSelections(taskCode));
    }
  }, [location.search]);

  // Détails (extrait – complétables ensuite pour toutes les tâches)
  export const taskDetails = {
    'T 1.1': {
      description: [
        'recenser tous les documents qui expriment les besoins du client/utilisateur',
        'comprendre les besoins et les attentes du client/utilisateur',
        'vérifier la conformité des documents au regard des besoins du client/utilisateur, des réglementations et normes',
        'proposer des modifications le cas échéant',
        'identifier et reformuler les besoins et les attentes du client/utilisateur',
        'traduire les besoins du client/utilisateur par l’élaboration des documents',
        'faire valider ces documents par le client/utilisateur'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Partielle',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les besoins et attentes du client/utilisateur sont identifiés et recensés',
        'Les besoins client/utilisateur sont reformulés au regard des contraintes, des réglementations et des normes',
        'Tous les documents qui expriment les besoins du client/utilisateur sont recensés',
        'Les besoins client/utilisateur sont traduits par l’élaboration de documents en tenant compte des réglementations et des normes',
        'Les modifications nécessaires sont adaptées',
        'Les documents sont validés par le client/utilisateur'
      ]
    },
    'T 1.2': {
      description: [
        'Analyser les besoins du client/utilisateur et le contexte général du projet/chantier',
        'Proposer des solutions techniques respectant les spécifications, contraintes normatives et réglementaires',
        'Modéliser les solutions techniques retenues à partir des logiciels métiers'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques au métier',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Partielle',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les informations à acquérir, leur nature, leur flux, leur traitement sont déterminés',
        'Le flux d’énergie et les transformations sont déterminés',
        'Les solutions techniques retenues sont modélisées',
        'Les solutions techniques proposées respectent les spécifications et les contraintes',
        'L’avant-projet est formalisé'
      ]
    },
    'T 1.3': {
      description: [
        'Établir le bilan de puissance',
        'Identifier les caractéristiques et les quantités d’informations à échanger',
        'Développer les solutions techniques de l’avant-projet/chantier',
        'Dimensionner les matériels dans le respect des contraintes normatives et réglementaires'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Le bilan des puissances est établi',
        'Les informations à échanger sont quantifiées et caractérisées',
        'Les solutions techniques de l’avant-projet/chantier sont développées',
        'Les matériels de l’installation sont dimensionnés conformément aux normes'
      ]
    },
    'T 1.4': {
      description: [
        'Consulter les fournisseurs pour chiffrer les besoins à partir de la nomenclature',
        'Chiffrer les besoins externes (levage, génie civil, etc. et contrôles associés)',
        'Chiffrer les moyens de réalisation (ressources humaines et autres)',
        'Chiffrer le temps de réalisation et d’étude',
        'Établir les coûts en vue de préparer une offre commerciale'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les fournisseurs sont consultés',
        'Les besoins externes sont chiffrés',
        'Les moyens de réalisation sont chiffrés',
        'Les temps de réalisation et d’étude sont chiffrés',
        'Les coûts sont établis'
      ]
    },
    'T 2.1': {
      description: [
        'Analyser le contexte, le cahier des charges',
        'Extraire les informations nécessaires aux choix',
        'Simuler le fonctionnement d’une installation/équipement pour valider le choix des constituants',
        'Établir la liste des matériels avec les outils numériques adaptés',
        'Compléter la nomenclature'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les informations nécessaires sont caractérisées',
        'Le fonctionnement de l’installation est simulé et validé',
        'La nomenclature des matériels est établie'
      ]
    },
    'T 2.2': {
      description: [
        'Réaliser les plans, schémas, nomenclatures, notes de calculs, manuels, mémoires techniques, etc. avec les outils numériques adaptés',
        'Adapter les documents existants dans le cadre d’une modification, d’une extension'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Tous les documents nécessaires sont réalisés',
        'Les documents initiaux existants sont adaptés'
      ]
    },
    'T 3.1': {
      description: [
        'Analyser la demande client/utilisateur (diagnostic énergétique, de fonctionnement, de qualité, de sécurité, etc.)',
        'Analyser les contraintes, les ressources normatives et réglementaires dont celles liées à la qualité, la santé et l’environnement',
        'Extraire, à partir des documents (plans, schémas, bilans précédents, autres), les informations nécessaires à l’analyse et aux mesures',
        'Élaborer le processus de mesures et contrôles (types de mesures, protocole) afin d’effectuer le diagnostic',
        'Prévoir les résultats attendus'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'La demande client/utilisateur est analysée',
        'Les contraintes et ressources normatives et réglementaires sont analysées',
        'Les informations nécessaires à l’analyse et aux mesures sont extraites des documents',
        'Le processus de mesures et contrôles pour effectuer le diagnostic est élaboré',
        'Les résultats attendus sont prévus'
      ]
    },
    'T 3.2': {
      description: [
        'Appliquer le processus défini',
        'Comprendre l’installation et l’environnement de travail et déterminer le niveau d’habilitation nécessaire avant intervention',
        'Mettre en œuvre les actions de prévention et de sécurité',
        'Mettre en place les appareils de mesures, effectuer les mesures et les enregistrer',
        'Exploiter les informations venant des objets connectés, comparer les valeurs mesurées aux attendus, proposer le diagnostic'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Le processus défini est appliqué',
        'Les conditions d’intervention et d’habilitation sont prises en compte',
        'Les actions de prévention et de sécurité sont mises en œuvre',
        'Les mesures sont collectées et enregistrées',
        'Les informations IoT sont exploitées, les écarts analysés et le diagnostic est proposé'
      ]
    },
    'T 3.3': {
      description: [
        'Proposer, à partir du diagnostic, des modifications techniques, économiques et environnementales de l’installation',
        'Proposer des recommandations pour améliorer l’installation et optimiser ses performances énergétiques',
        'Évaluer et argumenter la plus-value des modifications/améliorations'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (logiciels de schémas, de calculs, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Des modifications de l’installation sont proposées',
        'Des réglages de matériel électrique sont proposés',
        'La plus-value attendue (technique, économique, environnementale) est précisée',
        'Des recommandations sont proposées et argumentées'
      ]
    },
    'T 4.1': {
      description: [
        'Définir la stratégie de maintenance du point de vue électrique',
        'Élaborer le plan de maintenance préventive et l’intégrer dans la GMAO',
        'Recueillir les informations liées aux prescriptions techniques/réglementaires',
        'Analyser l’environnement de travail et ses contraintes',
        'Définir les opérations de maintenance systématique, conditionnelle, prévisionnelle et réglementaire',
        'Planifier les interventions de maintenance',
        'Prévoir les habilitations et certifications nécessaires',
        'Rédiger et tenir à jour les documents de maintenance',
        'Établir une procédure de maintenance corrective et l’intégrer dans la GMAO',
        'Préparer une intervention de dépannage'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (GMAO, etc.)',
        'Compétences internes et externes (organismes de contrôles, services maintenance, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens'],
      resultats: [
        'Les informations réglementaires sont recueillies',
        'L’environnement de travail et ses contraintes sont analysés',
        'Les opérations de maintenance (systématique, conditionnelle, prévisionnelle, réglementaire) sont définies et planifiées',
        'Les habilitations et certifications nécessaires sont prévues',
        'La procédure de maintenance corrective est définie et documentée'
      ]
    },
    'T 4.2': {
      description: [
        'Prendre en compte l’environnement de travail et les conditions de la maintenance',
        'Identifier les risques professionnels',
        'Mettre en œuvre les actions de prévention, vérifier habilitations et certifications',
        'Réaliser les opérations de maintenance préventive ou prévisionnelle',
        'Effectuer les contrôles et essais associés (locaux ou à distance)',
        'Proposer, si nécessaire, une amélioration'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (GMAO, etc.)',
        'Compétences internes et externes (organismes de contrôles, services maintenance, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens'],
      resultats: [
        'Les risques professionnels sont identifiés',
        'Les actions de prévention sont mises en œuvre',
        'Les opérations de maintenance préventive/prévisionnelle sont réalisées',
        'Les contrôles et essais associés sont effectués',
        'Les améliorations nécessaires sont proposées'
      ]
    },
    'T 4.3': {
      description: [
        'Prendre en compte l’environnement de travail et les conditions de la maintenance',
        'Identifier les risques professionnels',
        'Mettre en œuvre les actions de prévention, vérifier habilitations et certifications',
        'S’approprier l’installation et diagnostiquer le dysfonctionnement',
        'Préparer/provisionner les matériels, équipements et outillages',
        'Réaliser les opérations de dépannage, contrôler et tester',
        'Proposer, si nécessaire, une amélioration'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier (GMAO, etc.)',
        'Compétences internes et externes (organismes de contrôles, services maintenance, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les conditions de maintenance sont prises en compte',
        'Les risques sont identifiés, la prévention est mise en œuvre',
        'L’installation est analysée et le dysfonctionnement diagnostiqué',
        'Les matériels/équipements/outillages nécessaires sont approvisionnés',
        'Les opérations de dépannage sont réalisées et contrôlées',
        'Les fiches de contrôles sont complétées',
        'Les améliorations nécessaires sont proposées'
      ]
    },
    'T 5.1': {
      description: [
        'Collecter les informations écrites et orales relatives au projet/chantier',
        'Définir le périmètre du projet/chantier',
        'Rappeler les objectifs du projet/chantier et les valider avec le client/utilisateur',
        'S’assurer que la mise en œuvre des solutions techniques/équipements retenus est réalisable',
        'Vérifier la liste des matériels, équipements, outillages et outils numériques nécessaires'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 3 (santé et sécurité au travail ; environnement)'],
      autonomie: 'Partielle',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les informations écrites et orales du projet/chantier sont collectées',
        'Le périmètre du projet/chantier est défini',
        'Les objectifs sont rappelés et validés avec le client/utilisateur',
        'La faisabilité de la mise en œuvre est vérifiée',
        'La liste des matériels/équipements/outillages/outils numériques est vérifiée'
      ]
    },
    'T 5.2': {
      description: [
        'Établir le planning ou le rétroplanning des interventions/travaux',
        'Évaluer la durée du projet/chantier',
        'Planifier les approvisionnements',
        'Organiser le projet/chantier de manière éco-responsable',
        'Répartir les tâches en fonction des compétences/habilitations/certifications',
        'Tenir compte du planning de tous les intervenants (collaborateurs, équipe, corps d’état, sous-traitants, etc.)'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques (planification, gestion de stock, etc.)',
        'Compétences internes et externes (bureau d’études, fournisseurs/distributeurs, sous-traitants)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'L’intervention est planifiée, la durée est évaluée',
        'Les approvisionnements sont planifiés',
        'Le projet/chantier est organisé de manière éco-responsable',
        'Les tâches sont réparties selon habilitations/certifications et contraintes de planning',
        'Tous les documents nécessaires sont réalisés'
      ]
    },
    'T 5.3': {
      description: [
        'Piloter les étapes du planning et les adapter aux circonstances',
        'Suivre les approvisionnements',
        'Contrôler la qualité des travaux réalisés',
        'Vérifier les fiches d’autocontrôles et la conformité des prestations de la sous-traitance',
        'Participer aux réunions de chantier et de suivi',
        'Proposer des solutions pour répondre aux aléas',
        'Renseigner les indicateurs (coûts, délais, qualité)'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques (planification, gestion de stock, etc.)',
        'Compétences internes et externes (bureau d’études, de contrôle, fournisseurs/distributeurs)'
      ],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les étapes du planning sont respectées et adaptées si nécessaire',
        'Les approvisionnements sont suivis',
        'La qualité des travaux est contrôlée et les autocontrôles vérifiés',
        'La conformité de la sous-traitance est vérifiée',
        'Les aléas sont présentés et des solutions sont proposées',
        'Les indicateurs de suivi sont renseignés'
      ]
    },
    'T 5.4': {
      description: [
        'Analyser l’environnement de travail et les conditions d’intervention',
        'Prévoir les mesures de prévention en santé, sécurité et environnement',
        'Contrôler la présence et l’utilisation des dispositifs de protection des personnes et des biens',
        'Informer les intervenants des règles liées à la santé, la sécurité et l’environnement',
        'Contrôler le respect de ces règles tout au long du projet/chantier'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Équipements de Protection Collectifs et Individuels'],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'L’environnement de travail et les conditions d’intervention sont définis',
        'Les mesures de prévention sont prévues et mises en œuvre',
        'La présence et l’utilisation des dispositifs de protection sont contrôlées',
        'Les intervenants sont informés des règles SSE',
        'Toutes les règles SSE sont respectées tout au long du projet/chantier'
      ]
    },
    'T 5.5': {
      description: [
        'Coordonner les tâches de l’équipe projet/chantier avec celles des autres intervenants',
        'Échanger régulièrement avec l’équipe pour le suivi du projet/chantier',
        'Accompagner l’équipe selon les besoins techniques',
        'Arbitrer et décider en fonction des contraintes',
        'Gérer et résoudre les situations imprévues/délicates/conflictuelles'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)'],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les tâches de l’équipe sont coordonnées',
        'L’équipe est animée via revues, points d’étape',
        'Des échanges réguliers répondent aux besoins techniques',
        'Les arbitrages nécessaires sont pris',
        'Les situations imprévues/délicates/conflictuelles sont résolues'
      ]
    },
    'T 6.1': {
      description: [
        'Prendre en compte l’environnement de travail et les conditions de réalisation',
        'Identifier les risques professionnels',
        'Proposer et mettre en œuvre les actions de prévention',
        'Vérifier les approvisionnements en matériel, équipements et outillages'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Matériels, équipements et outillages'],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les conditions d’intervention sont prises en compte',
        'Les risques sont identifiés',
        'Les actions de prévention sont mises en œuvre',
        'L’espace de travail est approvisionné'
      ]
    },
    'T 6.2': {
      description: [
        'Réaliser un ouvrage/équipement/installation électrique complexe',
        'Repérer les contraintes de réalisation, de câblage, de raccordement',
        'Implanter, poser-installer les matériels électriques',
        'Adapter l’implantation et la pose, façonner les canalisations et supports',
        'Câbler et raccorder les matériels électriques, adapter si nécessaire le câblage et le raccordement',
        'Effectuer les contrôles associés'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Matériels, équipements et outillages'],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les contraintes de réalisation sont repérées',
        'Les matériels sont posés et implantés selon les prescriptions et règles de l’art',
        'Les adaptations nécessaires sont réalisées',
        'Les canalisations et supports sont façonnés selon les règles de l’art',
        'Les matériels sont raccordés et les contrôles associés effectués',
        'Les fiches d’autocontrôles sont complétées'
      ]
    },
    'T 6.3': {
      description: [
        'Télécharger les programmes dans les équipements (API, variateur, GTB/GTC, IoT, etc.)',
        'Écrire une partie de programme à partir d’une application métier',
        'Modifier un programme existant',
        'Utiliser des outils/plateformes numériques métier pour traduire un cahier des charges'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Applications métiers', 'Compétences internes et externes'],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les programmes sont téléchargés',
        'Un programme est complété/écrit avec une application métier',
        'Le programme existant est modifié',
        'Les outils/plateformes numériques pour traduire un cahier des charges sont utilisés'
      ]
    },
    'T 7.1': {
      description: [
        'Prendre en compte l’environnement de travail et les conditions de la mise en service',
        'Identifier les risques professionnels',
        'Mettre en œuvre les actions de prévention',
        'Réaliser les contrôles normatifs/réglementaires/spécifiques',
        'Effectuer les réglages et paramétrages des matériels, configurer et vérifier leur interconnexion',
        'Tester les réseaux (infrastructure numérique du bâtiment, réseaux industriels, etc.)'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Applications métiers', 'Compétences internes et externes'],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les conditions de la mise en service sont prises en compte',
        'Les risques sont identifiés et la prévention est mise en œuvre',
        'Les contrôles normatifs/réglementaires/spécifiques sont réalisés',
        'Les réglages/paramétrages sont effectués, l’interconnexion est testée',
        'Le fonctionnement des matériels est vérifié',
        'Les tests des réseaux sont réalisés',
        'Les fiches de contrôles sont complétées'
      ]
    },
    'T 7.2': {
      description: [
        'Valider les programmes et l’interopérabilité des matériels',
        'Réaliser les essais et mesures complémentaires',
        'Ajuster, si nécessaire, réglages et paramétrages',
        'Analyser les résultats et valider les performances de l’installation selon les prescriptions'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Applications métiers', 'Compétences internes et externes'],
      autonomie: 'Totale',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les programmes et l’interopérabilité sont validés',
        'Les essais/mesures complémentaires sont réalisés',
        'Les réglages/paramétrages complémentaires sont effectués',
        'Les fiches de contrôles sont complétées',
        'Les performances de l’installation sont validées avant réception'
      ]
    },
    'T 7.3': {
      description: [
        'Valider les performances de l’installation avec le client/utilisateur conformément aux prescriptions',
        'Remettre au client/utilisateur les documents et données contractuels de l’installation',
        'Faire réaliser les opérations nécessaires à la levée de réserves éventuelles'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)'],
      autonomie: 'Totale',
      responsabilites: ['Des moyens', 'Du résultat'],
      resultats: [
        'Les performances de l’installation sont validées avec le client/utilisateur',
        'Les documents/données contractuels sont remis',
        'Les opérations nécessaires à la levée de réserves sont réalisées'
      ]
    },
    'T 8.1': {
      description: [
        'Rassembler les documents, données et informations liés au projet/chantier',
        'Structurer et actualiser les dossiers 1, 2, 3',
        'Réaliser la gestion documentaire du projet/chantier dans l’entreprise',
        'Diffuser les documents'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier et bureautiques',
        'Compétences internes et externes'
      ],
      autonomie: 'Partielle',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les documents/données/informations sont rassemblés',
        'Les documents sont structurés et les dossiers 1, 2, 3 actualisés',
        'L’archivage des documents est assuré',
        'La diffusion des documents est assurée'
      ]
    },
    'T 8.2': {
      description: [
        'Sélectionner les informations nécessaires et construire un argumentaire adapté à l’interlocuteur',
        'Interpréter et reformuler la demande client/utilisateur',
        'Partager les informations liées au projet/chantier avec les parties prenantes internes et externes',
        'Recueillir les besoins, interrogations et la satisfaction des parties prenantes'
      ],
      ressources: [
        'Dossier 1 (technique)',
        'Dossier 2 (supports d’enregistrement et de communication)',
        'Dossier 3 (santé et sécurité au travail ; environnement)',
        'Outils numériques spécifiques du métier et bureautiques'
      ],
      autonomie: 'Partielle',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'Les informations de communication sont sélectionnées',
        'L’argumentaire est construit et la demande client/utilisateur est reformulée',
        'Les informations sont partagées avec les parties prenantes',
        'Les besoins/interrogations/satisfaction sont recueillis',
        'La communication orale et écrite est maîtrisée, y compris en langue anglaise'
      ]
    },
    'T 8.3': {
      description: [
        'Expliquer au client/utilisateur le fonctionnement, le bon usage, les règles de sécurité et les contraintes techniques',
        'Former le client/utilisateur à la maîtrise de l’installation (utilisation, paramétrage, maintenance, etc.)',
        'Recueillir la satisfaction du client/utilisateur'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Dossier 3 (santé et sécurité au travail ; environnement)', 'Outils numériques du projet/chantier'],
      autonomie: 'Partielle',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'L’installation finale est présentée au client/utilisateur',
        'Le respect du cahier des charges est démontré',
        'Le fonctionnement, le bon usage et les règles de sécurité sont expliqués',
        'Le transfert de compétences permet la maîtrise par le client/utilisateur',
        'La satisfaction est recueillie'
      ]
    },
    'T 8.4': {
      description: [
        'Préparer et animer des réunions de projet/chantier',
        'Définir l’ordre du jour, inviter les participants, préparer les supports',
        'Animer les échanges et clarifier les décisions',
        'Rédiger et diffuser le compte rendu, suivre les actions'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Outils numériques de communication/collaboration'],
      autonomie: 'Partielle',
      responsabilites: ['Des personnes', 'Du résultat'],
      resultats: [
        'La réunion est préparée et animée',
        'Les décisions et actions sont tracées et diffusées',
        'Le suivi des actions est assuré'
      ]
    },
    'T 8.5': {
      description: [
        'Présenter et argumenter une offre à un client/utilisateur, y compris en langue anglaise',
        'Mettre en avant les aspects techniques, économiques, énergétiques et environnementaux',
        'Répondre aux questions/objections et finaliser la proposition'
      ],
      ressources: ['Dossier 1 (technique)', 'Dossier 2 (supports d’enregistrement et de communication)', 'Outils bureautiques et de présentation'],
      autonomie: 'Partielle',
      responsabilites: ['Des personnes', 'Des moyens', 'Du résultat'],
      resultats: [
        'L’offre est présentée et argumentée',
        'Les questions/objections sont traitées',
        'La proposition est formalisée'
      ]
    }
  };

  const poleActivities = activities.filter(a => a.poleId === selectedPoleId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Colonne gauche : liste des pôles */}
        <aside className="lg:col-span-1">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-700">Pôles</h2>
            </div>
            <nav className="p-2 space-y-1">
              {poles.map((pole) => (
                <button
                  key={pole.id}
                  onClick={() => setSelectedPoleId(pole.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedPoleId === pole.id
                      ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pole.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Zone centrale : activités et tâches liées */}
        <section className="lg:col-span-3">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-4 sm:px-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Description des activités professionnelles
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {poles.find(p => p.id === selectedPoleId)?.name}
              </p>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              {poleActivities.map((activity) => (
                <div key={activity.id} className="border rounded-md overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <h3 className="text-sm font-medium text-gray-800">{activity.name}</h3>
                  </div>
                  <div className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto border-t border-gray-200">
                        <thead>
                          <tr>
                            <th className="border-b border-gray-200 bg-white px-4 py-2 text-left text-xs font-medium text-gray-600 w-24">
                              Code
                            </th>
                            <th className="border-b border-gray-200 bg-white px-4 py-2 text-left text-xs font-medium text-gray-600">
                              Tâche associée
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(tasksByActivity[activity.id] || []).map((t) => (
                            <tr
                              key={t.code}
                              className="odd:bg-white even:bg-gray-50 cursor-pointer hover:bg-blue-50"
                              onClick={() => {
                                setOpenedTask({ ...t, activity, pole: poles.find(p => p.id === selectedPoleId) });
                                setAutoSelections(getDefaultSelections(t.code));
                              }}
                            >
                              <td className="px-4 py-2 text-sm text-gray-700 border-t">{t.code}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 border-t">{t.label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
              {poleActivities.length === 0 && (
                <div className="text-sm text-gray-500">Aucune activité liée à ce pôle.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal fiche tâche */}
      {openedTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">
                  {openedTask.pole?.name} • {openedTask.activity?.name}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {openedTask.code} · {openedTask.label}
                </h3>
              </div>
              <button
                onClick={() => { setOpenedTask(null); setAutoSelections({ autonomie: new Set(), responsabilites: new Set() }); }}
                className="text-gray-500 hover:text-gray-700 rounded-md px-2 py-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {(() => {
              const details = taskDetails[openedTask.code] || null;
              // Calcule les coches à partir du référentiel (lecture seule)
              const selectedAuto = new Set();
              if (details?.autonomie) selectedAuto.add(details.autonomie);
              const selectedResp = new Set(details?.responsabilites || []);
              return (
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Description */}
                  <section>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Description</h4>
                    {details?.description ? (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                        {details.description.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Contenu à compléter.</p>
                    )}
                  </section>

                  {/* Moyens et ressources */}
                  <section>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Moyens et ressources</h4>
                    {details?.ressources ? (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                        {details.ressources.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Contenu à compléter.</p>
                    )}
                  </section>

                  {/* Autonomie et responsabilité */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Autonomie</div>
                      <div className="flex items-center space-x-4 text-sm">
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            disabled
                            checked={selectedAuto.has('Partielle')}
                            onChange={() => {}}
                          />
                          <span>Partielle</span>
                        </label>
                        <label className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            disabled
                            checked={selectedAuto.has('Totale')}
                            onChange={() => {}}
                          />
                          <span>Totale</span>
                        </label>
                      </div>
                      {/* Affichage résumé supprimé pour éviter doublons */}
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Responsabilité</div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {['Des personnes', 'Des moyens', 'Du résultat'].map((label) => (
                          <label key={label} className="inline-flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              disabled
                              checked={selectedResp.has(label)}
                              onChange={() => {}}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                      {/* Affichage résumé supprimé pour éviter doublons */}
                    </div>
                  </section>

                  {/* Résultats attendus */}
                  <section>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Résultats attendus</h4>
                    {details?.resultats ? (
                      <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                        {details.resultats.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Contenu à compléter.</p>
                    )}
                  </section>
                </div>
              );
            })()}

            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => { setOpenedTask(null); setAutoSelections({ autonomie: new Set(), responsabilites: new Set() }); }}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferentielDescriptionActivites;

