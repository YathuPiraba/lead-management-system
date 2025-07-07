import { Injectable } from '@nestjs/common';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class AuthService {
  constructor(private jwtTokenService: JwtTokenService) {}
}
