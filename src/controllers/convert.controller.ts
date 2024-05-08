import { Hono } from 'hono';
import { ExecuteScriptService } from '../services/executeScript.service';
import { SUPPORTED_FILE_TYPES } from '../constants';
import {
  throwInvalidParamError,
  throwNotSupportedMediaTypeParam,
  throwUnknownServerError,
} from '../utils/responses.util';

const convertController = new Hono();

convertController.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    ensureFileIsValid(file);

    const service = new ExecuteScriptService();

    const midiFile = await service.writeFileAndConvert(file);
    if (!midiFile) {
      throwUnknownServerError('Unable to convert file');
    }

    return c.json({
      name: midiFile!.name,
      file: Array.from(new Uint8Array(midiFile!.contents)),
    });
  } catch (error) {
    console.error('error: ', error);
    throwUnknownServerError('Unknown server error');
  }
});

function ensureFileIsValid(file: File): void {
  if (!(file as File).name || (file as File).name === 'undefined') {
    throwInvalidParamError('You must provide a file to upload');
  }

  if (!SUPPORTED_FILE_TYPES.includes(file.name)) {
    throwNotSupportedMediaTypeParam('Not supported file type');
  }
}

export { convertController };
