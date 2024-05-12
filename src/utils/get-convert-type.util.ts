import { ConvertOptionsType } from '../constants';
import { ConversionType } from '../types';

export function getConvertType({
  from,
  to,
}: {
  from: string;
  to: string;
}): ConversionType {
  if (
    from === ConvertOptionsType.GUITAR_PRO &&
    to === ConvertOptionsType.MIDI
  ) {
    return ConversionType.GPX_TO_MIDI;
  }

  if (
    from === ConvertOptionsType.MIDI &&
    to === ConvertOptionsType.GUITAR_PRO
  ) {
    return ConversionType.MIDI_TO_GPX;
  }

  throw new Error('Converting the same type!');
}
