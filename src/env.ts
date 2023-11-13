import { from } from "env-var";

const env = from(process.env, {});

export const config = {
  pathToExecuteFunction: env
    .get("PATH_TO_EXECUTE_FUNCTION")
    .required()
    .asString(),
  pathToTempFolder: env
    .get("PATH_TO_TEMP_FOLDER")
    .default("/temp")
    .required()
    .asString(),
  API_HOST_PORT: env.get("API_HOST_PORT").default(4000).required().asString(),
};
