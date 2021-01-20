import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from 'request-ip';

export const ipAddressExtractor = (ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  if (req.clientIp) return req.clientIp;
  return requestIp.getClientIp(req);
};

export const IpAddress = createParamDecorator((data: unknown, ctx: ExecutionContext) => ipAddressExtractor(ctx));
