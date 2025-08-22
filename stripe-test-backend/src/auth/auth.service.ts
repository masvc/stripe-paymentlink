import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService,
  ) {}

  async register(email: string, password: string) {
    // 既存ユーザーの確認
    const existingUser = await this.databaseService.getQuery(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーの作成
    const result = await this.databaseService.runQuery(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
    );

    // 作成されたユーザーを取得
    const newUser = await this.databaseService.getQuery(
      'SELECT id, email FROM users WHERE email = ?',
      [email],
    );

    // JWTトークンを生成
    const payload = { email: newUser.email, sub: newUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: newUser.id, email: newUser.email },
    };
  }

  async login(email: string, password: string) {
    const user = await this.databaseService.getQuery(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email },
    };
  }

  async validateUser(userId: number) {
    return await this.databaseService.getQuery(
      'SELECT id, email FROM users WHERE id = ?',
      [userId],
    );
  }
}
