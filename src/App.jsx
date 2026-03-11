import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthGate from './Components/AuthGate';
import { ToastProvider } from './Components/Toast';
import Layout from './Layout';
import Dashboard from './Pages/Dashboard';
import Creds from './Pages/Creds';
import Settings from './Pages/Settings';

import './Styles/globalStyles.css';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/creds" element={<AuthGate><Creds /></AuthGate>} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
