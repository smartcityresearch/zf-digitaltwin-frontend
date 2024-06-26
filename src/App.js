import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import VisualizationPage from './pages/VisualizationPage/VisualizationPage';
import SimulationPage from './pages/SimulationPage/SimulationPage';
import ActuationPage from './pages/ActuationPage/ActuationPage';
import SimulationScenario1 from './pages/SimulationPage/SimulationScenario1';
// import DemoPage from './pages/DemoSim/DemoPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/visualization" element={<VisualizationPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/actuation" element={<ActuationPage />} />
        {/* <Route path="/demo" element={<DemoPage />} /> */}
        <Route path="/simulation/scenario1" element={<SimulationScenario1 />} />

      </Routes>
    </Router>
  );
}

export default App;
