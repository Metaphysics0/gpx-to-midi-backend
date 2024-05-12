import {
  BasicPitch,
  noteFramesToTime,
  addPitchBendsToNoteEvents,
  outputToNotesPoly,
  NoteEventTime,
} from '@spotify/basic-pitch';
import { Midi } from '@tonejs/midi';
import { Converter } from './base';

export class AudioToMidiService extends Converter {
  async convert() {
    console.log(`AudioToMidi - Starting convert for ${this.inputFile.name}`);
    const fileBuffer = await this.getFileBuffer();
    const data = await this.getEvaluatedData(fileBuffer);
    const notes = this.getNotes(data);
    const midiFile = this.getConvertedFile(notes);
    console.log(
      `AudioToMidi - ✅ Succesfully converted ${this.inputFile.name}`
    );

    return {
      name: this.inputFile.name,
      file: Array.from(midiFile),
    };
  }

  private async getEvaluatedData(
    fileBuffer: ArrayBuffer
  ): Promise<EvaluatedData> {
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];

    await this.basicPitch.evaluateModel(
      Float32Array.from(new Uint8Array(fileBuffer)),
      (frame, onset, contour) => {
        frames.push(...frame);
        onsets.push(...onset);
        contours.push(...contour);
      },
      () => {}
    );

    return {
      frames,
      onsets,
      contours,
    };
  }

  private getNotes(data: EvaluatedData): NoteEventTime[] {
    return noteFramesToTime(
      addPitchBendsToNoteEvents(
        data.contours,
        outputToNotesPoly(data.frames, data.onsets, 0.25, 0.25, 5, true)
      )
    );
  }

  private getConvertedFile(notes: NoteEventTime[]) {
    const midi = new Midi();
    const track = midi.addTrack();
    notes.forEach((note) => {
      track.addNote({
        midi: note.pitchMidi,
        time: note.startTimeSeconds,
        duration: note.durationSeconds,
        velocity: note.amplitude,
      });
    });

    return midi.toArray();
  }

  private async getFileBuffer() {
    return this.inputFile.arrayBuffer();
  }

  private get basicPitch() {
    return new BasicPitch(process.env.BASIC_PITCH_MODEL_URL!);
  }
}

interface EvaluatedData {
  frames: number[][];
  onsets: number[][];
  contours: number[][];
}
