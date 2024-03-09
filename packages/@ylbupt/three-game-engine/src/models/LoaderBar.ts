import { LoadingManager } from 'three'

export interface DomElement {
  setPercentage: (percentage: number, name?: string, url?: string) => void
  onLoaded: (name?: string) => void
  showLoading: () => void
  hiddenLoading: () => void
}

/**
 * @param {Map<string, LoadingManager>} managerMap 加载管理者集合
 * @param {DomElement} domElement 控件元素
 */
export class LoaderBar {
  domElement: DomElement
  count: number = 0

  constructor(domElement: DomElement) {
    this.domElement = domElement
  }

  addLoadingManager(name: string, manager: LoadingManager) {
    manager.onError = (url) => this.onError(name, url)
    manager.onProgress = (url, loaded, total) =>
      this.onProgress(name, url, loaded, total)
    manager.onStart = (url, loaded, total) =>
      this.onStart(name, url, loaded, total)
    manager.onLoad = () => this.onLoad(name)
    this.count++
  }

  private onError(name: string, url: string) {}

  private onProgress(name: string, url: string, loaded: number, total: number) {
    this.domElement.setPercentage((loaded / total) * 100, name, url)
  }

  private onStart(name: string, url: string, loaded: number, total: number) {}

  /* 某个 loadingmanager 加载完毕 */
  private onLoad(name: string) {
    if (this.count > 1) this.domElement.onLoaded(name)
  }

  show() {
    this.domElement.showLoading()
  }

  hidden() {
    this.domElement.hiddenLoading()
  }
}
