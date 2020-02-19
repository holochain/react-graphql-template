import mockData from './mockData'
import { isFunction } from 'lodash/fp'

export default function mockCallZome (instanceId, zome, zomeFunc) {
  return async function (args) {
    const funcOrResult = mockData[instanceId][zome][zomeFunc]
    const result = isFunction(funcOrResult) ? funcOrResult(args) : funcOrResult
    return JSON.stringify({ Ok: result })
  }
}
