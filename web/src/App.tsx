import React from 'react';
import './App.css';
import Routes from './routes'

import {ToastContainer} from 'react-toastify'

const App: React.FC = () => {
  return (
    <div>
      <ToastContainer 
        position='bottom-right'
        autoClose={5000}
        newestOnTop={true}
        closeOnClick={true}
        pauseOnHover={true}
      />
      <Routes />
    </div>
  );
}

export default App;