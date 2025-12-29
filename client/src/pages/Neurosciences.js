import React, { useState } from 'react';
import { Brain, BookOpen, Lightbulb, Target, Users, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Neurosciences = () => {
  const [activeSection, setActiveSection] = useState('principles');

  const sections = [
    { id: 'principles', title: 'Principes fondamentaux', icon: Brain },
    { id: 'overview', title: 'Vue d\'ensemble', icon: BookOpen },
    { id: 'learning', title: 'Apprentissage', icon: Lightbulb },
    { id: 'memory', title: 'Mémoire', icon: Target },
    { id: 'attention', title: 'Attention', icon: Users },
    { id: 'collaboration', title: 'Collaboration', icon: Clock },
    { id: 'time', title: 'Gestion du temps', icon: CheckCircle }
  ];

  const content = {
    principles: {
      title: "Principes Fondamentaux des Neurosciences",
      description: "Les bases scientifiques qui expliquent le fonctionnement du cerveau et de l'apprentissage",
      items: [
        {
          icon: Brain,
          title: "Plasticité cérébrale",
          description: "Le cerveau peut se modifier tout au long de la vie grâce à la formation de nouvelles connexions neuronales (synapses). Cette capacité permet l'apprentissage et l'adaptation à de nouvelles situations."
        },
        {
          icon: Lightbulb,
          title: "Neurogenèse",
          description: "La production de nouveaux neurones se poursuit à l'âge adulte, particulièrement dans l'hippocampe, une région cruciale pour la mémoire et l'apprentissage."
        },
        {
          icon: Target,
          title: "Spécialisation hémisphérique",
          description: "Les deux hémisphères cérébraux ont des fonctions complémentaires : l'hémisphère gauche pour le langage et la logique, l'hémisphère droit pour la créativité et l'intuition."
        },
        {
          icon: BookOpen,
          title: "Consolidation de la mémoire",
          description: "Les souvenirs passent d'un état fragile (mémoire de travail) à un état stable (mémoire à long terme) grâce au processus de consolidation qui se déroule principalement pendant le sommeil."
        },
        {
          icon: Users,
          title: "Système de récompense",
          description: "Le cerveau libère de la dopamine lors d'expériences positives, renforçant les comportements d'apprentissage. Cette motivation intrinsèque est plus efficace que les récompenses externes."
        },
        {
          icon: Clock,
          title: "Rythmes circadiens",
          description: "L'activité cérébrale varie selon des cycles de 24h. L'attention et la mémoire sont optimales à certains moments de la journée, variables selon les individus."
        },
        {
          icon: AlertCircle,
          title: "Stress et apprentissage",
          description: "Un stress modéré peut améliorer l'apprentissage en libérant du cortisol, mais un stress chronique ou intense nuit à la formation de nouveaux souvenirs."
        },
        {
          icon: CheckCircle,
          title: "Multimodalité sensorielle",
          description: "L'apprentissage est plus efficace quand plusieurs sens sont sollicités simultanément (visuel, auditif, kinesthésique), car cela active plusieurs zones cérébrales."
        }
      ]
    },
    overview: {
      title: "Neurosciences et Apprentissage",
      description: "Comprendre le fonctionnement du cerveau pour optimiser l'apprentissage",
      items: [
        {
          icon: Brain,
          title: "Plasticité cérébrale",
          description: "Le cerveau se modifie constamment en fonction de l'apprentissage et de l'expérience"
        },
        {
          icon: BookOpen,
          title: "Stratégies cognitives",
          description: "Techniques d'apprentissage basées sur les neurosciences"
        },
        {
          icon: Lightbulb,
          title: "Métacognition",
          description: "Apprendre à apprendre en comprenant ses propres processus mentaux"
        }
      ]
    },
    learning: {
      title: "Stratégies d'Apprentissage Efficaces",
      description: "Méthodes basées sur les neurosciences pour améliorer l'apprentissage",
      items: [
        {
          icon: CheckCircle,
          title: "Répétition espacée",
          description: "Réviser à intervalles croissants pour consolider la mémoire à long terme"
        },
        {
          icon: Target,
          title: "Pratique délibérée",
          description: "Se concentrer sur les aspects difficiles plutôt que sur ce qu'on maîtrise déjà"
        },
        {
          icon: Users,
          title: "Apprentissage collaboratif",
          description: "Expliquer aux autres renforce sa propre compréhension"
        },
        {
          icon: Clock,
          title: "Pauses régulières",
          description: "Le cerveau a besoin de temps pour consolider les informations"
        }
      ]
    },
    memory: {
      title: "Optimisation de la Mémoire",
      description: "Techniques pour améliorer la rétention et le rappel d'informations",
      items: [
        {
          icon: Lightbulb,
          title: "Méthode des loci",
          description: "Associer des informations à des lieux familiers pour faciliter le rappel"
        },
        {
          icon: BookOpen,
          title: "Cartes mentales",
          description: "Organiser visuellement les informations pour stimuler les deux hémisphères"
        },
        {
          icon: Target,
          title: "Chunking",
          description: "Diviser les informations complexes en petits groupes plus faciles à mémoriser"
        },
        {
          icon: Brain,
          title: "Mémoire multisensorielle",
          description: "Utiliser plusieurs sens (visuel, auditif, kinesthésique) pour renforcer l'apprentissage"
        }
      ]
    },
    attention: {
      title: "Gestion de l'Attention",
      description: "Techniques pour maintenir et améliorer la concentration",
      items: [
        {
          icon: Target,
          title: "Focus unique",
          description: "Éviter le multitâche qui divise l'attention et réduit l'efficacité"
        },
        {
          icon: Clock,
          title: "Technique Pomodoro",
          description: "25 minutes de concentration intense suivies de 5 minutes de pause"
        },
        {
          icon: AlertCircle,
          title: "Gestion des distractions",
          description: "Créer un environnement propice à la concentration"
        },
        {
          icon: Lightbulb,
          title: "Méditation de pleine conscience",
          description: "Exercices pour améliorer la capacité d'attention et de concentration"
        }
      ]
    },
    collaboration: {
      title: "Apprentissage Collaboratif",
      description: "Lever les bénéfices du travail en groupe basé sur les neurosciences",
      items: [
        {
          icon: Users,
          title: "Effet de génération",
          description: "Produire du contenu active plus de zones cérébrales que simplement lire"
        },
        {
          icon: BookOpen,
          title: "Enseignement par les pairs",
          description: "Expliquer aux autres renforce sa propre compréhension et mémorisation"
        },
        {
          icon: Brain,
          title: "Diversité cognitive",
          description: "Travailler avec des personnes ayant des styles d'apprentissage différents"
        },
        {
          icon: Target,
          title: "Feedback constructif",
          description: "Recevoir et donner des retours pour améliorer l'apprentissage"
        }
      ]
    },
    time: {
      title: "Gestion Optimale du Temps",
      description: "Organiser son temps d'apprentissage selon les rythmes biologiques",
      items: [
        {
          icon: Clock,
          title: "Rythmes circadiens",
          description: "Identifier ses moments de plus grande efficacité cognitive"
        },
        {
          icon: Brain,
          title: "Fatigue cognitive",
          description: "Reconnaître les signes de fatigue et adapter son planning"
        },
        {
          icon: Target,
          title: "Blocs d'apprentissage",
          description: "Organiser le temps en sessions de 45-90 minutes avec des pauses"
        },
        {
          icon: CheckCircle,
          title: "Récupération active",
          description: "Utiliser les pauses pour consolider les apprentissages"
        }
      ]
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Neurosciences et Apprentissage</h1>
        </div>
        <p className="text-lg text-gray-600">
          Découvrez comment les neurosciences peuvent optimiser votre apprentissage et votre enseignement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation latérale */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {content[activeSection].title}
              </h2>
              <p className="text-gray-600 text-lg">
                {content[activeSection].description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content[activeSection].items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Section spéciale pour les principes */}
            {activeSection === 'principles' && (
              <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-start">
                  <Brain className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Pourquoi ces principes sont-ils importants ?
                    </h3>
                    <p className="text-purple-800 mb-4">
                      Comprendre ces mécanismes cérébraux permet de :
                    </p>
                    <ul className="text-purple-800 space-y-2">
                      <li>• <strong>Optimiser les méthodes d'enseignement</strong> en s'appuyant sur le fonctionnement naturel du cerveau</li>
                      <li>• <strong>Améliorer la rétention des connaissances</strong> grâce à des techniques basées sur la consolidation de la mémoire</li>
                      <li>• <strong>Augmenter la motivation des apprenants</strong> en exploitant le système de récompense cérébral</li>
                      <li>• <strong>Adapter les stratégies d'apprentissage</strong> aux rythmes biologiques individuels</li>
                      <li>• <strong>Réduire le stress d'apprentissage</strong> en comprenant l'impact du stress sur la cognition</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section d'action */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <div className="flex items-start">
                <Info className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Comment appliquer ces concepts ?
                  </h3>
                  <ul className="text-blue-800 space-y-2">
                    <li>• Intégrez progressivement ces techniques dans votre routine d'apprentissage</li>
                    <li>• Expérimentez différentes méthodes pour trouver celles qui vous conviennent</li>
                    <li>• Partagez ces connaissances avec vos collègues et étudiants</li>
                    <li>• Adaptez les stratégies selon le contexte et les objectifs d'apprentissage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Neurosciences;
