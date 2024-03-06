export type KeyFnPair<T> = {
  [P in keyof T]?: EventFunc
}

export type EventKey = keyof DocumentEventMap
export type EventFunc = (evt: Event) => void
/**
 * @description 用于监听用户事件的抽象类
 * @param {EventKey[]} keys 需要监听的事件的名字
 * @param {Map<EventKey, EventFunc>} key2fn 事件名和触发的函数
 * @method addEventListener  根据 keys 注册监听事件
 * @method removeEventListener  根据 keys 移除监听事件
 */
export class Input {
  keys: EventKey[]
  fns: EventFunc[] | undefined
  key2event: Map<EventKey, Event> = new Map()
  key2fn: Map<EventKey, EventFunc> = new Map()
  constructor(keys: EventKey[], fns?: EventFunc[])
  constructor(KeyFnPair: KeyFnPair<DocumentEventMap>)
  constructor(
    keysOrKeyFnPair: EventKey[] | KeyFnPair<DocumentEventMap>,
    fns?: EventFunc[]
  ) {
    if (Array.isArray(keysOrKeyFnPair)) {
      this.keys = keysOrKeyFnPair
      this.fns = fns
    } else {
      this.keys = Object.keys(keysOrKeyFnPair) as EventKey[]
      this.fns = Object.values(keysOrKeyFnPair) as EventFunc[]
    }
    this.addAllEventListener()
  }

  private addAllEventListener() {
    this.keys.forEach((k, idx) => {
      const fn = (evt: Event) => {
        // 是否调用回调函数
        if (this.fns && this.fns[idx]) {
          this.fns[idx](evt)
        }
      }
      this.key2fn.set(k, fn)
      document.addEventListener(k, fn)
    })
  }

  addEventListener(k: EventKey, fn: EventFunc) {
    this.key2fn.set(k, fn)
    document.addEventListener(k, fn)
  }

  removeEventListener(k: EventKey) {
    const fn = this.key2fn.get(k)!
    document.removeEventListener(k, fn)
  }

  removeAllEventListener() {
    this.keys.forEach((k) => {
      this.removeEventListener(k)
    })
  }
}
