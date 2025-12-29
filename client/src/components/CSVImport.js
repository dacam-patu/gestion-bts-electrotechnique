import React, { useState } from 'react';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CSVImport = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [loading, setLoading] = useState(false);

  // Champs disponibles pour l'import (ordre logique)
  const availableFields = [
    { key: 'first_name', label: 'Prénom', required: true },
    { key: 'last_name', label: 'Nom', required: true },
    { key: 'date_de_naissance', label: 'Date de naissance', required: false },
    { key: 'class', label: 'Classe', required: false },
    { key: 'group_name', label: 'Groupe', required: false },
    { key: 'project_title', label: 'Projet', required: false },
    { key: 'role', label: 'Rôle', required: false }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérifier l'extension ou le type MIME
      const isValidCSV = selectedFile.name.toLowerCase().endsWith('.csv') || 
                        selectedFile.type === 'text/csv' ||
                        selectedFile.type === 'application/csv';
      
      if (isValidCSV) {
        setFile(selectedFile);
        setFieldMapping({}); // Reset le mapping
        setPreview(null); // Reset l'aperçu
        parseCSV(selectedFile);
      } else {
        toast.error('Veuillez sélectionner un fichier CSV valide (.csv)');
      }
    }
  };

  // Fonction robuste pour parser CSV
  const parseCSVLine = (line) => {
    if (!line || typeof line !== 'string') return [];
    
    // Nettoyer la ligne
    line = line.trim();
    if (!line) return [];
    
    // Gérer les différents séparateurs possibles
    const separators = [',', ';', '\t'];
    let separator = ',';
    
    // Détecter le séparateur le plus utilisé
    const separatorCounts = separators.map(sep => ({
      sep,
      count: (line.match(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    }));
    
    const maxSeparator = separatorCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    if (maxSeparator.count > 0) {
      separator = maxSeparator.sep;
    }
    
    // Parser avec le séparateur détecté
    const fields = line.split(separator).map(field => {
      // Nettoyer chaque champ
      field = field.trim();
      // Enlever les guillemets si présents
      if ((field.startsWith('"') && field.endsWith('"')) || 
          (field.startsWith("'") && field.endsWith("'"))) {
        field = field.slice(1, -1);
      }
      return field;
    });
    
    return fields;
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // console.log('Contenu brut du fichier:', text.substring(0, 200) + '...');
        
        // Normaliser les fins de ligne
        const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalizedText.split('\n').filter(line => line.trim());
        
        // console.log('Nombre de lignes:', lines.length);
        // console.log('Première ligne:', lines[0]);
        
        if (lines.length === 0) {
          toast.error('Le fichier CSV est vide');
          return;
        }

        const headers = parseCSVLine(lines[0]);
        // console.log('Headers parsés:', headers);
        
        if (headers.length === 0) {
          toast.error('Impossible de parser les en-têtes du fichier CSV');
          return;
        }
        
        // Créer le mapping par défaut
        const mapping = {};
        
        // Fonction pour normaliser et comparer les noms de colonnes
        const normalizeColumnName = (name) => {
          return name.toLowerCase()
            .trim()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ûüù]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9]/g, '');
        };
        
        // D'abord, essayer de mapper les champs requis
        availableFields.filter(f => f.required).forEach(field => {
          const headerIndex = headers.findIndex(header => {
            const normalizedHeader = normalizeColumnName(header);
            const normalizedFieldLabel = normalizeColumnName(field.label);
            const normalizedFieldKey = normalizeColumnName(field.key);
            
            return normalizedHeader === normalizedFieldLabel ||
                   normalizedHeader === normalizedFieldKey ||
                   normalizedHeader.includes(normalizedFieldLabel) ||
                   normalizedFieldLabel.includes(normalizedHeader) ||
                   // Variations courantes spécifiques
                   (field.key === 'first_name' && (normalizedHeader.includes('prenom') || normalizedHeader.includes('first'))) ||
                   (field.key === 'last_name' && (normalizedHeader.includes('nom') || normalizedHeader.includes('last') || normalizedHeader.includes('derniere'))) ||
                   (field.key === 'date_de_naissance' && (normalizedHeader.includes('naissance') || normalizedHeader.includes('date') || normalizedHeader.includes('birth')));
          });
          
          if (headerIndex !== -1 && !Object.values(mapping).includes(headerIndex)) {
            mapping[field.key] = headerIndex;
            // console.log(`Mapping automatique: ${field.label} -> index ${headerIndex} (${headers[headerIndex]})`);
          }
        });
        
        // Ensuite, mapper les champs optionnels
        availableFields.filter(f => !f.required).forEach(field => {
          const headerIndex = headers.findIndex(header => {
            const normalizedHeader = normalizeColumnName(header);
            const normalizedFieldLabel = normalizeColumnName(field.label);
            const normalizedFieldKey = normalizeColumnName(field.key);
            
            return normalizedHeader === normalizedFieldLabel ||
                   normalizedHeader === normalizedFieldKey ||
                   normalizedHeader.includes(normalizedFieldLabel) ||
                   normalizedFieldLabel.includes(normalizedHeader) ||
                   // Variations courantes spécifiques
                   (field.key === 'class' && (normalizedHeader.includes('classe') || normalizedHeader.includes('niveau'))) ||
                   (field.key === 'group_name' && (normalizedHeader.includes('groupe') || normalizedHeader.includes('group'))) ||
                   (field.key === 'project_title' && (normalizedHeader.includes('projet') || normalizedHeader.includes('project'))) ||
                   (field.key === 'role' && (normalizedHeader.includes('role') || normalizedHeader.includes('fonction')));
          });
          
          if (headerIndex !== -1 && !Object.values(mapping).includes(headerIndex)) {
            mapping[field.key] = headerIndex;
            // console.log(`Mapping automatique: ${field.label} -> index ${headerIndex} (${headers[headerIndex]})`);
          }
        });
        
        // console.log('Mapping final:', mapping);
        
        setFieldMapping(mapping);
        setPreview({
          headers,
          sampleData: lines.slice(1, 4).map(line => parseCSVLine(line))
        });
      } catch (error) {
        console.error('Erreur lors du parsing CSV:', error);
        toast.error('Erreur lors du parsing du fichier CSV');
      }
    };
    
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          const lines = normalizedText.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            toast.error('Le fichier CSV est vide');
            return;
          }

          const students = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const student = {};
            
            Object.entries(fieldMapping).forEach(([field, index]) => {
              if (index >= 0 && index < values.length) {
                student[field] = values[index];
              }
            });
            
            return student;
          });

          // console.log('Étudiants à importer:', students);
          await onImport(students);
          toast.success(`${students.length} étudiants importés avec succès`);
          onClose();
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          toast.error('Erreur lors de l\'import: ' + error.message);
        }
      };
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      toast.error('Erreur lors de l\'import: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFieldMapping = (fieldKey, csvIndex) => {
    setFieldMapping(prev => {
      const newMapping = { ...prev };
      
      // Si on sélectionne une colonne déjà utilisée, on la retire des autres champs
      if (csvIndex !== '' && csvIndex !== undefined && csvIndex !== null) {
        const indexToSet = parseInt(csvIndex);
        
        // Retirer cette colonne des autres champs
        Object.keys(newMapping).forEach(key => {
          if (key !== fieldKey && newMapping[key] === indexToSet) {
            delete newMapping[key];
          }
        });
        
        // Mettre à jour le champ actuel
        newMapping[fieldKey] = indexToSet;
      } else {
        // Supprimer le mapping pour ce champ
        delete newMapping[fieldKey];
      }
      
      return newMapping;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{`
        select option {
          padding: 8px;
          margin: 2px 0;
          border-radius: 4px;
        }
        select option:disabled {
          opacity: 0.6;
        }
      `}</style>
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Import CSV - Étudiants</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Upload de fichier */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un fichier CSV
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file"
            />
            <label htmlFor="csv-file" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                Cliquez pour sélectionner un fichier CSV
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Format attendu: Prénom, Nom, Classe, Groupe, Projet, Rôle
              </p>
            </label>
          </div>
        </div>

        {/* Mapping des champs */}
        {preview && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Mapping des champs
              </h3>
              <button
                onClick={() => setFieldMapping({})}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Réinitialiser le mapping
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-3">
                  <label className="flex-1 text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    value={fieldMapping[field.key] || ''}
                    onChange={(e) => updateFieldMapping(field.key, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                    style={{ minHeight: '40px' }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {preview.headers.map((header, index) => {
                      const isUsed = Object.values(fieldMapping).includes(index);
                      const isCurrentField = fieldMapping[field.key] === index;
                      return (
                        <option 
                          key={index} 
                          value={index}
                          disabled={isUsed && !isCurrentField}
                          style={{
                            color: isUsed && !isCurrentField ? '#9CA3AF' : '#374151',
                            backgroundColor: isUsed && !isCurrentField ? '#F3F4F6' : 'white'
                          }}
                        >
                          {header} {isUsed && !isCurrentField ? '(déjà utilisé)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {fieldMapping[field.key] !== undefined && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu des données */}
        {preview && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Aperçu des données
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {preview.headers.map((header, index) => (
                      <th key={index} className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleData.map((values, rowIndex) => (
                    <tr key={rowIndex} className="bg-white">
                      {values.map((value, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation */}
        {preview && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Validation
            </h3>
            <div className="space-y-2">
              {availableFields.filter(f => f.required).map(field => (
                <div key={field.key} className="flex items-center space-x-2">
                  {fieldMapping[field.key] !== undefined ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-sm ${fieldMapping[field.key] !== undefined ? 'text-green-700' : 'text-red-700'}`}>
                    {field.label} {fieldMapping[field.key] !== undefined ? 'mappé' : 'non mappé'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading || !availableFields.filter(f => f.required).every(f => fieldMapping[f.key] !== undefined)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Import en cours...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Importer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImport; 