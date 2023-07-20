import { ResolvedFn, RejectedFn } from '../types/dataInterface'

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null> // 记录当前被添加的拦截器

  constructor() {
    this.interceptors = [] // 初始存储具体 拦截器的数组 , 数组默认为空值
  }

  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    // 定义方法接受拦截器的 操作函数, 并且返回一个数字ID, 方便后期 eject函数进行拦截器清除
    this.interceptors.push({
      resolved,
      rejected
    })
    return this.interceptors.length - 1
    // 把当前添加的拦截器集合对象的下标作为 ID值进行返回
  }
  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    // 遍历器 , 传入一个函数, 该函数专门用来处理当前注册添加的拦截器对象集合
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        //只要拦截器存在我们就执行一次函数fn
        fn(interceptor)
      }
    })
  }

  eject(id: number): void {
    // 根据ID清除掉拦截器
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
