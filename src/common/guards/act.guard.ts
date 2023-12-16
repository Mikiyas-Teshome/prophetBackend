import { AuthGuard } from '@nestjs/passport';

export class ActGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
