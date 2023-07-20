import { AxiosRequestConfig, AxiosResponse, AxiosPromise } from '../types/dataInterface'

import transform from './transform'

import { transformRequest, transformResponse } from '../helpers/data'

import { bulidURL } from '../helpers/url' // 导入url解析模块

import { processHeaders, flattenHeaders } from '../helpers/headers'

import { xhr } from './xhr'
import { deflate } from 'zlib'

function transformUrl(config: AxiosRequestConfig): string {
  // 转换 url
  const { url, params } = config
  return bulidURL(url!, params)
}

function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

function processConfig(config: AxiosRequestConfig): void {
  // config.headers = transformHeaders(config)
  // config.data = transformRequestData(config) // 修改data值
  // config.headers = flattenHeaders(config.headers, config.method!) // 再次处理一下配置文件中的头文件, 这里给config加了一个非空值锁定

  // config.url = transformURL(config) // 修改url值
  config.url = transformUrl(config) // 修改url值
  config.data = transform(config.data, config.headers, config.transformRequest) // 修改data值
  config.headers = flattenHeaders(config.headers, config.method!) // 再次处理一下配置文件中的头文件, 这里给config加了一个非空值锁定
}

function transformHeaders(config: AxiosRequestConfig) {
  const { headers = {}, data } = config //如果没有传入headers对象, 就默认设置一个空对象以设置默认值
  return processHeaders(headers, data)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  //接受响应数据, 并对响应数据的data属性的值进行转化
  // res.data = transformResponse(res.data)
  // return res
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

function axios(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
  processConfig(config) // 合并各项参数 生成最终的url值
  return xhr(config).then(res => {
    return transformResponseData(res) //把生成的promise对象进行转化, 处理promise对象中的data数据
  }) // 发送基本数据
}

export default axios
