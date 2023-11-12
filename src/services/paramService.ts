import { HTTPException } from "hono/http-exception";

class ParamService {
  public getFileFromFormData(formData: FormData, name: string): File {
    const file = formData.get(name) as File;
    if (!(file as File).name || (file as File).name === "undefined")
      throw new HTTPException(422, {
        message: "You must provide a file to upload",
      });

    return file;
  }

  public ensureFileIsValidContentType(
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
}

export const paramService = new ParamService();
