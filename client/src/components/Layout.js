import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SchoolYearSelector from './SchoolYearSelector';
import { 
  Home, 
  FolderOpen, 
  Users, 
  ClipboardList, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  User,
  Calendar,
  Shield,
  Settings,
  Building2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Building,
  Brain
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSubmenu = (menuName) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Fonction pour vérifier les permissions
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Fonction pour obtenir le titre de la page actuelle
  const getCurrentPageTitle = () => {
    const currentPath = window.location.pathname;
    const currentItem = navigation.find(item => {
      if (item.href === currentPath) return true;
      if (item.submenu) {
        return item.submenu.some(subItem => subItem.href === currentPath);
      }
      return false;
    });
    
    if (currentItem) {
      if (currentItem.href === currentPath) {
        return currentItem.name;
      }
      if (currentItem.submenu) {
        const subItem = currentItem.submenu.find(sub => sub.href === currentPath);
        return subItem ? subItem.name : currentItem.name;
      }
    }
    
    return 'GESTION BTS ELECTROTECHNIQUE';
  };

  // Navigation avec gestion des permissions
  const navigation = [
    { 
      name: 'Tableau de bord',
      href: '/dashboard', 
      icon: Home,
      permission: 'dashboard_view'
    },
    { 
      name: 'CONDUITE DE PROJET/CHANTIER', 
      icon: FolderOpen,
      permission: 'projects_view',
      submenu: [
        { 
          name: 'Projets/Chantiers', 
          href: '/projects', 
          permission: 'projects_view'
        },
        { 
          name: 'Gestion des groupes', 
          href: '/groups', 
          permission: 'students_view'
        },
        { 
          name: 'Planification', 
          href: '/planning', 
          permission: 'planning_view'
        }
      ]
    },
    { 
      name: 'Étudiants', 
      href: '/students', 
      icon: User,
      permission: 'students_view'
    },
    { 
      name: 'Classes', 
      href: '/classes', 
      icon: Users,
      permission: 'students_view'
    },
    { 
      name: 'Evaluations', 
      icon: ClipboardList,
      permission: 'evaluations_view',
      submenu: [
        { 
          name: 'U51 Analyse - Diagnostic - Maintenance', 
          href: '/evaluations-u51', 
          permission: 'evaluations_view'
        },
        { 
          name: 'U52 Conduite de chantier', 
          href: '/evaluations', 
          permission: 'evaluations_view'
        },
        { 
          name: 'U61 - Conception et étude détaillée', 
          href: '/evaluations-u61', 
          permission: 'evaluations_view'
        },
        { 
          name: 'U62 - Réalisation et mise en service', 
          href: '/evaluations-u62', 
          permission: 'evaluations_view'
        }
      ]
    },
    { 
      name: 'Fiche TP', 
      href: '/fiche-tp', 
      icon: BookOpen,
      permission: 'documents_view'
    },
    { 
      name: 'Documents', 
      href: '/documents', 
      icon: FileText,
      permission: 'documents_view'
    },
    { 
      name: 'Stage en entreprise', 
      href: '/rapport-stage', 
      icon: FileText,
      permission: 'documents_view'
    },
    { 
      name: 'Entreprise', 
      href: '/entreprise', 
      icon: Building2,
      permission: 'documents_view'
    },
    { 
      name: 'Neurosciences', 
      href: '/neurosciences', 
      icon: Brain,
      permission: 'documents_view'
    },
    // Pages d'administration (seulement pour admin)
    ...(user?.role === 'admin' ? [
      { 
        name: 'Utilisateurs', 
        href: '/users', 
        icon: Users,
        permission: 'users_view'
      },
      { 
        name: 'Rôles', 
        href: '/roles', 
        icon: Shield,
        permission: 'roles_view'
      }
    ] : [])
  ].filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-lg font-semibold text-gray-900">GESTION BTS ELECTROTECHNIQUE</span>
            </div>
            
            {/* Navigation mobile */}
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className="group flex items-center justify-between w-full px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-4 h-6 w-6" />
                          {item.name}
                        </div>
                        {openSubmenus[item.name] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {openSubmenus[item.name] && (
                        <div className="ml-6 space-y-1">
                          {item.submenu.map((subItem) => (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={({ isActive }) =>
                                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                  isActive
                                    ? 'bg-primary-100 text-primary-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* User info mobile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username
                  }
                </p>
                <p className="text-sm font-medium text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'Administrateur' : 
                   user?.role === 'teacher' ? 'Professeur' : 
                   user?.role === 'student' ? 'Étudiant' : user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-lg font-semibold text-gray-900">GESTION BTS ELECTROTECHNIQUE</span>
            </div>
            
            {/* Navigation desktop */}
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className="group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        {openSubmenus[item.name] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {openSubmenus[item.name] && (
                        <div className="ml-6 space-y-1">
                          {item.submenu.map((subItem) => (
                            <NavLink
                              key={subItem.name}
                              to={subItem.href}
                              className={({ isActive }) =>
                                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                  isActive
                                    ? 'bg-primary-100 text-primary-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                              }
                            >
                              {subItem.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* User info desktop */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username
                  }
                </p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {user?.role === 'admin' ? 'Administrateur' : 
                   user?.role === 'teacher' ? 'Professeur' : 
                   user?.role === 'student' ? 'Étudiant' : user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Settings className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Rechercher..."
                    type="search"
                    name="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <button
                onClick={handleLogout}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 lg:hidden"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Header avec sélecteur d'année scolaire */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {getCurrentPageTitle()}
              </h1>
            </div>
            <SchoolYearSelector />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 