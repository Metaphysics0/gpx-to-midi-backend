import { Hono } from 'hono';
import { convertGpxToMidi } from '../services/gpx-to-midi.service';
import { throwUnknownServerError } from '../utils/responses.util';
import { SUPPORTED_CONVERT_OPTIONS } from '../constants';
import { convertMidiToGpx } from '../services/midi-to-gpx.service';
import { getConvertType } from '../utils/get-convert-type';

const convertController = new Hono();

convertController.post(
  `/:from{${SUPPORTED_CONVERT_OPTIONS.join(
    '|'
  )}}/:to{${SUPPORTED_CONVERT_OPTIONS.join('|')}}`,
  async (c) => {
    try {
      const { from, to } = c.req.param();
      const convertType = getConvertType({ from, to });
      if (convertType.gpxToMidi) {
        const convertedFileResponse = await convertGpxToMidi(c.req);
        return c.json(convertedFileResponse);
      }

      if (convertType.midiToGpx) {
        const convertedFileResponse = await convertMidiToGpx(c.req);
        return c.json(convertedFileResponse);
      }
    } catch (error) {
      console.error(`POST /convert api failed: ${JSON.stringify(error)}`);
      throwUnknownServerError('Unknown server error');
    }
  }
);

export { convertController };
