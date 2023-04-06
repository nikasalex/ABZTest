import { AppDataSource } from '../data_source';
import { User } from '../entity/user';

export const userRepository = AppDataSource.getRepository(User).extend({
  findByEmail(email: string) {
    return this.findOneBy({ email });
  },

  findById(id: number) {
    return this.find({
      relations: {
        position: true,
      },
      where: { id },
    });
  },

  findByPhone(phone: string) {
    return this.findOneBy({ phone });
  },

  getUser(skip: number, take: number) {
    return this.find({
      relations: {
        position: true,
      },
      skip,
      take,
    });
  },
});
