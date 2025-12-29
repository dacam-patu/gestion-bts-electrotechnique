import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Calendar, Target } from 'lucide-react';

const PlanningAnalytics = ({ slots, students, projects }) => {
  
  const analytics = useMemo(() => {
    if (!slots || !students || !projects) return null;

    // Calculs de base
    const totalSlots = slots.length;
    const totalStudents = students.length;
    const totalProjects = projects.length;
    
    // Répartition par phase
    const phaseDistribution = slots.reduce((acc, slot) => {
      acc[slot.phase] = (acc[slot.phase] || 0) + 1;
      return acc;
    }, {});

    // Répartition par étudiant
    const studentDistribution = slots.reduce((acc, slot) => {
      const studentName = `${slot.first_name} ${slot.last_name}`;
      acc[studentName] = (acc[studentName] || 0) + 1;
      return acc;
    }, {});

    // Calcul des heures totales
    const totalHours = slots.reduce((total, slot) => {
      if (slot.start_time && slot.end_time) {
        const start = new Date(`2000-01-01T${slot.start_time}`);
        const end = new Date(`2000-01-01T${slot.end_time}`);
        const duration = (end - start) / (1000 * 60 * 60); // heures
        return total + duration;
      }
      return total;
    }, 0);

    // Répartition des heures par étudiant
    const hoursPerStudent = slots.reduce((acc, slot) => {
      const studentName = `${slot.first_name} ${slot.last_name}`;
      if (slot.start_time && slot.end_time) {
        const start = new Date(`2000-01-01T${slot.start_time}`);
        const end = new Date(`2000-01-01T${slot.end_time}`);
        const duration = (end - start) / (1000 * 60 * 60);
        acc[studentName] = (acc[studentName] || 0) + duration;
      }
      return acc;
    }, {});

    // Créneaux par jour de la semaine
    const dayDistribution = slots.reduce((acc, slot) => {
      const date = new Date(slot.start_date);
      const dayName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][date.getDay()];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {});

    // Optimisations suggérées
    const suggestions = [];
    
    // Vérifier les étudiants avec trop de créneaux
    const maxSlotsPerStudent = Math.max(...Object.values(studentDistribution));
    const overloadedStudents = Object.entries(studentDistribution)
      .filter(([name, count]) => count > maxSlotsPerStudent * 0.8)
      .map(([name, count]) => ({ name, count }));

    if (overloadedStudents.length > 0) {
      suggestions.push({
        type: 'warning',
        message: `${overloadedStudents.length} étudiant${overloadedStudents.length > 1 ? 's' : ''} avec une charge élevée`,
        details: overloadedStudents.map(s => `${s.name} (${s.count} créneaux)`).join(', ')
      });
    }

    // Vérifier les jours surchargés
    const maxSlotsPerDay = Math.max(...Object.values(dayDistribution));
    const overloadedDays = Object.entries(dayDistribution)
      .filter(([day, count]) => count > maxSlotsPerDay * 0.8)
      .map(([day, count]) => ({ day, count }));

    if (overloadedDays.length > 0) {
      suggestions.push({
        type: 'info',
        message: `${overloadedDays.length} jour${overloadedDays.length > 1 ? 's' : ''} avec beaucoup de créneaux`,
        details: overloadedDays.map(d => `${d.day} (${d.count} créneaux)`).join(', ')
      });
    }

    // Vérifier les étudiants sans créneaux
    const studentsWithSlots = new Set(slots.map(s => s.student_id));
    const studentsWithoutSlots = students.filter(s => !studentsWithSlots.has(s.id));
    
    if (studentsWithoutSlots.length > 0) {
      suggestions.push({
        type: 'error',
        message: `${studentsWithoutSlots.length} étudiant${studentsWithoutSlots.length > 1 ? 's' : ''} sans créneaux`,
        details: studentsWithoutSlots.map(s => `${s.first_name} ${s.last_name}`).join(', ')
      });
    }

    return {
      totalSlots,
      totalStudents,
      totalProjects,
      totalHours,
      phaseDistribution,
      studentDistribution,
      hoursPerStudent,
      dayDistribution,
      suggestions
    };
  }, [slots, students, projects]);

  if (!analytics) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total créneaux</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSlots}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Étudiants</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projets</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Heures totales</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalHours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses retirés */}
    </div>
  );
};

export default PlanningAnalytics; 