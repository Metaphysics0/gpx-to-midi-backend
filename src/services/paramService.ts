import { HTTPException } from "hono/http-exception";

class ParamService {
  getFileFromFormData({
    formData,
    fileName,
    permittedFileTypes = [],
  }: {
    formData: FormData;
    fileName: string;
    permittedFileTypes?: string[];
  }): File {
    const file = formData.get(fileName) as File;
    this.ensureFileExists(file);

    if (permittedFileTypes.length) {
      this.ensureFileIsValidContentType(file, permittedFileTypes);
    }

    return file;
  }

  private ensureFileIsValidContentType(
    file: File,
    allowedTypes: string[] = []
  ): void {
    const fileType = file.name.split(".").pop();

    if (!fileType || !allowedTypes.includes(fileType)) {
      throw new HTTPException(422, {
        message: "File type is not valid",
      });
    }
  }

  private ensureFileExists(file: File): void {
    if (!(file as File).name || (file as File).name === "undefined") {
      throw new HTTPException(422, {
        message: "You must provide a file to upload",
      });
    }
  }
}

export const paramService = new ParamService();
