import React from 'react';

const ColorationLogo = ({ coloration, className = "h-16 w-16", showTitle = true }) => {
  // Fonction pour obtenir le logo correspondant à la coloration
  const getColorationLogo = (coloration) => {
    if (!coloration) return null;
    
    switch (coloration.toLowerCase()) {
      case 'ecole des reseaux':
      case 'école des réseaux':
        return '/logo-ecole-reseaux.png';
      case 'protendem':
        return '/logo-protendem.png';
      default:
        return null;
    }
  };

  const logoPath = getColorationLogo(coloration);
  
  if (!logoPath) return null;

  return (
    <img 
      src={logoPath} 
      alt={`Logo ${coloration}`}
      className={`object-contain ${className}`}
      title={showTitle ? coloration : undefined}
    />
  );
};

export default ColorationLogo;
