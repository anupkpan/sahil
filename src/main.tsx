import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("main.tsx: Rendering App...");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
