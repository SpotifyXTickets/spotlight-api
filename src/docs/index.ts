import SwaggerOptions from '../swaggerOptions'
import tags from './tags'
import events from './events'
import artist from './artist'
import authorize from './authorize'
import recommend from './recommend'
import recommend2 from './recommend2'
import playlist from './playlist'
import user from './user'

import openapiConfig from './basicinfo'

export default {
  ...SwaggerOptions,
  ...openapiConfig,
  ...tags,
  paths: {
    ...events,
    ...artist,
    ...authorize,
    ...recommend,
    ...recommend2,
    ...playlist,
    ...user,
  },
}
