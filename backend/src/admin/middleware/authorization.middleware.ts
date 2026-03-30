// src/admin/middleware/admin-auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            if (decoded.role !== 'admin') {
                throw new ForbiddenException('Access denied: You are not an admin');
            }

            // 3. Attach user to request for use in controllers
            req['user'] = decoded;
            next();
        } catch (error) {
            console.log(error)
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}