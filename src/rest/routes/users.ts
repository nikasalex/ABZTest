import {  Router } from 'express';
import { UserController } from '../controller/userController';
import { upload } from '../../data_source';
export const router = Router();

const userController = new UserController();

router.get('/users', userController.listUsers);
router.get('/token', userController.getToken);
router.get('/users/:id', userController.getUser);
router.get('/positions', userController.getPositions);
router.post('/users', upload.single('photo'), userController.newUser);
