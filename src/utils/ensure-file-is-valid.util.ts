import { SUPPORTED_FILE_TYPES } from '../constants';
import {
  throwInvalidParamError,
  throwNotSupportedMediaTypeParam,
} from './responses.util';

export function ensureFileIsValid(file: File): void {
  if (!(file as File).name || (file as File).name === 'undefined') {
    throwInvalidParamError('You must provide a file to upload');
  }

  const fileExtension = file.name.split('.').at(-1);
  if (!fileExtension) {
    throwInvalidParamError('Please include a valid file extension in the file');
  }

  if (!SUPPORTED_FILE_TYPES.includes(fileExtension!)) {
    throwNotSupportedMediaTypeParam('Not supported file type');
  }
}
