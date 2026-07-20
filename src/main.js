import './style.css';
import { SeekBookApp } from './app/SeekBookApp.js';

const root = document.querySelector('#app');
new SeekBookApp(root).init();
