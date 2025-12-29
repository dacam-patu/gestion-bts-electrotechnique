import React from 'react';

const ReferentielCompetences = () => {
  const competences = [
    { code: 'C1', label: 'recenser et prendre en compte les normes, les réglementations applicables au projet/chantier' },
    { code: 'C2', label: 'extraire les informations nécessaires à la réalisation des tâches' },
    { code: 'C3', label: 'gérer les risques et les aléas liés à la réalisation des tâches' },
    { code: 'C4', label: 'communiquer de manière adaptée à l\'oral, à l\'écrit, y compris en langue anglaise' },
    { code: 'C5', label: 'interpréter un besoin client/utilisateur, un CCTP, un cahier des charges' },
    { code: 'C6', label: 'modéliser le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C7', label: 'simuler le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C8', label: 'dimensionner les constituants d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C9', label: 'choisir les constituants d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C10', label: 'proposer l’architecture d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C11', label: 'réaliser les documents du projet/chantier (plans, schémas, maquette virtuelle, etc.)' },
    { code: 'C12', label: 'gérer et conduire (y compris avec les documents de : organisation, planification, suivi, pilotage, réception, etc.) le projet/chantier' },
    { code: 'C13', label: 'mesurer les grandeurs caractéristiques d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C14', label: 'réaliser un ouvrage, une installation, un équipement électrique' },
    { code: 'C15', label: 'configurer et programmer les matériels dans le cadre du projet/chantier' },
    { code: 'C16', label: 'appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique' },
    { code: 'C17', label: 'réaliser un diagnostic de performance y compris énergétique, de sécurité, d’un ouvrage, d’une installation, d’un équipement électrique' },
    { code: 'C18', label: 'réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique' }
  ];

  // Détails des compétences (première fiche: C1)
  const competenceDetails = {
    C1: {
      title: "COMPÉTENCE C1 : recenser et prendre en compte les normes, les réglementations applicables au projet/chantier",
      tasks: [
        "T 5.2 : planifier les étapes du projet/chantier",
        "T 5.4 : faire appliquer les règles liées à la santé, la sécurité et l’environnement"
      ],
      knowledge: [
        "Sûreté/sécurité",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Communication"
      ],
      criteria: [
        "Les contraintes et ressources normatives et réglementaires dont celles liées à la qualité, la sécurité, la santé et l’environnement sont prises en compte tout au long du projet/chantier",
        "Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants (monteur-câbleurs, autres corps d’état, sous-traitants)",
        "Les intervenants sont informés sur les règles liées à la santé, la sécurité et l’environnement applicable dans le cadre du projet/chantier",
        "La bonne utilisation des dispositifs de protection des personnes et des biens est contrôlée"
      ]
    },
    C2: {
      title: "COMPÉTENCE C2 : extraire les informations nécessaires à la réalisation des tâches",
      tasks: [
        "T 3.1 : proposer un protocole pour analyser le fonctionnement et/ou le comportement de l’installation",
        "T 4.1 : organiser la maintenance",
        "T 4.2 : réaliser la maintenance préventive ou prévisionnelle",
        "T 4.3 : réaliser la maintenance corrective"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité - santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "La demande client/utilisateur est analysée",
        "Les informations nécessaires à l’analyse et aux mesures sont extraites des documents (plans, schémas, bilans précédents, autres, etc.)",
        "Les informations relatives aux prescriptions techniques et aux réglementations sont recueillies",
        "Les conditions de la maintenance sont prises en compte",
        "Les risques professionnels sont identifiés",
        "Les habilitations et les certifications sont vérifiées",
        "Les informations écrites et orales nécessaires sont collectées et hiérarchisées",
        "Les informations écrites et orales collectées sont pertinentes pour l’activité"
      ]
    },
    C3: {
      title: "COMPÉTENCE C3 : gérer les risques et les aléas liés à la réalisation des tâches",
      tasks: [
        "T 5.3 : assurer le suivi de la réalisation du projet/chantier (coûts, délais, qualité)",
        "T 5.4 : faire appliquer les règles liées à la santé, la sécurité et l’environnement"
      ],
      knowledge: [
        "Sûreté/sécurité",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Communication"
      ],
      criteria: [
        "Les différentes étapes de l’activité sont adaptées pour tenir compte des nouvelles solutions retenues et des circonstances",
        "Des solutions pour pallier les aléas sont proposées à la hiérarchie",
        "La mise en œuvre des mesures de prévention est prévue",
        "La présence des dispositifs de protection des personnes et des biens est contrôlée",
        "Les dispositifs de protection des personnes et des biens sont utilisés",
        "Les intervenants sont informés sur les règles liées à la santé, la sécurité et l’environnement, applicables dans le cadre du projet/chantier",
        "Toutes les règles de santé, de sécurité et d’environnement sont respectées tout au long du projet/chantier",
        "Les risques liés à l’activité sont identifiés et recensés",
        "Des solutions pour prévenir les risques sont proposées et validées",
        "Les aléas sont gérés"
      ]
    },
    C4: {
      title: "COMPÉTENCE C4 : communiquer de manière adaptée à l'oral, à l'écrit, y compris en langue anglaise",
      tasks: [
        "T 7.3 : réceptionner l’installation avec le client/utilisateur",
        "T 8.2 : échanger, y compris en langue anglaise, avec les parties prenantes du projet/chantier",
        "T 8.3 : expliquer, y compris en langue anglaise, le fonctionnement de l’installation et former le client/utilisateur à son utilisation",
        "T 8.4 : préparer et animer des réunions",
        "T 8.5 : présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Les performances de l’installation sont validées avec le client/utilisateur conformément à ses prescriptions",
        "Le fonctionnement, le bon usage, les règles de sécurité et les contraintes techniques d’utilisation de l’installation sont expliqués au client ou à l’utilisateur",
        "Le transfert des compétences, les explications permettent la maîtrise de l’installation par le client ou l’utilisateur",
        "La langue anglaise est maîtrisée pour échanger avec tous les interlocuteurs",
        "Les documents écrits et de présentation sont précis et concis",
        "Les échanges techniques avec les interlocuteurs sont argumentés et construits",
        "Les solutions techniques ou des services sont clairement argumentées",
        "Les échanges écrits et oraux sont adaptés à l’interlocuteur",
        "Le vocabulaire professionnel est pertinent et précis",
        "La qualité des échanges au sein de l’équipe facilite son efficacité",
        "La satisfaction du client est recueillie",
        "La réunion est préparée et organisée",
        "Les objectifs de la réunion sont atteints",
        "Un compte rendu de réunion est rédigé et diffusé",
        "La présentation de l’offre tient compte des réactions du client/utilisateur",
        "L’offre commerciale proposée est validée par le client/utilisateur"
      ]
    },
    C5: {
      title: "COMPÉTENCE C5 : interpréter un besoin client/utilisateur, un CCTP, un cahier des charges",
      tasks: [
        "T 1.1 : analyser et/ou élaborer les documents relatifs aux besoins du client/utilisateur",
        "T 1.2 : élaborer un avant-projet/chantier (ou avant-projet sommaire)",
        "T 1.3 : dimensionner les constituants de l'installation",
        "T 1.4 : définir les coûts pour préparer une offre commerciale",
        "T 8.5 : présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Les besoins et les attentes du client/utilisateur sont identifiés, recensés et reformulés",
        "Tous les documents qui expriment les besoins du client/utilisateur sont collectés",
        "Les informations à acquérir, leur nature, leur flux, leur traitement sont déterminés, quantifiés et caractérisés",
        "Le flux d’énergie et les transformations sont déterminés",
        "Les solutions techniques proposées respectent les spécifications du client/utilisateur, les contraintes normatives et réglementaires",
        "Le bilan des puissances est établi",
        "Les besoins internes et externes pour la réalisation sont chiffrés",
        "Les temps de réalisation et d’étude sont chiffrés",
        "Les coûts sont établis et justifiés",
        "La plus-value (technique, économique, environnementale) des solutions techniques est précisée"
      ]
    },
    C6: {
      title: "COMPÉTENCE C6 : modéliser le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 1.2 : élaborer un avant-projet/chantier (ou avant-projet/chantier sommaire)",
        "T 1.3 : dimensionner les constituants de l’installation"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Communication"
      ],
      criteria: [
        "Le flux d’énergie et les transformations sont déterminés",
        "Les informations à acquérir, leur nature, leur flux, leur traitement sont déterminés",
        "Les solutions techniques de l'avant-projet développées sont pertinentes",
        "Les solutions techniques retenues sont modélisées",
        "Le bilan des puissances établi est exact",
        "Le bilan (volume/débit) des informations à traiter établi est exact"
      ]
    },
    C7: {
      title: "COMPÉTENCE C7 : simuler le comportement de tout ou partie d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 2.1 : choisir les matériels"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Communication"
      ],
      criteria: [
        "Les informations nécessaires sont caractérisées",
        "L’outil de simulation est paramétré en cohérence avec les données du projet",
        "Le fonctionnement de l’installation est simulé et validé",
        "La nomenclature des matériels est établie"
      ]
    },
    C8: {
      title: "COMPÉTENCE C8 : dimensionner les constituants d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 1.2 : élaborer un avant-projet/chantier (ou avant-projet sommaire)",
        "T 1.3 : dimensionner les constituants de l’installation"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Communication"
      ],
      criteria: [
        "Les solutions techniques de l’avant-projet développées sont pertinentes",
        "Les solutions techniques respectent les spécifications du client/utilisateur, les contraintes normatives et réglementaires"
      ]
    },
    C9: {
      title: "COMPÉTENCE C9 : choisir les constituants d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 2.1 : choisir les matériels"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Les matériels choisis respectent des contraintes normatives et réglementaires et le cahier des charges du client/utilisateur",
        "La nomenclature des matériels établie est complète et exacte"
      ]
    },
    C10: {
      title: "COMPÉTENCE C10 : proposer l’architecture d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 1.2 : élaborer un avant-projet/chantier (ou avant-projet sommaire)",
        "T 8.5 : présenter et argumenter, y compris en langue anglaise, une offre à un client/utilisateur"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Communication"
      ],
      criteria: [
        "Les solutions techniques proposées respectent les spécifications du client/utilisateur, les contraintes normatives et réglementaires",
        "L’architecture proposée respecte les spécifications du client/utilisateur, les contraintes normatives et réglementaires",
        "L’offre proposée est justifiée",
        "Les supports de présentation utilisés sont adaptés",
        "La plus-value (technique, économique, environnementale) des solutions techniques est précisée"
      ]
    },
    C11: {
      title: "COMPÉTENCE C11 : réaliser les documents techniques (plans, schémas, DOE, maquette virtuelle, etc.) du projet/chantier",
      tasks: [
        "T 2.2 : réaliser les documents techniques du projet/chantier",
        "T 8.1 : constituer et mettre à jour les dossiers du projet/chantier"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Les dossiers 1, 2, 3 sont actualisés",
        "Les documents et les données contractuels (CDC, CCTP, etc.) du projet/chantier sont rédigés, actualisés et archivés",
        "Les documents de conception du projet/chantier (architecture, schémas, DOE, notes de calcul, etc.) sont établis, actualisés et archivés",
        "Les notices d’utilisation de l’ouvrage, de l’installation de l’équipement électrique sont rédigées"
      ]
    },
    C13: {
      title: "COMPÉTENCE C13 : mesurer les grandeurs caractéristiques d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 3.2 : mesurer et contrôler l’installation, exploiter les mesures pour faire le diagnostic",
        "T 4.2 : réaliser la maintenance préventive ou prévisionnelle",
        "T 4.3 : réaliser la maintenance corrective"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "La procédure définie est appliquée",
        "L’installation et l’environnement de travail sont pris en compte",
        "Le niveau d’habilitation nécessaire avant l’intervention est déterminé",
        "Les actions de prévention et de sécurité sont mises en œuvre",
        "Les appareils de mesures sont installés",
        "Les mesures sont collectées",
        "Les enregistrements sont réalisés",
        "Les informations venant des objets connectés sont exploitées",
        "Les contrôles (locaux ou à distance) sont effectués",
        "Les essais associés sont effectués"
      ]
    },
    C14: {
      title: "COMPÉTENCE C14 : réaliser un ouvrage, une installation, un équipement électrique",
      tasks: [
        "T 6.1 : organiser l’espace de travail",
        "T 6.2 : implanter, poser, installer, câbler, raccorder les matériels électriques"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Communication"
      ],
      criteria: [
        "Les conditions d’intervention sont prises en compte",
        "Les risques professionnels sont identifiés",
        "Les actions de prévention sont mises en œuvre",
        "L’espace de travail est approvisionné en matériels, équipements et outillages",
        "Les contraintes de réalisation sont repérées",
        "Les adaptations nécessaires sont déterminées",
        "Les matériels électriques, les canalisations et les supports sont posés dans le respect des prescriptions et des règles de l’art",
        "Les matériels électriques sont raccordés",
        "Les contrôles associés sont effectués",
        "Les fiches d’autocontrôles sont complétées"
      ]
    },
    C15: {
      title: "COMPÉTENCE C15 : configurer et programmer les matériels dans le cadre du projet/chantier",
      tasks: [
        "T 6.3 : programmer les applications métiers",
        "T 7.1 : réaliser les contrôles, les configurations, les essais fonctionnels",
        "T 7.2 : vérifier le fonctionnement de l’installation"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Les programmes sont téléchargés",
        "Le programme est modifié, adapté pour répondre aux attentes du client/utilisateur",
        "Les matériels sont configurés et/ou interconnectés",
        "L’interopérabilité des matériels est réalisée",
        "Les programmes permettent d’atteindre les exigences attendues",
        "Les associations et l’interopérabilité des matériels sont validées",
        "Les essais sont réalisés afin de valider le fonctionnement de l’installation par rapport aux prescriptions",
        "Les réglages et paramétrages complémentaires sont réalisés"
      ]
    },
    C16: {
      title: "COMPÉTENCE C16 : appliquer un protocole pour mettre en service un ouvrage, une installation, un équipement électrique",
      tasks: [
        "T 7.1 : réaliser les contrôles, les configurations, les essais fonctionnels",
        "T 7.2 : vérifier le fonctionnement de l’installation"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Les conditions de la mise en service sont prises en compte",
        "Les contrôles normatifs, réglementaires et spécifiques aux prescriptions sont réalisés",
        "Les fiches de contrôles sont complétées",
        "Les associations et l’interopérabilité des matériels sont validées",
        "Les réglages et paramétrages sont validés",
        "Les performances de l’installation sont mesurées",
        "Le fonctionnement de l’installation est vérifié par rapport aux prescriptions",
        "La qualification de l’installation respecte les contraintes normatives et réglementaires"
      ]
    },
    C17: {
      title: "COMPÉTENCE C17 : réaliser un diagnostic de performance y compris énergétique, de sécurité, d’un ouvrage, d’une installation, d’un équipement électrique",
      tasks: [
        "T 3.2 : mesurer et contrôler l’installation, exploiter les mesures pour faire le diagnostic",
        "T 3.3 : formuler des préconisations",
        "T 4.3 : réaliser la maintenance corrective"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Le processus de diagnostic est appliqué",
        "Les conditions de la maintenance sont prises en compte",
        "Le niveau d’habilitation nécessaire est déterminé",
        "Les appareils de mesures sont sélectionnés et installés",
        "Les actions de prévention et de sécurité sont mises en œuvre",
        "Les mesures sont collectées et enregistrées",
        "Les informations venant des objets connectés sont collectées et enregistrées",
        "Le diagnostic est pertinent",
        "Suite au diagnostic, des modifications de l’installation sont proposées",
        "Suite au diagnostic, des recommandations, des réglages, des améliorations de l’installation sont proposées"
      ]
    },
    C18: {
      title: "COMPÉTENCE C18 : réaliser des opérations de maintenance sur un ouvrage, une installation, un équipement électrique",
      tasks: [
        "T 4.2 : réaliser la maintenance préventive ou prévisionnelle",
        "T 4.3 : réaliser la maintenance corrective"
      ],
      knowledge: [
        "Chaîne de puissance",
        "Chaîne d’informations",
        "Sûreté/sécurité",
        "Grandeurs",
        "Ressources et outils professionnels",
        "Qualité -santé - sécurité – environnement",
        "Diagnostic & maintenance",
        "Communication"
      ],
      criteria: [
        "Le protocole de maintenance est pris en compte",
        "Le niveau d’habilitation nécessaire est déterminé",
        "Les actions de prévention et de sécurité sont mises en œuvre",
        "La zone d’intervention est préparée",
        "Les opérations de maintenance préventive sont réalisées",
        "Le dysfonctionnement est diagnostiqué",
        "Les opérations de dépannage sont réalisées",
        "Les contrôles (locaux ou à distance) sont effectués",
        "Les essais associés sont effectués",
        "Le fonctionnement de l’installation est vérifié par rapport aux prescriptions",
        "Les fiches de contrôles, carnet de maintenance et/ou applications spécifiques sont complétées"
      ]
    }
  };

  const [selected, setSelected] = React.useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-4 py-4 sm:px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des compétences</h2>
          <p className="mt-1 text-sm text-gray-500">Référentiel BTS Électrotechnique</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700 w-24">Code</th>
                  <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700">Intitulé de la compétence</th>
                </tr>
              </thead>
              <tbody>
                {competences.map((c) => (
                  <tr
                    key={c.code}
                    id={encodeURIComponent(c.code)}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                    onClick={() => setSelected(c.code)}
                  >
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">{c.code}</td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">{c.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal fiche compétence */}
      {selected && competenceDetails[selected] && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {competenceDetails[selected].title}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 rounded-md px-2 py-1"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="border rounded-md">
                  <div className="px-4 py-2 border-b bg-gray-50 font-semibold text-sm">
                    Principales tâches mobilisant la compétence
                  </div>
                  <ul className="p-4 list-disc ml-5 text-sm text-gray-800">
                    {competenceDetails[selected].tasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </section>

                <section className="border rounded-md">
                  <div className="px-4 py-2 border-b bg-gray-50 font-semibold text-sm">
                    Principales connaissances STI
                  </div>
                  <ul className="p-4 list-disc ml-5 text-sm text-gray-800">
                    {competenceDetails[selected].knowledge.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </section>

                <section className="border rounded-md lg:col-span-1">
                  <div className="px-4 py-2 border-b bg-gray-50 font-semibold text-sm">
                    Critères d’observation de la compétence
                  </div>
                  <ul className="p-4 list-disc ml-5 text-sm text-gray-800">
                    {competenceDetails[selected].criteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelected(null)}
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

export default ReferentielCompetences;

