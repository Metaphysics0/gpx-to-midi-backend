import { Hono } from 'hono';
import { convertGuitarProFileToMidi } from '../services/gpx-to-midi.service';
import { throwUnknownServerError } from '../utils/responses.util';
import { CONVERT_OPTIONS, ConvertOptionsType } from '../constants';
import { convertMidiToGuitarPro } from '../services/midi-to-gpx.service';

const convertController = new Hono();

convertController.post(
  `/:from{${CONVERT_OPTIONS.join('|')}}/:to{${CONVERT_OPTIONS.join('|')}}`,
  async (c) => {
    try {
      const { from, to } = c.req.param();
      if (
        from === ConvertOptionsType.GUITAR_PRO &&
        to === ConvertOptionsType.MIDI
      ) {
        const convertedFileResponse = await convertGuitarProFileToMidi(c.req);
        return c.json(convertedFileResponse);
      }

      if (from === ConvertOptionsType.MIDI && ConvertOptionsType.GUITAR_PRO) {
        const convertedFileResponse = await convertMidiToGuitarPro(c.req);
        return c.json(convertedFileResponse);
      }
    } catch (error) {
      console.error(`POST /convert api failed: ${JSON.stringify(error)}`);
      throwUnknownServerError('Unknown server error');
    }
  }
);

export { convertController };
