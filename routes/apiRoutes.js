const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const dashboardController = require('../controllers/dashboardController');
const calculatorController = require('../controllers/calculatorController');
const colorController = require('../controllers/colorController');
const recipeController = require('../controllers/recipeController');
const inventoryController = require('../controllers/inventoryController');
const machineController = require('../controllers/machineController');
const orderController = require('../controllers/orderController');
const productionController = require('../controllers/productionController');
const reportController = require('../controllers/reportController');
const demoController = require('../controllers/demoController');

// Public seeder endpoint for demo environment resets
router.get('/demo/seed', demoController.seedDatabase);
router.post('/demo/seed', demoController.seedDatabase);

// All API endpoints require JWT authentication
router.use(authenticateJWT);

// Dashboard stats
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Calculators
router.post('/calculate/fabric', calculatorController.calculateFabricWeight);
router.post('/calculate/chemical', calculatorController.calculateChemicalRequirement);

// Color Matching
router.get('/colors', colorController.getColorList);
router.get('/colors/match', colorController.getColorMatchingDetails);

// Recipe Management
router.get('/recipes', recipeController.getAllRecipes);
router.post('/recipes', authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), recipeController.createRecipe);
router.put('/recipes/:id', authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), recipeController.updateRecipe);
router.post('/recipes/:id/clone', authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), recipeController.cloneRecipe);
router.delete('/recipes/:id', authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), recipeController.deleteRecipe);

// Inventory Management
router.get('/inventory', inventoryController.getInventoryData);
router.post('/inventory', authorizeRoles('Super Admin', 'Factory Manager', 'Inventory Manager'), inventoryController.addInventoryItem);
router.patch('/inventory/:id/adjust', authorizeRoles('Super Admin', 'Factory Manager', 'Inventory Manager', 'Production Supervisor'), inventoryController.adjustStock);
router.delete('/inventory/:id', authorizeRoles('Super Admin', 'Factory Manager', 'Inventory Manager'), inventoryController.deleteInventoryItem);

// Suppliers
router.get('/suppliers', inventoryController.getAllSuppliers);
router.post('/suppliers', authorizeRoles('Super Admin', 'Factory Manager', 'Inventory Manager'), inventoryController.addSupplier);

// Machine Management
router.get('/machines', machineController.getMachines);
router.post('/machines', authorizeRoles('Super Admin', 'Factory Manager'), machineController.addMachine);
router.patch('/machines/:id/status', machineController.updateMachineStatus);
router.delete('/machines/:id', authorizeRoles('Super Admin', 'Factory Manager'), machineController.deleteMachine);

// Order Management
router.get('/orders', orderController.getAllOrders);
router.post('/orders', authorizeRoles('Super Admin', 'Factory Manager', 'Customer'), orderController.createOrder);
router.put('/orders/:id', authorizeRoles('Super Admin', 'Factory Manager'), orderController.updateOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);
router.delete('/orders/:id', authorizeRoles('Super Admin', 'Factory Manager'), orderController.deleteOrder);

// Production Tracking
router.get('/batches', productionController.getAllBatches);
router.post('/batches', authorizeRoles('Super Admin', 'Factory Manager', 'Production Supervisor'), productionController.createBatch);
router.patch('/batches/:id/status', productionController.updateBatchStatus);
router.delete('/batches/:id', authorizeRoles('Super Admin', 'Factory Manager'), productionController.deleteBatch);

// Reports Module
router.get('/reports', reportController.getReportsData);

module.exports = router;
