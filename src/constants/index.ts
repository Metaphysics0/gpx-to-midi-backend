export const SUPPORTED_GUITAR_PRO_FILE_TYPES = [
  'gp',
  'gp4',
  'gp5',
  'gp6',
  'gp7',
];

export const SUPPORTED_MIDI_FILE_TYPES = ['mid', 'midi'];

export const SUPPORTED_AUDIO_TYPES = ['mp3', 'wav', 'mp4', 'm4a'];

export enum ConvertOptionsType {
  GUITAR_PRO = 'gp',
  MIDI = 'midi',
  AUDIO = 'audio',
}
export const SUPPORTED_CONVERT_OPTIONS = Object.values(ConvertOptionsType);
