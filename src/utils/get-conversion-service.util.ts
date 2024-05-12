import { Converter } from '../services/converters/base';
import { GpxToMidiService } from '../services/converters/gpx-to-midi.service';
import { MidiToGpxService } from '../services/converters/midi-to-gpx.service';
import { ConversionType } from '../types';

export function getConversionService(convertType: ConversionType) {
  const conversionServiceMap = new Map<ConversionType, typeof Converter>([
    [ConversionType.GPX_TO_MIDI, GpxToMidiService],
    [ConversionType.MIDI_TO_GPX, MidiToGpxService],
  ]);
  const service = conversionServiceMap.get(convertType);
  if (!service) throw new Error(`Unsupported conversion type: ${convertType}`);
  return service;
}
