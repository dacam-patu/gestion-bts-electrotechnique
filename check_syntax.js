const fs = require('fs');
const babel = require('@babel/parser');

try {
  const code = fs.readFileSync('./client/src/pages/EvaluationsU51.js', 'utf8');
  const ast = babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('✅ Le fichier EvaluationsU51.js a une syntaxe valide');
} catch (error) {
  console.error('❌ Erreur de syntaxe dans EvaluationsU51.js:');
  console.error(error.message);
  console.error(`Ligne: ${error.loc ? error.loc.line : 'inconnue'}`);
  console.error(`Colonne: ${error.loc ? error.loc.column : 'inconnue'}`);
}

