import { HttpInterceptorFn } from '@angular/common/http';

export const postRequestInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST' && req.body && typeof req.body === 'object') {
    const encodedBody = new URLSearchParams();
    for (const key of Object.keys(req.body)) {
      encodedBody.set(key, (req.body as Record<string, string>)[key]);
    }

    const modifiedReq = req.clone({
      headers: req.headers.set(
        'Content-Type',
        'application/x-www-form-urlencoded'
      ),
      body: encodedBody.toString(),
    });

    return next(modifiedReq);
  }

  return next(req);
};
