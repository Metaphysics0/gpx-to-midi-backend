import { ConvertedFileResponse } from '../../types/responses.types';
// @ts-ignore
import { Converter } from './base';
import { generateFileData } from '@spotify/basic-pitch';

export class AudioToMidiService extends Converter {
  convert(): Promise<ConvertedFileResponse> {}

  async test() {}
}
