import { readdir, unlink } from 'node:fs/promises';

export class ExecuteScriptService {
  async writeFileAndConvert(
    file: File
  ): Promise<{ contents: ArrayBuffer; name: string } | undefined> {
    try {
      console.log(`Beginning upload for file: ${file.name}`);

      const uploadPath = await this.writeFileToTempFolder(file);

      await this.executeConvert(uploadPath);
      await this.deleteFile(uploadPath);

      const convertedFilePath = await this.getConvertedFilePath(uploadPath);
      const convertedFile = await Bun.file(convertedFilePath).arrayBuffer();

      await this.deleteFile(convertedFilePath);

      return {
        name: this.getFileNameParts(uploadPath).name,
        contents: convertedFile,
      };
    } catch (error) {
      await this.cleanTempDirectory();
    }
  }

  private async executeConvert(pathToConvert: string) {
    const proc = Bun.spawn([this.pathToExecFunction, pathToConvert]);

    try {
      await new Response(proc.stdout).text();
    } catch (error) {
      console.error('error', error);
      throw new Error('error executing convert function');
    }
  }

  private async writeFileToTempFolder(file: File) {
    const uploadPath = `${this.pathToTempFolder}/${Date.now()}__${file.name}`;
    try {
      await Bun.write(uploadPath, await file.arrayBuffer());
    } catch (error) {
      console.error('write to temp failed', error);
      throw new Error(
        `uploading initial file failed, unable to write: ${uploadPath}, ${error}`
      );
    }

    return uploadPath;
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

  private async cleanTempDirectory() {
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
    return this.appendCwdToPath(process.env.PATH_TO_TEMP_FOLDER || '/temp');
  }

  private get pathToExecFunction(): string {
    return this.appendCwdToPath(
      process.env.PATH_TO_EXECUTE_FUNCTION || '/scripts/script-osx'
    );
  }

  private appendCwdToPath = (path: string): string =>
    process.cwd() + (path.startsWith('/') ? path : path.substring(1));
}
