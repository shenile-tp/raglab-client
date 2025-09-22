import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ChunksTab from './components/ChunksTab';
import RagConsole from './components/RagConsole';

// import Dashboard from './pages/Dashboard';
// import Analytics from './pages/Analytics';
// import Settings from './pages/Settings';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ChunksTab />} />
          
          <Route path="rag-console" element={<RagConsole />}/>
          {/* // <Route path="settings" element={<Settings />}  */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;