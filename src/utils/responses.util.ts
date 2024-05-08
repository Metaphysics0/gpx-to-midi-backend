import { HTTPException } from 'hono/http-exception';

export function throwUnknownServerError(message: string) {
  throw new HTTPException(500, { message });
}

export function throwInvalidParamError(message: string) {
  throw new HTTPException(422, { message });
}

export function throwNotSupportedMediaTypeParam(message: string) {
  throw new HTTPException(415, { message });
}
