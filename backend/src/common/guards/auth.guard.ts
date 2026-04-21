import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('No authentication token provided');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request['user'] = payload;
            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractToken(request: Request): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader) return null;

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : null;
    }
}
