import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Clock from './Components/Clock';
import './Styles/Dashboard.css'; // Reuse dashboard styles for main layout

const Layout = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    <div className="dashboard">
      <Clock />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            {element}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
