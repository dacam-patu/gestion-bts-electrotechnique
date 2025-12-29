import React from 'react';

const EvaluationPrint = ({ student, evaluations, globalScore, globalComments, competenceInfo, evaluationType, evaluationMode, directNotes }) => {
  console.log('🖨️ Mode d\'évaluation:', evaluationMode);
  console.log('🖨️ DirectNotes:', directNotes);

  // Vérifier si les données sont valides
  if (!student) {
    console.log('❌ Données étudiant manquantes pour l\'impression:', { student });
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Erreur d'impression</h3>
        <p>Données étudiant manquantes pour générer l'impression.</p>
      </div>
    );
  }

  // Si pas d'évaluations, afficher un message mais continuer
  if (!evaluations || Object.keys(evaluations).length === 0) {
    console.log('⚠️ Aucune évaluation trouvée, affichage avec données vides');
  }

  const formatDate = (date) => {
    return new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Définir les descriptions des compétences
  const competenceDescriptions = {
    'C1': 'Recenser et prendre en compte les normes, les réglementations applicables au projet/chantier',
    'C3': 'Gérer les risques et les aléas liés à la réalisation des tâches',
    'C12': 'Gérer et conduire (y compris avec les documents de : organisation, planification, suivi, pilotage, réception etc.) le projet/chantier professionnel'
  };

  // Définir les indicateurs par compétence
  const indicators = {
    'C1': [
      'Les contraintes et ressources normatives et règlementaires dont celles liées à la qualité, la sécurité, la santé et l\'environnement sont prises en compte tout au long du projet/chantier',
      'Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants (monteur-câbleurs, autres corps d\'état, sous-traitants)',
      'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement applicable dans le cadre du projet/chantier',
      'La bonne utilisation des dispositifs de protection des personnes et des biens est contrôlée'
    ],
    'C3': [
      'Les différentes étapes de l\'activité sont adaptées pour tenir compte des nouvelles solutions retenues et des circonstances',
      'Des solutions pour pallier les aléas sont proposées à la hiérarchie',
      'La mise en œuvre des mesures de prévention est prévue',
      'La présence des dispositifs de protection des personnes et des biens est contrôlée',
      'Les dispositifs de protection des personnes et des biens sont utilisés',
      'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement, applicables dans le cadre du projet/chantier',
      'Toutes les règles de santé, de sécurité et d\'environnement sont respectées tout au long du projet/chantier',
      'Les risques liés à l\'activité sont identifiés et recensés',
      'Des solutions pour prévenir les risques sont proposées et validées',
      'Les aléas sont gérés'
    ],
    'C12': [
      'Les informations écrites et orales relatives au projet/chantier sont collectées',
      'La liste et la disponibilité des matériels, équipements, outillages et outils numériques nécessaires sont vérifiées',
      'L\'intervention est planifiée',
      'La durée du projet/chantier est évaluée',
      'Les approvisionnements sont planifiés',
      'Le projet/chantier est organisé pour qu\'il soit mené de manière éco-responsable',
      'Les tâches sont réparties en fonction des habilitations, des certifications des équipiers en tenant compte du planning des autres intervenants',
      'Les revues de projet sont effectuées',
      'Les situations imprévues, délicates, conflictuelles sont gérées en lien avec la hiérarchie',
      'Les arbitrages nécessaires en fonction des contraintes rencontrées sont pris',
      'Les différentes étapes du planning sont respectées ou adaptées',
      'La qualité et la conformité des travaux réalisés, y compris par la sous-traitance, sont contrôlées',
      'Les indicateurs (coûts, délais, qualité) de suivi du projet/chantier sont renseignés',
      'Les intervenants sont informés sur les règles liées à la santé, la sécurité et l\'environnement, applicables dans le cadre du projet/chantier',
      'Les dispositifs de protection des personnes et des biens sont présents et bien utilisés',
      'Les règles de santé, de sécurité et environnementales sont respectées tout au long du projet/chantier',
      'L\'équipe est animée pour mener à bien le projet/chantier'
    ]
  };

  // Fonction pour calculer la moyenne des croix
  const calculateAverageLevel = (competence) => {
    // Si on a des directNotes (évaluation en mode direct), les utiliser pour la ligne de moyenne
    if (directNotes && directNotes[competence]) {
      const directData = directNotes[competence];
      if (directData.N1) return 1;
      if (directData.N2) return 2;
      if (directData.N3) return 3;
      if (directData.N4) return 4;
      return 0;
    }

    // Sinon, utiliser la logique existante pour le mode critères
    const data = evaluations[competence];
    if (!data || !data.criteria) return 0;

    const positions = [];
    Object.values(data.criteria).forEach(criterion => {
      if (criterion.evaluated) {
        if (criterion.N1) positions.push(1);
        else if (criterion.N2) positions.push(2);
        else if (criterion.N3) positions.push(3);
        else if (criterion.N4) positions.push(4);
      }
    });

    if (positions.length === 0) return 0;
    const average = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
    return Math.floor(average);
  };


  return (
    <div className="print-container" style={{ 
      width: '210mm', 
      height: '297mm', 
      margin: '0 auto', 
      padding: '8mm 6mm 8mm 6mm',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt',
      lineHeight: '1.1'
    }}>
      {/* En-tête */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2mm',
        borderBottom: '1px solid #1e40af',
        paddingBottom: '1mm'
      }}>
        <h1 style={{ 
          fontSize: '14pt', 
          fontWeight: 'bold', 
          margin: '0 0 1mm 0',
          color: '#1e40af'
        }}>
          GRILLE D'ÉVALUATION U52
        </h1>
        <div style={{ fontSize: '10pt', color: '#6b7280' }}>
          Évaluation des compétences professionnelles
        </div>
      </div>

      {/* Nom de l'étudiant en évidence */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '3mm',
        padding: '2mm',
        backgroundColor: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '2mm'
      }}>
        <div style={{ 
          fontSize: '16pt', 
          fontWeight: 'bold', 
          color: '#1e40af',
          textTransform: 'uppercase'
        }}>
          {student.firstName || student.student_name || 'N/A'} {student.lastName || ''}
        </div>
      </div>

      {/* Informations étudiant */}
      <div style={{ 
        marginBottom: '2mm',
        padding: '1mm',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '1mm'
      }}>
        <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '1mm' }}>
          Informations de l'évaluation
        </div>
        <div style={{ fontSize: '8pt', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1mm' }}>
          <div><strong>Étudiant :</strong> <span style={{ fontSize: '12pt', fontWeight: 'bold' }}>{student.firstName || student.student_name || 'N/A'} {student.lastName || ''}</span></div>
          <div><strong>Date :</strong> {formatDate()}</div>
          <div><strong>Nom de l'activité :</strong> {student.activity_name || (() => {
            // Chercher dans toutes les compétences
            for (const competence of ['C1', 'C3', 'C12']) {
              if (evaluations[competence]?.activity_name) {
                return evaluations[competence].activity_name;
              }
            }
            return 'Non spécifié';
          })()}</div>
          <div><strong>Type d'activité :</strong> {(() => {
            const activityType = student.activity_type || (() => {
              // Chercher dans toutes les compétences
              for (const competence of ['C1', 'C3', 'C12']) {
                if (evaluations[competence]?.activity_type) {
                  return evaluations[competence].activity_type;
                }
              }
              return null;
            })();
            
            // Convertir les libellés en libellés courts
            if (activityType === 'entreprise' || activityType === 'Activités observées en entreprise') {
              return 'En entreprise';
            } else if (activityType === 'centre' || activityType === 'Activités observées en centre de formation') {
              return 'En centre de formation';
            } else if (activityType) {
              return activityType;
            } else {
              return 'Non spécifié';
            }
          })()}</div>
        </div>
        
      </div>

      {/* Compétences */}
      {['C1', 'C3', 'C12'].map(competence => {
        const data = evaluations && evaluations[competence] ? evaluations[competence] : null;
        if (!data) {
          // Afficher une section vide si pas de données
          return (
            <div key={competence} style={{ marginBottom: '2mm' }}>
              <h3 style={{ 
                fontSize: '10pt', 
                fontWeight: 'bold', 
                margin: '0 0 1mm 0',
                color: '#1f2937',
                backgroundColor: '#e5e7eb',
                padding: '1mm',
                borderRadius: '1mm'
              }}>
                {competence} - {competenceDescriptions[competence]}
              </h3>
              <div style={{ 
                padding: '1mm', 
                textAlign: 'center', 
                color: '#6b7280',
                fontStyle: 'italic',
                backgroundColor: '#f9fafb',
                border: '1px dashed #d1d5db',
                borderRadius: '1mm',
                fontSize: '8pt'
              }}>
                Aucune évaluation disponible pour cette compétence
              </div>
            </div>
          );
        }

        const competenceIndicators = indicators[competence] || [];
        const averageLevel = calculateAverageLevel(competence);

        return (
          <div key={competence} style={{ marginBottom: '2mm' }}>
            <h3 style={{ 
              fontSize: '10pt', 
              fontWeight: 'bold', 
              margin: '0 0 1mm 0',
              color: '#1f2937',
              backgroundColor: '#e5e7eb',
              padding: '1mm',
              borderRadius: '1mm'
            }}>
              {competence} - {competenceDescriptions[competence]}
            </h3>

            {/* Tableau des critères */}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '7pt',
              marginBottom: '1mm'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.5mm', 
                    textAlign: 'left',
                    width: '60%',
                    height: '4mm'
                  }}>
                    Critères d'évaluation
                  </th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.3mm',
                    textAlign: 'center',
                    width: '10%',
                    height: '4mm'
                  }}>
                    Évalué
                  </th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.3mm',
                    textAlign: 'center',
                    width: '7.5%',
                    height: '4mm'
                  }}>
                    N1
                  </th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.3mm',
                    textAlign: 'center',
                    width: '7.5%',
                    height: '4mm'
                  }}>
                    N2
                  </th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.3mm',
                    textAlign: 'center',
                    width: '7.5%',
                    height: '4mm'
                  }}>
                    N3
                  </th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.3mm',
                    textAlign: 'center',
                    width: '7.5%',
                    height: '4mm'
                  }}>
                    N4
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Ligne de moyenne */}
                <tr style={{ backgroundColor: '#fef3c7', fontWeight: 'bold' }}>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.5mm',
                    textAlign: 'center',
                    height: '4mm'
                  }}>
                    
                  </td>
                  <td style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '0.3mm',
                    textAlign: 'center',
                    height: '4mm'
                  }}>
                    ✓
                  </td>
                  {[1, 2, 3, 4].map(level => {
                    const isAverage = averageLevel === level;
                    return (
                      <td key={level} style={{ 
                        border: '1px solid #d1d5db', 
                        padding: '0.3mm',
                        textAlign: 'center',
                        backgroundColor: isAverage ? '#dbeafe' : 'transparent',
                        height: '4mm'
                      }}>
                        {isAverage ? (
                          <span style={{ 
                            color: '#dc2626', 
                            fontWeight: 'bold', 
                            fontSize: '10pt'
                          }}>
                            ✗
                          </span>
                        ) : ''}
                      </td>
                    );
                  })}
                </tr>

                {/* Toujours afficher le mode détaillé avec tous les critères */}
                {competenceIndicators.map((indicator, index) => {
                  const criterion = data.criteria && data.criteria[indicator];
                  return (
                    <tr key={index}>
                      <td style={{ 
                        border: '1px solid #d1d5db', 
                          padding: '0.5mm',
                          fontSize: '7pt',
                          height: '4mm'
                      }}>
                        {indicator}
                      </td>
                      <td style={{ 
                        border: '1px solid #d1d5db', 
                          padding: '0.3mm',
                          textAlign: 'center',
                          height: '4mm'
                      }}>
                          {(criterion && criterion.evaluated) ? '✓' : ''}
                      </td>
                      {['N1', 'N2', 'N3', 'N4'].map((level, levelIndex) => {
                        const isSelected = criterion && criterion[level];
                          
                        return (
                          <td key={level} style={{ 
                            border: '1px solid #d1d5db', 
                              padding: '0.3mm',
                              textAlign: 'center',
                              height: '4mm'
                          }}>
                            {isSelected ? (
                              <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '10pt' }}>✗</span>
                            ) : ''}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Note globale */}
      <div style={{ 
        marginTop: '2mm',
        padding: '1mm',
        textAlign: 'center',
        border: '1px solid #1e40af',
        borderRadius: '1mm',
        backgroundColor: '#eff6ff'
      }}>
        <div style={{ 
          fontSize: '12pt', 
          fontWeight: 'bold', 
          color: '#1e40af',
          marginBottom: '1mm'
        }}>
          Note globale : {(globalScore || 0).toFixed(2)}/20
        </div>
        {globalComments && (
          <div style={{ 
            fontSize: '8pt',
            fontStyle: 'italic',
            color: '#6b7280',
            marginTop: '1mm'
          }}>
            {globalComments}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationPrint;