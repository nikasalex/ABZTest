import { DataSource } from 'typeorm';
import path from 'path'
import multer from 'multer';
import { createClient } from 'redis';





const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, 'upload'))
    },
    filename:(req, file, cb)=>{
       
        cb(null, file.originalname)
    }
})


export const client = createClient()
export const upload = multer({storage: storage})

const x = path.join( __dirname, 'entity', '*.{js,ts}' )

const DB_TYPE: any = process.env.DB_TYPE || 'mysql';

export const AppDataSource = new DataSource({
  type: DB_TYPE,
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [x],
  synchronize: true,
});
