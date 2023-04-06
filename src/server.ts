import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { AppDataSource } from './data_source';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import http from 'http';
import cors from 'cors';
import { router } from './rest/routes/users';

const PORT = process.env.PORT ?? 3000;

const app = express();
const server = http.createServer(app);






app.use(cors({ credentials: true, origin: `http://localhost:3000` }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router)





AppDataSource.initialize()
  .then(() => {
    console.log('Databse has been initialized');
    server.listen(PORT, () => {
      console.log(`Server has been stated on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Error`, err);
  });