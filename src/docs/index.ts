import SwaggerOptions from "../swaggerOptions";
import tags from "./tags";
import events from "./events";
import spotify from "./spotify";
import openapiConfig from "./basicinfo";

export default {
  ...SwaggerOptions,
  ...openapiConfig,
  ...tags,
  paths: {
    ...events,
    ...spotify,
  },
};
