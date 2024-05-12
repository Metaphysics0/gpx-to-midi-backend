import { Hono } from 'hono';
import { throwUnknownServerError } from '../utils/responses.util';
import { SUPPORTED_CONVERT_OPTIONS } from '../constants';
import { getConvertType } from '../utils/get-convert-type.util';
import { getRequiredFileFromRequest } from '../utils/get-required-file-from-request.util';
import { getConversionService } from '../utils/get-conversion-service.util';

const convertController = new Hono();

convertController.post(
  `/:from{${SUPPORTED_CONVERT_OPTIONS.join(
    '|'
  )}}/:to{${SUPPORTED_CONVERT_OPTIONS.join('|')}}`,
  async (c) => {
    try {
      const { from, to } = c.req.param();
      const convertType = getConvertType({ from, to });

      const file = await getRequiredFileFromRequest(c.req);

      const service = getConversionService(convertType);
      const convertedFileResponse = await new service(file).convert();

      return c.json(convertedFileResponse);
    } catch (error) {
      console.error(`POST /convert api failed: ${JSON.stringify(error)}`);
      throwUnknownServerError('Unknown server error');
    }
  }
);

export { convertController };
