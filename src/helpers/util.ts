const toString = Object.prototype.toString

//  定义两个特殊参数数据格式的验证函数
export function isDate(val: any): val is Date {
  //  验证是否是日期对象
  return toString.call(val) === '[object Date]'
}

//  export function isObject(val: any): val is Object {  //  验证是否是普通对象
//      return val !== null && typeof val === 'object';
//  }

export function isPlainObject(val: any): val is Object {
  //  判断传入的数据是否为标准对象格式
  return toString.call(val) === '[object Object]'
}

export function extend<T, U>(to: T, from: U): T & U {
  //  返回T和U的交叉类型
  // 利用泛型实现两者直接合并的
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any // 采用类型断言 避免不比较的编译检测错误
    // 如果括号开头的语句不加分号，那么代码压缩后合并到一行后非常容易变成一个函数的调用了，所以需要加分号。另外以 +、-、/、()、[] 这些字符开头的语句，都需要加分号。
  }
  return to as T & U
}

export function deepMerge(...objs: any[]): any {
  // objs 是个数组, 里面存储的传进来的1至2个对象
  const result = Object.create(null) // 创建空对象, 存储最终数据
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        // 得到对象的属性名
        const val = obj[key] // 得到对象的属性名对应的属性值
        if (isPlainObject(val)) {
          // 如果值是对象的话
          if (isPlainObject(result[key])) {
            // 判断此时的最终数据的对象里是否已经存在该名称的值,且也是对象
            result[key] = deepMerge(result[key], val) // 再次进行合并
          } else {
            // 判断此时的最终数据的对象里没有存在该名称的值,或是该值不是对象的
            result[key] = deepMerge({}, val) //  那么拿一个空对象进行合并
          }
        } else {
          result[key] = val //  要是值不是对象的 ,那么直接设置就好, 后面的覆盖前面的
        }
      })
    }
  })
  return result // 返回最终结果
}
