import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home';
import About from './pages/About';

function App() {
  const pages = [
    { route: '/', title: 'Home', element: <Home /> },
    { route: '/about', title: 'About', element: <About /> },
  ];

  return (
    <BrowserRouter>
      <Navbar pages={pages}></Navbar>
    </BrowserRouter>
  );
}

export default App;
