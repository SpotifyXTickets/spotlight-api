import SwaggerOptions from '../swaggerOptions'
import tags from './tags'
import events from './events'

import authorize from './authorize'
import recommend from './recommend'
import recommend2 from './recommend2'

import openapiConfig from './basicinfo'

export default {
  ...SwaggerOptions,
  ...openapiConfig,
  ...tags,
  paths: {
    ...events,

    ...authorize,
    ...recommend,
    ...recommend2,
  },
}
