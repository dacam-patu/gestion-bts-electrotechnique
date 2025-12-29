import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VisitesCalendarModal = ({ isOpen, onClose }) => {
  const [visites, setVisites] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllVisites();
    }
  }, [isOpen]);

  const loadAllVisites = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/visites-stage');
      setVisites(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement visites:', error);
      toast.error('Erreur lors du chargement des visites');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  // Générer les jours du mois
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Ajouter les jours vides du début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Obtenir les visites pour un jour donné
  const getVisitesForDay = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return visites.filter(visite => {
      if (!visite.date_visite) return false;
      try {
        const visiteDate = new Date(visite.date_visite);
        // Vérifier si la date est valide
        if (isNaN(visiteDate.getTime())) return false;
        const visiteDateStr = visiteDate.toISOString().split('T')[0];
        return visiteDateStr === dateStr;
      } catch (error) {
        return false;
      }
    });
  };

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (!isOpen) return null;

  const days = getDaysInMonth(currentMonth);
  const monthName = getMonthName(currentMonth);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span>Planning des Visites de Stage</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Navigation du mois */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold capitalize">{monthName}</h3>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* En-têtes des jours de la semaine */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayVisites = getVisitesForDay(day);
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] border border-gray-200 p-2 ${
                        day ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          
                          {/* Affichage des visites */}
                          <div className="space-y-1">
                            {dayVisites.slice(0, 3).map(visite => (
                              <div
                                key={visite.id}
                                className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate"
                                title={`${visite.nom_etudiant} - ${visite.heure || ''} - ${visite.lieu || ''}`}
                              >
                                <div className="font-medium truncate">{visite.nom_etudiant}</div>
                                {visite.heure && (
                                  <div className="flex items-center text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(visite.heure)}
                                  </div>
                                )}
                                {visite.lieu && (
                                  <div className="flex items-center text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">{visite.lieu}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {dayVisites.length > 3 && (
                              <div className="text-xs text-gray-500">
                                +{dayVisites.length - 3} autres
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Légende :</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                    <span>Visite planifiée</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
                    <span>Aujourd'hui</span>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {visites.filter(v => {
                      const visitDate = new Date(v.date_visite);
                      return visitDate.getMonth() === currentMonth.getMonth() && 
                             visitDate.getFullYear() === currentMonth.getFullYear();
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Visites ce mois</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {visites.filter(v => {
                      const visitDate = new Date(v.date_visite);
                      return visitDate >= new Date() && visitDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Visites cette semaine</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(visites.map(v => v.nom_etudiant)).size}
                  </div>
                  <div className="text-sm text-gray-600">Étudiants concernés</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitesCalendarModal;
