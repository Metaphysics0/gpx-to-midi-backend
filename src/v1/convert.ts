import { Hono } from "hono";
import { paramService } from "../services/paramService";
import { SUPPORTED_FILE_TYPES } from "../constants";
import { HTTPException } from "hono/http-exception";
import { executeService } from "../services/executeService";

export const convertApi = new Hono();

convertApi.post("/", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = paramService.getFileFromFormData({
      formData,
      fileName: "file",
      permittedFileTypes: SUPPORTED_FILE_TYPES,
    });

    const { file: convertedFileBuffer, name } =
      await executeService.writeFileAndConvert(file);

    return c.json({
      name,
      file: Array.from(new Uint8Array(convertedFileBuffer)),
    });
  } catch (error) {
    console.error("error: ", error);

    throw new HTTPException(500, {
      message: `Error: ${error}`,
    });
  }
});
