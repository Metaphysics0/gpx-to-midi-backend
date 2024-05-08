import { Hono } from 'hono';
import { GpxToMidiService } from '../services/gpx-to-midi.service';
import { throwUnknownServerError } from '../utils/responses.util';
import { ensureFileIsValid } from '../utils/ensure-file-is-valid.util';

const convertController = new Hono();

convertController.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    ensureFileIsValid(file);

    const midiFile = await new GpxToMidiService().convert(file);
    if (!midiFile) throwUnknownServerError('Unable to convert file');

    return c.json({
      name: midiFile!.name,
      file: midiFile!.contents,
    });
  } catch (error) {
    console.error(`POST /convert api failed: ${JSON.stringify(error)}`);
    throwUnknownServerError('Unknown server error');
  }
});

export { convertController };
