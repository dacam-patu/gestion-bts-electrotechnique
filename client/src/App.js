import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SchoolYearProvider } from './contexts/SchoolYearContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Groups from './pages/Groups';
import Planning from './pages/Planning';
import Evaluations from './pages/Evaluations';
import EvaluationsU51New from './pages/EvaluationsU51New';
import EvaluationsU61 from './pages/EvaluationsU61';
import EvaluationsU62 from './pages/EvaluationsU62';
import EvaluationsU52 from './pages/EvaluationsU52';
import FicheTP from './pages/FicheTP';
import RapportStage from './pages/RapportStage';
import Entreprise from './pages/Entreprise';
import Referentiel from './pages/Referentiel';
import ReferentielPoles from './pages/ReferentielPoles';
import ReferentielActivites from './pages/ReferentielActivites';
import ReferentielTaches from './pages/ReferentielTaches';
import ReferentielCompetences from './pages/ReferentielCompetences';
import ReferentielCompetencesTaches from './pages/ReferentielCompetencesTaches';
import ReferentielUnites from './pages/ReferentielUnites';
import ReferentielContextes from './pages/ReferentielContextes';
import ReferentielDescriptionActivites from './pages/ReferentielDescriptionActivites';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Layout from './components/Layout';
import PlanFormationCreate from './pages/PlanFormationCreate';
import Loading from './components/Loading';

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Composant principal de l'application
const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="students" element={<Students />} />
        <Route path="classes" element={<Classes />} />
        <Route path="groups" element={<Groups />} />
        <Route path="planning" element={<Planning />} />
        <Route path="plan-formation/creer" element={<PlanFormationCreate />} />
        <Route path="evaluations" element={<EvaluationsU52 />} />
        <Route path="evaluations-u51" element={<EvaluationsU51New />} />
        <Route path="evaluations-u61" element={<EvaluationsU61 />} />
        <Route path="evaluations-u62" element={<EvaluationsU62 />} />
        <Route path="fiche-tp" element={<FicheTP />} />
        <Route path="referentiel" element={<Referentiel />} />
        <Route path="referentiel/description-activites" element={<ReferentielDescriptionActivites />} />
        <Route path="referentiel/poles" element={<ReferentielPoles />} />
        <Route path="referentiel/activites" element={<ReferentielActivites />} />
        <Route path="referentiel/taches" element={<ReferentielTaches />} />
        <Route path="referentiel/competences" element={<ReferentielCompetences />} />
        <Route path="referentiel/unites" element={<ReferentielUnites />} />
        <Route path="referentiel/competences-taches" element={<ReferentielCompetencesTaches />} />
        <Route path="referentiel/contextes" element={<ReferentielContextes />} />
        <Route path="rapport-stage" element={<RapportStage />} />
        <Route path="entreprise" element={<Entreprise />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
      </Route>
      {/* Page détachée (sans Layout) pour la fiche d'évaluation U52 */}
      <Route
        path="/evaluations/u52/standalone"
        element={
          <ProtectedRoute>
            <div className="p-4">
              <EvaluationsU52 />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Composant racine avec le provider d'authentification
const App = () => {
  return (
    <AuthProvider>
      <SchoolYearProvider>
        <AppContent />
      </SchoolYearProvider>
    </AuthProvider>
  );
};

export default App; 