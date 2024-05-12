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

  if (from === ConvertOptionsType.AUDIO && to === ConvertOptionsType.MIDI) {
    return ConversionType.AUDIO_TO_MIDI;
  }

  throw new Error(`${from} to ${to} conversion type not supported!`);
}
