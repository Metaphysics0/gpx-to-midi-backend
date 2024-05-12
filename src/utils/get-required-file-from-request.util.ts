import { HonoRequest } from 'hono';
import { ensureFileIsValid } from './ensure-file-is-valid.util';

export async function getRequiredFileFromRequest(req: HonoRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  ensureFileIsValid(file);

  return file;
}
