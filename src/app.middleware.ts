import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log('MIDDLE WARE REQ :: ', req);
    // Check if the route matches the pattern 'api/v1'
    if (req.originalUrl.startsWith('/api/v1')) {
      // Append the custom header to the response
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    next();
  }
}
