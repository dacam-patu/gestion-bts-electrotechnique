const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPlanning() {
  try {
    console.log('🧪 Test du module de planification...');

    // 1. Récupérer les étudiants disponibles
    console.log('\n📊 Récupération des étudiants...');
    const studentsRes = await axios.get(`${API_BASE}/students`);
    const students = studentsRes.data.data;
    console.log(`✅ ${students.length} étudiants trouvés`);

    if (students.length === 0) {
      console.log('❌ Aucun étudiant trouvé. Veuillez d\'abord créer des étudiants.');
      return;
    }

    // 2. Créer quelques créneaux de test
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const testSlots = [
      {
        student_id: students[0].id,
        project_id: null,
        phase: 1,
        phase_name: 'Planification',
        start_date: today.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        location: 'Salle A101',
        notes: 'Créneau de test - Phase 1',
        status: 'scheduled'
      },
      {
        student_id: students[Math.min(1, students.length - 1)].id,
        project_id: null,
        phase: 2,
        phase_name: 'Pilotage',
        start_date: today.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        start_time: '11:00',
        end_time: '12:00',
        location: 'Atelier B',
        notes: 'Créneau de test - Phase 2',
        status: 'scheduled'
      },
      {
        student_id: students[Math.min(2, students.length - 1)].id,
        project_id: null,
        phase: 3,
        phase_name: 'Soutenance',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: tomorrow.toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '15:00',
        location: 'Amphithéâtre',
        notes: 'Créneau de test - Phase 3',
        status: 'scheduled'
      }
    ];

    console.log('\n📅 Création des créneaux de test...');
    for (let i = 0; i < testSlots.length; i++) {
      const slot = testSlots[i];
      try {
        const response = await axios.post(`${API_BASE}/planning`, slot);
        if (response.data.success) {
          console.log(`✅ Créneau ${i + 1} créé: Phase ${slot.phase} pour ${students.find(s => s.id === slot.student_id)?.first_name}`);
        }
      } catch (error) {
        console.error(`❌ Erreur création créneau ${i + 1}:`, error.response?.data?.message || error.message);
      }
    }

    // 3. Vérifier les créneaux créés
    console.log('\n🔍 Vérification des créneaux créés...');
    const slotsRes = await axios.get(`${API_BASE}/planning`);
    const slots = slotsRes.data.data;
    console.log(`✅ ${slots.length} créneaux trouvés dans la base`);

    slots.forEach(slot => {
      console.log(`  • Phase ${slot.phase}: ${slot.first_name} ${slot.last_name} - ${slot.start_date} ${slot.start_time || 'pas d\'heure'}`);
    });

    // 4. Statistiques
    console.log('\n📈 Statistiques...');
    const statsRes = await axios.get(`${API_BASE}/planning/stats`);
    const stats = statsRes.data.data;
    console.log('✅ Statistiques par phase:');
    stats.forEach(stat => {
      console.log(`  • Phase ${stat.phase} (${stat.phase_name}): ${stat.total_slots} créneaux`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📋 Détails:', error.response.data);
    }
  }
}

// Attendre un peu que le serveur démarre
setTimeout(testPlanning, 3000);