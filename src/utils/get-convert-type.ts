import { ConvertOptionsType, SUPPORTED_CONVERT_OPTIONS } from '../constants';
import { throwInvalidParamError } from './responses.util';

interface ConvertType {
  gpxToMidi: boolean;
  midiToGpx: boolean;
}

export function getConvertType({
  from,
  to,
}: {
  from: string;
  to: string;
}): ConvertType {
  if (
    from === ConvertOptionsType.GUITAR_PRO &&
    to === ConvertOptionsType.MIDI
  ) {
    return {
      gpxToMidi: true,
      midiToGpx: false,
    };
  }

  if (
    from === ConvertOptionsType.MIDI &&
    to === ConvertOptionsType.GUITAR_PRO
  ) {
    return {
      gpxToMidi: true,
      midiToGpx: false,
    };
  }

  return {
    gpxToMidi: false,
    midiToGpx: false,
  };
}

export function ensureValidConvertType({
  from,
  to,
}: {
  from: string;
  to: string;
}): boolean {
  if (!(from in ConvertOptionsType)) {
    throwInvalidParamError(`from type: ${from} is not supported`);
  }

  if (!(to in ConvertOptionsType)) {
    throwInvalidParamError(`to type: ${to} is not supported`);
  }
  return true;
}
