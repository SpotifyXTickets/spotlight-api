import getRecommend from './get-recommend'

export default {
  '/recommendations': {
    ...getRecommend,
  },
}
