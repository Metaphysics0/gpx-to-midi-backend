import { ConvertedFileResponse } from '../../types/responses.types';

export class Converter {
  constructor(protected readonly inputFile: File) {}

  async convert(): Promise<ConvertedFileResponse> {
    throw new Error('Not implemented');
  }
}
