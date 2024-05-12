import { Fetcher } from '../../utils/fetcher.util';
import { ConvertedFileResponse } from '../../types/responses.types';
import { Converter } from './base';

export class MidiToGpxService extends Converter {
  async convert(): Promise<ConvertedFileResponse> {
    try {
      console.log(
        `MidiToGpx - Beginning convert for file: ${this.inputFile.name}`
      );
      await this.prepareConvert();
      const convertedFile = await this.executeConvert();

      console.log(
        `MidiToGpx - ✅ Succesfully converted file: ${this.inputFile.name}`
      );

      return {
        name: this.inputFile.name,
        file: Array.from(new Uint8Array(convertedFile)),
      };
    } catch (error: any) {
      console.error(
        `MidiToGpx - ❌ Failed converting file: ${this.inputFile.name}`
      );
      throw new Error(error);
    }
  }

  private async executeConvert() {
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

      return response.arrayBuffer();
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
