import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { ExecuteService } from "./executeService";

const app = new Hono();

app.post("/convert", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!(file as File).name || (file as File).name === "undefined") {
      throw new HTTPException(422, {
        message: "You must provide a file to upload",
      });
    }

    const service = new ExecuteService();
    const { file: convertedFileBuffer, name } =
      await service.writeFileAndConvert(file);

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

app.get("/", (c) => {
  return c.text("hello");
});

export default app;
