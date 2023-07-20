type XMLHttpRequestResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'Delete'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | ' PUT'
  | 'patch'
  | 'PATCH'

export interface AxiosTransformer {
  (data: any, headers?: any): any
}

export interface Cancel {
  message?: string
}

export interface CancelStatic {
  new (message?: string): Cancel
}

export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel
  throwIfRequested(): void
}

export interface Canceler {
  (message?: string): void
}

export interface CancelExecutor {
  (cancel: Canceler): void
}

export interface CancelTokenSource {
  token: CancelToken
  cancel: Canceler
}

export interface CancelTokenStatic {
  new (executor: CancelExecutor): CancelToken
  source(): CancelTokenSource
}

export interface AxiosRequestConfig {
  url?: string
  method?: Method
  data?: any
  params?: any
  headers?: any
  responseType?: XMLHttpRequestResponseType
  timeout?: number
  [propName: string]: any // 避免数据不兼容
  transformRequest?: AxiosTransformer | AxiosTransformer[]
  transformResponse?: AxiosTransformer | AxiosTransformer[]
  cancelToken?: CancelToken
}

export interface AxiosResponse<T = any> {
  // 定义axios方法传输到then里面的resolve 数据
  data: T // 服务端返回的数据 data
  status: number // HTTP 状态码status
  statusText: string // 状态消息 statusText
  headers: any // 响应头 headers
  config: AxiosRequestConfig // 请求配置对象 config
  request: any // 请求的 XMLHttpRequest 对象实例 request
}

export interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

export interface AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string
  request?: any
  response?: AxiosResponse
  isAxiosError: boolean
}

export interface Axios {
  defaults: AxiosRequestConfig // 设置基本自有属性
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
  }
  // 定义各种方法的参数和返回数据, 不管传入的参数如何, 最终返回的都是一个AxiosPromise 对象
  request<T = any>(config: AxiosRequestConfig): AxiosPromise<T>
  get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>
}

// 函数描述, 可以直接用于函数变量的实现 定义一个Axios实例的基本, 这样axios即是一个函数 也拥有n多方法
export interface AxiosInstance extends Axios {
  <T = any>(config: AxiosRequestConfig): AxiosPromise<T>

  // 第二种函数参数实现, 传入url和config, config为可选参数
  <T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>
}

export interface AxiosStatic extends AxiosInstance {
  create(config?: AxiosRequestConfig): AxiosInstance
  CancelToken: CancelTokenStatic
  Cancel: CancelStatic
  isCancel: (value: any) => boolean
}

export interface ResolvedFn<T = any> {
  // 根据传入泛型参数,定义函数的基本格式, 函数返回值为联合类型
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  // 根据传入泛型参数,定义函数的基本格式, 函数返回值为任意类型
  (error: any): any
}

export interface AxiosInterceptorManager<T> {
  // 接受 泛型参数
  // 拦截器最终req和res的接口定义
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number
  // 解除拦截器的代码操作
  eject(id: number): void
}
