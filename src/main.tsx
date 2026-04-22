import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';

// Thème PrimeReact de base (surchargé par nos variables CSS dans themes.css)
import 'primereact/resources/themes/lara-dark-amber/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import './styles/tokens.css';
import './styles/themes.css';
import './styles/globals.css';

import App from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Élément #root introuvable dans index.html');

createRoot(root).render(
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
);
