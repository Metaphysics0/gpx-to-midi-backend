import { AudioToMidiService } from './audio-to-midi.service';
import { Converter } from './base';
import { MidiToGpxService } from './midi-to-gpx.service';

export class AudioToGpxService extends Converter {
  async convert() {
    console.log(`AudioToGpx - Starting convert for ${this.inputFile.name}`);
    const midiFile = await this.getMidi();
    return this.getGpx(midiFile.file);
  }

  private async getMidi() {
    const service = new AudioToMidiService(this.inputFile);
    return service.convert();
  }

  private async getGpx(midiFile: number[]) {
    const blob = new Blob([new Uint8Array(midiFile).buffer], {
      type: 'audio/midi',
    });
    const file = new File([blob], this.inputFile.name);
    const service = new MidiToGpxService(file);
    return service.convert();
  }
}
