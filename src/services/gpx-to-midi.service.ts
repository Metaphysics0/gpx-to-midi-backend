import { HonoRequest } from 'hono';
import { readdir, unlink } from 'node:fs/promises';
import { ensureFileIsValid } from '../utils/ensure-file-is-valid.util';
import { throwUnknownServerError } from '../utils/responses.util';
import { appendCwdToPath } from '../utils/path.util';
import { ConvertedFileResponse } from '../types/responses.types';

export class GpxToMidiService {
  constructor(private readonly inputFile: File) {}

  async convert(): Promise<ConvertedFileResponse | undefined> {
    try {
      console.log(
        `GpxToMidi - Beginning convert for file: ${this.inputFile.name}`
      );

      const uploadPath = await this.writeFileToTempFolder();
      await this.executeConvertScript(uploadPath);

      const convertedFilePath = await this.getConvertedFilePath(uploadPath);
      const convertedFile = await Bun.file(convertedFilePath).arrayBuffer();

      console.log(
        `GpxToMidi - ✅ Succesfully converted file: ${this.inputFile.name}`
      );
      return {
        name: this.getFileNameParts(uploadPath).name,
        contents: Array.from(new Uint8Array(convertedFile)),
      };
    } catch (error: any) {
      console.error(
        `GpxToMidi - ❌ Failed converting file: ${this.inputFile.name}`
      );
      throw new Error(error);
    } finally {
      await this.removeAllFilesFromTempDirectory();
    }
  }

  private async executeConvertScript(pathToConvert: string) {
    try {
      const proc = Bun.spawn([this.pathToExecFunction, pathToConvert]);
      await new Response(proc.stdout).text();
    } catch (error) {
      console.error('error', error);
      throw new Error('error executing convert function');
    }
  }

  private async writeFileToTempFolder() {
    try {
      const uploadPath = `${this.pathToTempFolder}/${Date.now()}__${
        this.inputFile.name
      }`;
      await Bun.write(uploadPath, await this.inputFile.arrayBuffer());
      return uploadPath;
    } catch (error) {
      console.error('write to temp failed', error);
      throw new Error(
        `uploading initial file failed, unable to write to temp folder: ${error}`
      );
    }
  }

  private async getConvertedFilePath(uploadPath: string): Promise<string> {
    const { timestamp: uploadedFileTimestamp } =
      this.getFileNameParts(uploadPath);
    if (!uploadedFileTimestamp) {
      throw new Error('unable to find orignally uploaded file');
    }

    const dirCont = await this.getTempFolderDirectoryContents();
    const convertedFileName = dirCont.find((elm) =>
      elm.includes(uploadedFileTimestamp)
    );

    if (!convertedFileName) {
      throw new Error(
        `unable to find newly converted file, in directory ${
          this.pathToTempFolder
        }: ${JSON.stringify(dirCont)}`
      );
    }

    return this.pathToTempFolder + '/' + convertedFileName;
  }

  private getFileNameParts(filePath: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-unsafe-optional-chaining
      const [timestamp, fileName] = filePath.split('/')?.at(-1)?.split('__');
      return {
        name: fileName.split('.')[0],
        timestamp,
      };
    } catch (error) {
      throw new Error(`error getting file name parts: ${error}`);
    }
  }

  private async deleteFile(pathToFile: string) {
    await unlink(pathToFile);
  }

  private async removeAllFilesFromTempDirectory() {
    try {
      const tempFiles = await this.getTempFolderDirectoryContents();
      await Promise.all(
        tempFiles
          .map((fileName) => this.pathToTempFolder + '/' + fileName)
          .map(this.deleteFile)
      );
    } catch (error) {
      console.error('error cleaning temp directory', error);
    }
  }

  private async getTempFolderDirectoryContents() {
    return readdir(this.pathToTempFolder);
  }

  private get pathToTempFolder(): string {
    return appendCwdToPath(process.env.PATH_TO_TEMP_FOLDER || '/temp');
  }

  private get pathToExecFunction(): string {
    return appendCwdToPath(
      process.env.PATH_TO_EXECUTE_FUNCTION || '/scripts/script-osx'
    );
  }
}

export async function convertGpxToMidi(req: HonoRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  ensureFileIsValid(file);

  const midiFile = await new GpxToMidiService(file).convert();
  if (!midiFile) throwUnknownServerError('Unable to convert file');

  return {
    name: midiFile!.name,
    file: midiFile!.contents,
  };
}
