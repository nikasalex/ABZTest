import { NextFunction, Request, Response } from 'express';
import { userRepository } from '../../repository/userRepository';
import { SchemaNewUser } from '../../component/user';
import { ZodError } from 'zod';
import { positionRepository } from '../../repository/positionRepository';
import tinify from 'tinify';
import { client } from '../../data_source';
import { v4 } from 'uuid';
import { off } from 'process';

tinify.key = process.env.TINY_KEY;

export class UserController {
  async getToken(req: Request, res: Response) {
    try {
      const token = v4();
      await client.set(token, token, { EX: 40 * 60 });
      return res.json({
        success: true,
        token: token,
      });
    } catch (e) {
      return res.status(500).json({ message: 'Server failed' });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (userId) {
        if (+userId % 1) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            fails: {
              user_id: ['The user_id must be an integer.'],
            },
          });
        }
        const user = await userRepository.findById(+userId);
        if (!user.length) {
          return res.status(404).json({
            success: false,
            message: 'The user with the requested identifier does not exist',
            fails: {
              user_id: ['User not found'],
            },
          });
        }
        const response = {
          success: true,
          user: {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            phone: user[0].phone,
            position: user[0].position.name,
            position_id: user[0].position.id,
            registration_timestamp: user[0].registration_timestamp,
            photo: user[0].photo,
          },
        };
        return res.send(response);
      }

      const page: number = +req.query.page || 1;
      const offset: number = +req.query.offset || 0;
      const count: number = +req.query.count || 5;
      switch (true) {
        case !!(count % 1) && !!(page % 1):
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              count: ['The count must be an integer.'],
              page: ['The page must be at least 1.'],
            },
          });
        case !!(count % 1):
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              count: ['The count must be an integer.'],
            },
          });
        case !!(page % 1):
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              page: ['The page must be at least 1.'],
            },
          });
      }
      let skip = page * count - count;
      if (offset !== 0) {
        skip = offset;
      }

      const recievedUsers = await userRepository.getUser(skip, count);
      const users = [];
      for (let elem of recievedUsers) {
        users.push({
          id: elem.id,
          name: elem.name,
          email: elem.email,
          phone: elem.phone,
          position: elem.position.name,
          position_id: elem.position.id,
          registration_timestamp: elem.registration_timestamp,
          photo: elem.photo,
        });
      }
      const allUsers = await userRepository.find();
      const total_users = allUsers.reduce((acc, elem) => {
        acc++;
        return acc;
      }, 0);
      if (!users.length) {
        return res.status(404).json({
          success: false,
          message: 'Page not found',
        });
      }

      const response = {
        success: true,
        page,
        total_pages: Math.ceil(total_users / count),
        total_users,
        count,
        users,
      };
      return res.send(response);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server failed' });
    }
  }

  async newUser(req: Request, res: Response, next: NextFunction) {
    try {
      // const {name} = req.body
      // await positionRepository.save({name})
      const emailRegexp =
        /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
      const phoneRegexp = /^[\+]{0,1}380([0-9]{9})$/;
      const token = req.headers.token;

      if (!token) {
        return res.status(404).json({
          success: false,
          message: 'You must have token',
        });
      }
      const checkToken = await client.get(token.toString());

      if (!checkToken) {
        return res.status(401).json({
          success: false,
          message: 'The token expired.',
        });
      }

      const fetchedUser = SchemaNewUser.parse(req.body);
      const { name, email, phone, position_id } = fetchedUser;
      const user = await userRepository.findByEmail(email);
      const userByPhone = await userRepository.findByPhone(phone);
      switch (true) {
        case position_id <= 0 || !!(position_id % 1) || !position_id:
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              position_id: ['The position id must be positive and an integer.'],
            },
          });
        case req.file?.size > 5e6:
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              photo: [
                'The photo may not be greater than 5 Mbytes.',
                'Image is invalid.',
              ],
            },
          });
        case !emailRegexp.test(email):
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              email: ['The email must be a valid email address.'],
            },
          });
        case !phoneRegexp.test(phone):
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: {
              phone: ['The phone field is required.'],
            },
          });
        case !!user:
          return res.status(409).json({
            success: false,
            message: 'User with this phone or email already exist',
          });
        case !!userByPhone:
          return res.status(409).json({
            success: false,
            message: 'User with this phone or email already exist',
          });
      }

      const position = await positionRepository.findById(position_id);
      if (!position) {
        return res.status(404).json({ message: 'Position not found' });
      }
      console.log(req.file);
      const pathImage = req.file.path;
      let source = tinify.fromFile(pathImage).resize({
        method: 'cover',
        width: 70,
        height: 70,
      });
      source.toFile(pathImage + '_optimize.jpg');

      const userSaved = await userRepository.save({
        name,
        email,
        phone,
        position: position,
        photo: pathImage + '_optimize.jpg',
      });
      await client.del(token);
      return res.json({
        success: true,
        user_id: userSaved.id,
        message: 'New user successfully registered',
      });
    } catch (e) {
      if (e instanceof ZodError) {
        if (e.issues[0].path[0] === 'name') {
          return res.status(422).json({
            success: false,
            message: 'Validation failed',
            fails: e.issues.reduce((acc, elem: any) => {
              const key = elem.path[0];
              const value = elem.message;
              acc[key] = [value];

              return { ...acc };
            }, {}),
          });
        }
        console.log(e.message);
        return res.status(404).json({ message: e });
      }
      console.log(e);
      return res.status(500).json({ message: 'Server failed' });
    }
  }

  async getPositions(req: Request, res: Response) {
    try {
      const positions = await positionRepository.find();
      const response = {
        success: true,
        positions,
      };

      if (!positions.length) {
        return res.status(422).json({
          success: false,
          message: 'Positions not found',
        });
      }

      return res.send(response);
    } catch (e) {
      return res.status(500).json({ message: 'Server failed' });
    }
  }
}
