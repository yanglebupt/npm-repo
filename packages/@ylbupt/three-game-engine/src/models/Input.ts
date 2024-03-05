import { iter2list } from '../tools/common'

/**
 * @description 用于监听用户事件的抽象类
 * @param {(keyof DocumentEventMap)[]} keys 需要监听的事件的名字
 * @param {Map<keyof DocumentEventMap, Event>} key2event 事件名和触发的时间
 * @param {Map<keyof DocumentEventMap, (evt: Event) => void>} key2fn 事件名和触发的函数
 * @method registerEventListener  根据 keys 注册监听事件
 * @method removeEventListener  根据 keys 移除监听事件
 */
export class Input {
  keys: (keyof DocumentEventMap)[]
  fns: ((evt: Event) => void)[] | undefined
  key2event: Map<keyof DocumentEventMap, Event> = new Map()
  key2fn: Map<keyof DocumentEventMap, (evt: Event) => void> = new Map()
  constructor(
    keys: (keyof DocumentEventMap)[],
    fns?: ((evt: Event) => void)[]
  ) {
    this.keys = keys
    this.fns = fns
    this.registerEventListener()
  }

  registerEventListener() {
    this.keys.forEach((k, idx) => {
      const fn = (evt: Event) => {
        // 需要删除互斥的事件
        const main = k.split(/up|down|start|move|end|enter|leave/)[0]
        iter2list(this.key2event.keys())
          .filter((key) => key.includes(main))
          .forEach((key) => {
            this.key2event.delete(key)
          })
        this.key2event.set(k, evt)
        // 是否调用回调函数
        if (this.fns && this.fns[idx]) {
          this.fns[idx](evt)
        }
      }
      this.key2fn.set(k, fn)
      document.addEventListener(k, fn)
    })
  }

  removeEventListener() {
    this.keys.forEach((k) => {
      const fn = this.key2fn.get(k)!
      document.removeEventListener(k, fn)
    })
  }
}
