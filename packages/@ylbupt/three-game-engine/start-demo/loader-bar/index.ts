import { DomElement, waitUnitCondition } from '@ylbupt/three-game-engine'
import styles from './index.module.less'
import { round } from 'lodash-es'

/* 默认控件 */
export class LoaderBarDomElement implements DomElement {
  static html = `
    <div class=${styles['bar']}></div>
    <span class=${styles['text']}></span>
  `
  root: HTMLElement
  bar: HTMLElement
  text: HTMLElement
  canHidden: boolean = false
  transitionDuration: number = 0.1
  constructor() {
    this.root = document.createElement('div')
    this.root.className = styles['loading-bar']
    this.root.innerHTML = LoaderBarDomElement.html
    this.bar = this.root.firstElementChild as HTMLElement
    this.bar.style.setProperty(
      'transition-duration',
      `${this.transitionDuration}s`
    )
    this.text = this.root.lastElementChild as HTMLElement
    document.body.appendChild(this.root)
    // 修改监听
    const mob = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type == 'attributes' &&
          mutation.attributeName == 'style'
        ) {
          if ((mutation.target as HTMLElement).style.width == '100%') {
            this.canHidden = true
          }
        }
      })
    })
    mob.observe(this.bar, {
      attributes: true
    })
  }

  setPercentage(percentage: number, name?: string, url?: string) {
    const p = round(percentage, 2)
    this.bar.style.setProperty('width', `${p}%`)
    this.text.innerText = `${name}: ${url} (${p}%)`
  }
  async onLoaded(name?: string) {
    /* 多进度条加载，需要重置 */
    this.nextTick(() => this.bar.style.setProperty('width', `0%`))
  }
  showLoading() {
    this.root.classList.toggle(styles['show'])
  }
  async hiddenLoading() {
    /* 需要在页面更新后隐藏 */
    this.nextTick(() => this.root.classList.toggle(styles['show']))
  }
  /* 需要在页面更新后回调 */
  async nextTick(callback: () => void) {
    await waitUnitCondition(10, () => this.canHidden)
    setTimeout(callback, this.transitionDuration * 1000)
  }
}
