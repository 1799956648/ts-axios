import { AxiosRequestConfig, AxiosResponse } from '../types/dataInterface'

export class AxiosError extends Error {
  //定义基本参数
  isAxiosError: boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse
  constructor(
    //定义传入的参数
    message: string, //报错信息
    config: AxiosRequestConfig, //axios请求的配置文件
    code?: string | null, //错误状态代码
    request?: any, //XHR请求的实例对象
    response?: AxiosResponse //请求返回的数据信息
  ) {
    super(message) //把信心传到Error对象里面 实例化一个error对象
    this.config = config //把在构造函数传入的信息设置为实例的属性
    this.code = code
    this.request = request
    this.response = response
    this.isAxiosError = true //设置一个布尔值, 定义当前情况下的一个状态描述
    Object.setPrototypeOf(this, AxiosError.prototype) // 手动定义值得原型继承
  }
}

export function createError( //输出一个函数, 并用上述的Axios类进行返回值约束
  message: string,
  config: AxiosRequestConfig,
  code?: string | null,
  request?: any,
  response?: AxiosResponse
): AxiosError {
  // 返回一个新的AxiosError实例
  const error = new AxiosError(message, config, code, request, response)
  return error
}
