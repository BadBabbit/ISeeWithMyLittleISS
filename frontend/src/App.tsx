import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Banner from './components/Banner/Banner'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home';
import About from './pages/About';
import { RoutingProvider } from './contexts/RoutingContext';

function App() {
  return (
    <BrowserRouter>
      <RoutingProvider>
        <Banner />
      </RoutingProvider>
    </BrowserRouter>
  );
}

export default App;
