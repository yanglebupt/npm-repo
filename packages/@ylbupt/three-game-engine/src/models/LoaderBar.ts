import { LoadingManager } from 'three'

export interface DomElement {
  setPercentage: (percentage: number) => void
  showLoading: () => void
  hiddenLoading: () => void
}

/**
 * @param {Map<string, LoadingManager>} managerMap 加载管理者集合
 * @param {DomElement} domElement 控件元素
 */
export class LoaderBar {
  managerMap: Map<string, LoadingManager> = new Map()
  domElement: DomElement

  constructor(domElement: DomElement) {
    this.domElement = domElement
  }

  addLoaderManager(name: string, manager: LoadingManager) {
    manager.onError = (url) => this.onError(name, url)
    manager.onProgress = (url, loaded, total) =>
      this.onProgress(name, url, loaded, total)
    manager.onStart = (url, loaded, total) =>
      this.onStart(name, url, loaded, total)
    manager.onLoad = () => this.onLoad(name)
    this.managerMap.set(name, manager)
  }

  onError(name: string, url: string) {}

  onProgress(name: string, url: string, loaded: number, total: number) {
    this.domElement.setPercentage((loaded / total) * 100)
  }
  onStart(name: string, url: string, loaded: number, total: number) {}

  onLoad(name: string) {}

  show() {
    this.domElement.showLoading()
  }

  hidden() {
    this.domElement.hiddenLoading()
  }
}
