

// Import Bootstrap JS
import * as bootstrap from 'bootstrap';
import './custom.js';
import { loadAdminDashboard, loadInventory } from './admin-api.js';


// Import SCSS
import '../scss/style.scss';

loadAdminDashboard();
loadInventory();
