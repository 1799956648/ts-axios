import { CancelExecutor, CancelTokenSource, Canceler } from '../types/dataInterface'

import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: string): void
}

interface ResolvePromise {
  (reason?: Cancel): void //此处reason的类型需要修改一番
}

export default class CancelToken {
  promise: Promise<Cancel>

  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      resolvePromise = <ResolvePromise>resolve
    })
    executor(message => {
      if (this.reason) {
        //防止多次重复调用
        return
      }
      this.reason = new Cancel(message)
      resolvePromise(this.reason) //改变上面的promise状态
    })
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })
    return {
      cancel,
      token
    }
  }

  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }
}
