// 轮询直到条件成立
export const waitUnitCondition = (gasp: number, conditionFn: () => boolean) =>
  new Promise((resolve) => {
    const id = setInterval(() => {
      if (conditionFn()) {
        clearInterval(id)
        resolve(true)
      }
    }, gasp)
  })

// 迭代迭代器
export const forIter = <T>(
  iter: IterableIterator<T>,
  callback: (value?: T) => void
) => {
  let _done: boolean | undefined = false
  while (!_done) {
    const { value, done } = iter.next()
    callback(value)
    _done = done
  }
}

// 迭代器装换成数组，用来遍历 Map 对象
export const iter2list = <T>(iter: IterableIterator<T>) => {
  const list: T[] = []
  let _done: boolean | undefined = false
  while (!_done) {
    const { value, done } = iter.next()
    value && list.push(value)
    _done = done
  }
  return list
}

export const clamp = (v: number, min: number, max: number) => {
  return Math.min(Math.max(v, min), max)
}

export const random = (min: number, max: number) => {
  const range = max - min
  return Math.random() * range + min
}
