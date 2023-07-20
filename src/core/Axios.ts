import {
  Method,
  ResolvedFn,
  RejectedFn,
  AxiosRequestConfig,
  AxiosPromise,
  AxiosResponse
} from '../types/dataInterface'

import mergeConfig from './mergeConfig'

import dispatchRequest from './dispatchRequest'

import InterceptorManager from './InterceptorManager'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChain<T> {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

export default class Axios {
  defaults: AxiosRequestConfig // 设置基本自有属性
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    // 默认值在创建axios对象时就创造
    this.defaults = initConfig

    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(), // 请求拦截器的数据是 配置文件
      response: new InterceptorManager<AxiosResponse>() // 响应拦截器的数据是 响应文件
    }
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    // 私有方法 定义 去除数据的 基本请求
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      }) // 配置文件数据合并
    )
  }
  _requestMethodWithData(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    // 私有方法 定义 包含数据的 基本请求
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      }) // 配置文件数据合并
    )
  }
  request(url: string | AxiosRequestConfig, config?: AxiosRequestConfig): AxiosPromise {
    if (typeof url === 'string') {
      // 当url存在的时候
      if (!config) {
        // 并且config不存在的时候
        config = {} // 设置为空对象
      }
      config.url = url // 然后将函数的实参url 设置为对象的属性url
    } else {
      // 要是第一个参数不是字符串, 那就是对象咯, 那就把url当做是config对象
      config = url
    }

    config = mergeConfig(this.defaults, config) //进行配置文件合并

    const chain: PromiseChain<any>[] = [
      {
        resolved: dispatchRequest,
        // 把默认的处理xhr请求的函数放在此处,作为初始值,不管有没有拦截器,这个一定是会执行的
        rejected: undefined
      }
    ]

    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor) // 调整请求拦截器函数的内容顺序, 把后面的放在数组的前面
    })

    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor) // 调整响应拦截器函数的内容顺序, 把后面的放在数组的后面
    })

    let promise = Promise.resolve(config) // 添加初始的promise参数

    while (chain.length) {
      const { resolved, rejected } = chain.shift()! // 类型断言不为空值
      promise = promise.then(resolved, rejected) // 实现了链式调用
    }

    return promise as AxiosPromise // 类型断言一下, 以免出现类型检查不兼容
    // return dispatchRequest(config)  // 返回快速请求数据, 也就是默认的请求
  }

  // 下方为根据不同的方法所需要的基本参数, 返回不同处理流程的数据
  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }
  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }
  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }
  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }
  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }
  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }
}
