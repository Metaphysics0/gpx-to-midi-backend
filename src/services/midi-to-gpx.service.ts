import { HonoRequest } from 'hono';
import { Fetcher } from '../utils/fetcher.util';
import { ensureFileIsValid } from '../utils/ensure-file-is-valid.util';
import { throwUnknownServerError } from '../utils/responses.util';
import { ConvertedFileResponse } from '../types/responses.types';
export class MidiToGpxService {
  constructor(private readonly inputFile: File) {}

  async convert(): Promise<ConvertedFileResponse | undefined> {
    await this.prepareConvert();
    return this.executeConvert();
  }

  private async executeConvert(): Promise<ConvertedFileResponse | undefined> {
    try {
      const response = await fetch(
        process.env.MIDI_TO_GPX_EXECUTE_CONVERT_URL! +
          `?g=${this.inputFile.name.split('.').at(0)}`,
        {
          headers: new Fetcher().headersForExecuteConvert,
          referrer: process.env.MIDI_TO_GPX_EXECUTE_CONVERT_URL,
          referrerPolicy: 'strict-origin-when-cross-origin',
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
        }
      );

      const responseData = await response.arrayBuffer();

      return {
        name: this.inputFile.name,
        contents: Array.from(new Uint8Array(responseData)),
      };
    } catch (error) {
      console.error('MidiToGpx - executeConvert failed', error);
      throw new Error('Error converting file');
    }
  }

  private async prepareConvert() {
    try {
      const formData = new FormData();

      formData.append('upload', this.inputFile, this.inputFile.name);
      formData.append('transpose', '0');
      formData.append('MAX_FILE_SIZE', '124288');

      await fetch(process.env.MIDI_TO_GPX_PREPARE_CONVERT_URL!, {
        headers: new Fetcher().headersWithFormDataContentType,
        referrer: process.env.MIDI_TO_GPX_PREPARE_CONVERT_URL,
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: formData,
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
      });
    } catch (error) {
      console.error('MidiToGpx - Error preparing convert', error);
      throw new Error('Unable to prepare convert file');
    }
  }
}

export async function convertMidiToGpx(req: HonoRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  ensureFileIsValid(file);

  const midiFile = await new MidiToGpxService(file).convert();
  if (!midiFile) throwUnknownServerError('Unable to convert file');

  return {
    name: midiFile!.name,
    file: midiFile!.contents,
  };
}
