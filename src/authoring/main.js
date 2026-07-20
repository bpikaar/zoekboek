import '../style.css';
import './authoring.css';
import { AuthoringApp } from './AuthoringApp.js';

const root = document.querySelector('#app');
new AuthoringApp(root).init();
