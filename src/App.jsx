import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import PerformanceMap from './components/PerformanceMap';
import RecentPerformances from './components/RecentPerformances';
import ArtistList from './components/ArtistList';
import UpdateData from './components/UpdateData';
import Statistics from './components/Statistics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="performance-map" element={<PerformanceMap />} />
          <Route path="recent-performances" element={<RecentPerformances />} />
          <Route path="artists" element={<ArtistList />} />
          <Route path="update-data" element={<UpdateData />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 