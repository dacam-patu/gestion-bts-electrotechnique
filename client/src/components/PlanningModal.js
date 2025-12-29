import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Briefcase, MapPin, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PlanningModal = ({ slot, students, projects, groups = [], existingSlots = [], onSave, onClose }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    project_id: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    phase: 1,
    location: '',
    notes: ''
  });

  const [classes, setClasses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [perStudentTimes, setPerStudentTimes] = useState({});

  // Charger les classes au montage du composant
  useEffect(() => {
    fetchClasses();
  }, []);

  // Debug: Vérifier les projets reçus
  useEffect(() => {
    console.log('🔍 PlanningModal - Projets reçus:', projects);
    console.log('🔍 PlanningModal - Nombre de projets:', projects?.length || 0);
    if (projects && projects.length > 0) {
      console.log('🔍 PlanningModal - Premier projet:', projects[0]);
    }
  }, [projects]);

  // Debug: Vérifier les étudiants reçus
  useEffect(() => {
    console.log('🔍 PlanningModal - Étudiants reçus:', students);
    console.log('🔍 PlanningModal - Nombre d\'étudiants:', students?.length || 0);
    if (students && students.length > 0) {
      console.log('🔍 PlanningModal - Premier étudiant:', students[0]);
      console.log('🔍 PlanningModal - Classes disponibles:', [...new Set(students.map(s => s.class))]);
    }
  }, [students]);

  // Filtrer les étudiants quand la classe change
  useEffect(() => {
    if (selectedClass) {
      const filtered = students.filter(student => student.class === selectedClass);
      setFilteredStudents(filtered);
      console.log('🔍 PlanningModal - Étudiants filtrés pour', selectedClass, ':', filtered.length);
    } else {
      setFilteredStudents([]);
    }
  }, [selectedClass, students]);

  // Réinitialiser l'étudiant si la classe change (séparé pour éviter les boucles)
  useEffect(() => {
    if (selectedClass && formData.student_id) {
      const filtered = students.filter(student => student.class === selectedClass);
      if (!filtered.find(s => s.id == formData.student_id)) { // Utiliser == pour comparer string/number
        console.log('🔍 PlanningModal - Réinitialisation de l\'étudiant car pas dans la classe');
        setFormData(prev => ({ ...prev, student_id: '' }));
      }
    }
  }, [selectedClass]); // Seulement quand la classe change

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      if (response.data.success) {
        setClasses(response.data.data);
        console.log('🔍 PlanningModal - Classes chargées:', response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
    }
  };

  const [errors, setErrors] = useState({});

  // Initialiser le formulaire avec les données du slot
  useEffect(() => {
    if (slot) {
      console.log('🔍 PlanningModal - Initialisation avec slot:', slot);
      setFormData({
        student_id: slot.student_id || '',
        project_id: slot.project_id || '',
        start_date: slot.start_date ? slot.start_date.split('T')[0] : '',
        end_date: slot.end_date ? slot.end_date.split('T')[0] : '',
        start_time: slot.start_time || '',
        end_time: slot.end_time || '',
        phase: slot.phase || 1,
        location: slot.location || '',
        notes: slot.notes || ''
      });
      if (slot.group_id) {
        setSelectedGroupId(String(slot.group_id));
      }

      // Si on édite un slot existant, définir la classe de l'étudiant
      if (slot.student_id && students.length > 0) {
        const student = students.find(s => s.id == slot.student_id); // Utiliser == pour comparer
        console.log('🔍 PlanningModal - Étudiant trouvé pour initialisation:', student);
        if (student && student.class) {
          setSelectedClass(student.class);
        }
      }
    }
  }, [slot, students]);

  // Fusionne les étudiants du groupe: API /groups/all + liste globale
  const getMergedGroupStudents = (groupId) => {
    const group = groups.find(g => String(g.id) === String(groupId));
    const fromGroupsAll = Array.isArray(group?.students) ? group.students : [];
    const fromStudents = Array.isArray(students)
      ? students.filter(s => String(s.group_id) === String(groupId))
      : [];
    const map = new Map();
    [...fromGroupsAll, ...fromStudents].forEach(s => {
      if (s && s.id) map.set(s.id, s);
    });
    return Array.from(map.values());
  };

  // Initialiser les heures par étudiant quand le groupe ou la phase change
  useEffect(() => {
    if (!selectedGroupId) return;
    const groupStudents = getMergedGroupStudents(selectedGroupId);
    const init = {};
    groupStudents.forEach(st => {
      init[st.id] = {
        start_time: formData.start_time || '',
        end_time: formData.end_time || '',
      };
    });
    setPerStudentTimes(init);
  }, [selectedGroupId, formData.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStudentTime = (studentId, field, value) => {
    setPerStudentTimes(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { start_time: '', end_time: '' }),
        [field]: value
      }
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Désormais: Groupe requis pour toutes les phases
    if (!selectedGroupId) {
      newErrors.group_id = 'Le groupe est requis';
    }
    if (!formData.project_id) {
      newErrors.project_id = 'Le projet est requis';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'La date de début est requise';
    }
    if (!formData.phase) {
      newErrors.phase = 'La phase est requise';
    }

    // Vérifier que la date de fin est après la date de début
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = 'La date de fin doit être après la date de début';
      }
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = 'L\'heure de fin doit être après l\'heure de début';
      }
    }

    // Vérifier les doublons: même groupe, même phase, même date/heure
    if (selectedGroupId && formData.phase && formData.start_date) {
      const phaseNum = parseInt(formData.phase) || 1;
      const mergedStudents = getMergedGroupStudents(selectedGroupId);
      const groupStudentIds = new Set(mergedStudents.map(s => parseInt(s.id)));
      const startDateISO = formData.start_date; // attendu YYYY-MM-DD
      if (phaseNum === 2 || phaseNum === 3) {
        // Vérifier chaque étudiant individuellement
        for (const st of mergedStudents) {
          const times = perStudentTimes[st.id] || {};
          const stStart = (times.start_time || '').substring(0,5);
          const stEnd = (times.end_time || '').substring(0,5);
          if (!stStart || !stEnd) {
            newErrors[`st_${st.id}`] = 'Heures requises';
            continue;
          }
          if (stStart >= stEnd) {
            newErrors[`st_${st.id}`] = 'Fin après début';
            continue;
          }
          const duplicate = (existingSlots || []).some(s => {
            if (slot?.id && s.id === slot.id) return false;
            if (parseInt(s.student_id) !== parseInt(st.id)) return false;
            if ((parseInt(s.phase) || 1) !== phaseNum) return false;
            const sDate = s.start_date ? s.start_date.split('T')[0] : null;
            const sStart = s.start_time ? s.start_time.substring(0,5) : '';
            const sEnd = s.end_time ? s.end_time.substring(0,5) : '';
            return sDate === startDateISO && sStart === stStart && sEnd === stEnd;
          });
          if (duplicate) {
            newErrors[`st_${st.id}`] = 'Doublon pour cet étudiant';
          }
        }
      } else {
        const startTime = (formData.start_time || '').substring(0,5);
        const endTime = (formData.end_time || '').substring(0,5);
        const duplicate = (existingSlots || []).some(s => {
          if (slot?.id && s.id === slot.id) return false; // ignorer le créneau en cours d'édition
          if (!groupStudentIds.has(parseInt(s.student_id))) return false;
          if ((parseInt(s.phase) || 1) !== phaseNum) return false;
          const sDate = s.start_date ? s.start_date.split('T')[0] : null;
          const sStart = s.start_time ? s.start_time.substring(0,5) : '';
          const sEnd = s.end_time ? s.end_time.substring(0,5) : '';
          return sDate === startDateISO && sStart === startTime && sEnd === endTime;
        });
        if (duplicate) {
          newErrors.duplicate = 'Un créneau identique existe déjà pour ce groupe (même date et heures).';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      if (errors.duplicate) {
        toast.error(errors.duplicate);
      }
      return;
    }

    // Trouver projet
    const project = projects.find(p => p.id == formData.project_id);

    // Définir le nom de la phase basé sur le numéro
    const phaseNames = {
      1: 'Phase 1 - Planification',
      2: 'Phase 2 - Pilotage',
      3: 'Phase 3 - Soutenance'
    };

    const phaseNum = parseInt(formData.phase) || 1;

    // Créer un créneau pour chaque étudiant du groupe sélectionné (toutes phases)
    if (selectedGroupId) {
      const groupStudents = getMergedGroupStudents(selectedGroupId);
      const phaseNum = parseInt(formData.phase) || 1;
      groupStudents.forEach(st => {
        const times = (phaseNum === 2 || phaseNum === 3) ? (perStudentTimes[st.id] || {}) : {};
        const stStart = (phaseNum === 2 || phaseNum === 3 ? times.start_time : formData.start_time) || '08:00';
        const stEnd = (phaseNum === 2 || phaseNum === 3 ? times.end_time : formData.end_time) || '17:00';
        const cleanSlotData = {
          id: null,
          student_id: parseInt(st.id),
          project_id: parseInt(formData.project_id) || null,
          start_date: formData.start_date,
          end_date: formData.end_date || formData.start_date,
          start_time: stStart,
          end_time: stEnd,
          phase: phaseNum,
          phase_name: phaseNames[phaseNum],
          location: formData.location || '',
          notes: formData.notes || '',
          first_name: st.first_name || '',
          last_name: st.last_name || '',
          project_name: project?.title || project?.name || ''
        };
        console.log('🔍 PlanningModal - Créneau (par groupe):', cleanSlotData);
        onSave(cleanSlotData);
      });
      return;
    }

    // Fallback (au cas où) — pas de groupe sélectionné: refuser
    return;
  };

  const handleChange = (field, value) => {
    console.log('🔍 PlanningModal - handleChange:', field, '=', value);
    setFormData({ ...formData, [field]: value });
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleClassChange = (className) => {
    console.log('🔍 PlanningModal - handleClassChange:', className);
    setSelectedClass(className);
    setFormData(prev => ({ ...prev, student_id: '' })); // Réinitialiser la sélection d'étudiant
    // Effacer l'erreur de classe si elle existe
    if (errors.student_id) {
      setErrors(prev => ({ ...prev, student_id: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {slot?.id ? 'Modifier le créneau' : 'Nouveau créneau'}
              </h2>
              <p className="text-blue-100 mt-1">
                Planification de projet/chantier
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection du groupe pour toutes les phases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Groupe *
            </label>
            <select
              value={String(selectedGroupId || '')}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                if (errors.group_id) setErrors(prev => ({ ...prev, group_id: '' }));
              }}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.group_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Sélectionner un groupe</option>
              {groups.map(group => (
                <option key={group.id} value={String(group.id)}>
                  {group.name} {group.project_title ? `• ${group.project_title}` : ''}
                </option>
              ))}
            </select>
            {errors.group_id && (
              <p className="text-red-500 text-sm mt-1">{errors.group_id}</p>
            )}
          </div>

          {/* Projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Projet/Chantier *
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => handleChange('project_id', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.project_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Sélectionner un projet</option>
              {projects && projects.length > 0 ? (
                projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title || project.name || 'Projet sans nom'}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucun projet disponible</option>
              )}
            </select>
            {errors.project_id && (
              <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de début *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de fin
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure de début
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Heure de fin
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.end_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Heures par étudiant - visible pour Pilotage/Soutenance */}
          {(parseInt(formData.phase) === 2 || parseInt(formData.phase) === 3) && selectedGroupId && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Heures par étudiant ({parseInt(formData.phase) === 2 ? 'Pilotage' : 'Soutenance'})
              </h4>
              <div className="border rounded-lg divide-y">
                {getMergedGroupStudents(selectedGroupId).map(st => (
                  <div key={st.id} className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <div className="text-sm text-gray-800">
                      {st.first_name} {st.last_name}
                      {errors[`st_${st.id}`] && (
                        <span className="ml-2 text-red-500">{errors[`st_${st.id}`]}</span>
                      )}
                    </div>
                    <input
                      type="time"
                      value={(perStudentTimes[st.id]?.start_time) || ''}
                      onChange={(e) => setStudentTime(st.id, 'start_time', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Début"
                    />
                    <input
                      type="time"
                      value={(perStudentTimes[st.id]?.end_time) || ''}
                      onChange={(e) => setStudentTime(st.id, 'end_time', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Fin"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Astuce: les heures générales ci-dessus pré-remplissent ces valeurs.
              </p>
            </div>
          )}

          {/* Phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phase *
            </label>
            <select
              value={formData.phase}
              onChange={(e) => handleChange('phase', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.phase ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value={1}>Phase 1 - Planification</option>
              <option value={2}>Phase 2 - Pilotage</option>
              <option value={3}>Phase 3 - Soutenance</option>
            </select>
            {errors.phase && (
              <p className="text-red-500 text-sm mt-1">{errors.phase}</p>
            )}
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Lieu
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Salle, atelier, chantier..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {slot?.id ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanningModal;
