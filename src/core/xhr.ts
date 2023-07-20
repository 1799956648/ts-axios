import { AxiosRequestConfig, AxiosResponse, AxiosPromise } from '../types/dataInterface'

import { parseHeaders } from '../helpers/headers'

import { createError } from '../helpers/error'

export function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    function handleResponse(response: AxiosResponse) {
      //新建 处理响应的函数
      if (response.status >= 200 && response.status < 300) {
        //对状态码进行判断, 在200~300之内的,我们认为是成功的
        resolve(response) // 返回 响应的promise对象 将 数据集合起来传输至 axios的then方法中
      } else {
        // reject(new Error(`Request failed with status code ${response.status}`))//其他状态码就直接报错
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
    const { data = null, url, method = 'get', headers, responseType, timeout, cancelToken } = config

    const request = new XMLHttpRequest()

    if (cancelToken) {
      cancelToken.promise.then(reason => {
        request.abort()
        reject(reason)
      })
    }

    if (responseType) {
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }

    request.open(method.toLocaleUpperCase(), url!, true)

    //增加如下部分 这里要额外判断一个逻辑，当我们传入的 data 为空的时候，请求 header 配置 Content-Type 是没有意义的，于是我们把它删除。
    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name] // 要是data里面本就没啥数据的时候, 我们就用不着专门设置啥content-type了
      } else {
        request.setRequestHeader(name, headers[name]) //但是如果有data的话,设置HTTP 请求头的值
      }
    })

    request.send(data)

    request.onreadystatechange = function handleLoad() {
      //当 readyState 属性发生变化时调用的 EventHandler。
      if (request.readyState !== 4) {
        //request.readyState返回 一个无符号短整型（unsigned short）数字，代表请求的状态码。
        return
      }

      if (request.status === 0) {
        return
      }

      const responseHeaders = parseHeaders(request.getAllResponseHeaders()) //处理获得的响应数据头部
      //以字符串的形式返回所有用 CRLF(回车换行符) 分隔的响应头，如果没有收到响应，则返回 null
      const responseData =
        responseType && responseType !== 'text' ? request.response : request.responseText
      //检查是否我们自行设置了responseType的值, 并根据值来进行返回值来设置返回的值得类型
      //request.response 返回一个 ArrayBuffer、Blob、Document，或 DOMString，具体是哪种类型取决于 XMLHttpRequest.responseType 的值
      //request.responseText 返回一个 DOMString，该 DOMString 包含对请求的响应，如果请求未成功或尚未发送，则返回 null。
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
      // resolve(response)
    }

    request.onerror = function handleError() {
      //新增错误处理代码
      reject(createError('Network Error', config, null, request))
    }

    request.ontimeout = function handleTimeout() {
      reject(
        createError(`Timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED', request)
      )
    }
  })
}
