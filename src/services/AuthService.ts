import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUser } from '../domain/entities/IUser.js';
import { ApplicationRepositories } from '../db/init-repositories.js';
import { IUserRepository } from '../domain/repositories/IUserRepository.js';
import { AuthenticationError, ConflictError } from '../utils/errors.js';

const JWT_EXPIRATION_TIME = 360000;
const INVALID_CREDS_MESSAGE = 'Invalid credentials';
type JwtPayload = Pick<IUser, 'email' | 'id'>;

export class AuthService {
  userRepo: IUserRepository;
  secret: string;

  constructor({ UserRepository }: ApplicationRepositories) {
    this.userRepo = UserRepository;
    this.secret = process.env.JWT_SECRET!;
  }

  private async encryptPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  private generateToken(payload: JwtPayload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: JWT_EXPIRATION_TIME
    });
  }

  verifyJwt(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }

  async login(email: string, password: string): Promise<string> {
    const user = (await this.userRepo.select({ email }))[0];

    if (!user) {
      throw new AuthenticationError(INVALID_CREDS_MESSAGE);
    }

    const valid = await this.comparePasswords(password, user.password);
    if (!valid) {
      throw new AuthenticationError(INVALID_CREDS_MESSAGE);
    }

    const token = this.generateToken({
      email: user.email,
      id: user.id
    });

    return token;
  }

  async register(email: string, password: string): Promise<string> {
    const existing = await this.userRepo.select({ email });
    if (existing?.length > 0) {
      throw new ConflictError('User already exists');
    }
    const hashedPassword = await this.encryptPassword(password);
    const newId = await this.userRepo.insert(email, hashedPassword);
    const token = this.generateToken({
      email: email,
      id: newId
    });

    return token;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async revoke(email: string) {
    throw new Error('Unimplemented');
  }
}
