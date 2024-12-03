// src/App.js
import React from 'react';
import Layout from './components/Layout';
import PerformanceMap from './components/PerformanceMap.jsx';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

axios.defaults.withCredentials = true;

function App() {
  return (
    <Layout>
      <PerformanceMap />
    </Layout>
  );
}

export default App;