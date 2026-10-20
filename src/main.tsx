import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container =
  document.getElementById('serpgpt-workbench-root') || document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
