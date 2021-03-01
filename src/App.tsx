import React  from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import MainApp from './MainApp';


function App() {
  return (
    <BrowserRouter>
      <div className={'mx-auto max-w-screen-xl h-screen bg-gray-100'}>
        <div className={'text-2xl mx-4 py-2'}>
          Convert Tool
        </div>

        <MainApp/>

      </div>
    </BrowserRouter>
  );
}

export default App;
