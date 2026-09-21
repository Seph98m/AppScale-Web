const express = require('express');
const router = express.Router();
const { getUsers, createUsers, updateUser, updateUserStatus, getUserStats, archiveUser, restoreUser } = require('../controllers/userControllers');

router.get('/', getUsers);
router.post('/', createUsers);
router.put('/:user_id', updateUser);
router.patch('/:user_id/status', updateUserStatus);
router.patch('/:user_id/archive', archiveUser);
router.patch('/:user_id/restore', restoreUser);
router.get('/stats', getUserStats);

module.exports = router;