// routes/dashboard.routes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStudentDashboard,getUniversityDashboard } from "../controllers/dashboard.controller.js";
import { getDashboard } from "../controllers/companyController.js"; // agregado
import {
  createWidget,
  listWidgets,
  getWidget,
  updateWidget,
  deleteWidget
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/', requireAuth, listWidgets);
router.post('/', requireAuth, createWidget);
router.get('/:id', requireAuth, getWidget);
router.put('/:id', requireAuth, updateWidget);
router.delete('/:id', requireAuth, deleteWidget);
router.get("/estudiante/:userId", getStudentDashboard);
router.get("/universidad/:userId", getUniversityDashboard);
router.get('/empresa/:empresaId', getDashboard); 


// Estas van al final para que /:id no capture las rutas anteriores
router.get('/:id', requireAuth, getWidget);
router.put('/:id', requireAuth, updateWidget);
router.delete('/:id', requireAuth, deleteWidget);


export default router;
