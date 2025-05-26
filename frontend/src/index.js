import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import WrappedChooser from './Chooser';
import { BlockchainProvider } from "./contexts/BlockchainContext";
import reportWebVitals from './reportWebVitals';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById("root"));

// Decide which root component to render based on the URL
const isChooser = window.location.pathname.startsWith("/chooser");
const RootComponent = isChooser ? WrappedChooser : App;

root.render(
  <React.StrictMode>
    <BlockchainProvider>
      <RootComponent />
    </BlockchainProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
