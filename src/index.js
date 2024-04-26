import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Container } from 'reactstrap';

ReactDOM.render(
  <React.StrictMode>
    <Container fluid className="p-0">
      <App />
    </Container>
  </React.StrictMode>,
  document.getElementById('root')
);
