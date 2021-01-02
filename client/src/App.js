import './App.css';
import React, { Fragment } from 'react';
import Navbar from './components/layout/Navbar.js';
import Landing from './components/layout/Landing.js';

const App = () => (
  <Fragment>
    <Navbar />
    <Landing />
  </Fragment>
);

export default App;
