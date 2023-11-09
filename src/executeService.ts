import { readdir, unlink } from "node:fs/promises";

export class ExecuteService {
  async writeFileAndConvert(
    file: File
  ): Promise<{ file: ArrayBuffer; name: string }> {
    const uploadPath = await this.writeFileToTempFolder(file);

    await this.executeConvert(uploadPath);
    await this.deleteFile(uploadPath);

    const convertedFilePath = await this.getConvertedFilePath(uploadPath);
    const convertedFile = await Bun.file(convertedFilePath).arrayBuffer();

    await this.deleteFile(convertedFilePath);

    return {
      name: this.getFileNameParts(uploadPath).name,
      file: convertedFile,
    };
  }

  private async executeConvert(pathToConvert: string) {
    const proc = Bun.spawn([this.pathToExecFunction, pathToConvert]);

    try {
      await new Response(proc.stdout).text();
    } catch (error) {
      console.error("error", error);
      throw new Error("error executing convert function");
    }
  }

  private async writeFileToTempFolder(file: File) {
    const uploadPath = `${this.pathToTempFolder}/${Date.now()}__${file.name}`;

    try {
      await Bun.write(uploadPath, await file.arrayBuffer());
    } catch (error) {
      console.error("write to temp failed", error);
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
      throw new Error("unable to find orignally uploaded file");
    }

    const dirCont = await readdir(this.pathToTempFolder);
    const convertedFileName = dirCont.find((elm) =>
      elm.includes(uploadedFileTimestamp)
    );

    if (!convertedFileName) {
      throw new Error("unable to find newly converted file");
    }

    return this.pathToTempFolder + "/" + convertedFileName;
  }

  private getFileNameParts(filePath: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-unsafe-optional-chaining
    const [timestamp, name] = filePath.split("/")?.at(-1)?.split("__");
    return {
      timestamp,
      name: name.split(".")[0],
    };
  }

  private async deleteFile(pathToFile: string) {
    await unlink(pathToFile);
  }

  private get pathToTempFolder(): string {
    return this.appendCwdToPath(process.env.PATH_TO_TEMP_FOLDER || "/temp");
  }

  private get pathToExecFunction(): string {
    return this.appendCwdToPath(
      process.env.PATH_TO_EXECUTE_FUNCTION || "/scripts/script-osx"
    );
  }

  private appendCwdToPath = (path: string): string =>
    process.cwd() + (path.startsWith("/") ? path : path.substring(1));
}
