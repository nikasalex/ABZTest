import { faker } from '@faker-js/faker';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { userRepository } from '../repository/userRepository';
import { positionRepository } from '../repository/positionRepository';

function createFakeUser(photo: any) {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+380#########'),
    photo,
    position: Math.floor(Math.random() * 4 + 1),
  };
}

async function downloadImage() {
  const filename = faker.datatype.uuid() + '.jpg';
  return new Promise((resolve, reject) => {
    https.get(faker.image.people(70, 70), (res) => {
      const imageUrl = 'https://loremflickr.com';
      const dowlUrl = imageUrl + res.headers.location;
      https.get(dowlUrl, (res) => {
        const writeStream = fs.createWriteStream(
          path.join(__dirname, '../', 'upload', 'images', 'users', filename)
        );
        res.pipe(writeStream);
        res.on('end', () => {
          resolve(filename);
        });
      });
    });
  });
}

export async function createUser() {
  const user = createFakeUser(await downloadImage());
    const position = await positionRepository.findById(user.position);
    await userRepository.save({
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      position: position,
    });
  
}
