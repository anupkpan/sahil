import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Removed alert and console.log for better debugging
// alert("main.tsx loaded");  <-- No longer necessary
console.log("main.tsx: Rendering App...");

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>  <-- REMOVED React.StrictMode
  <App />
  // </React.StrictMode>
);
