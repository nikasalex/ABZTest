import { AppDataSource } from "../data_source"; 
import { Position } from "../entity/position";
export const positionRepository = AppDataSource.getRepository(Position).extend({
    findById(id:number){
        return this.findOneBy({id})
    }
})