import {
  PositionalAudio,
  AudioListener,
  Audio,
  AudioLoader,
  LoadingManager
} from 'three'
import { forIter } from '../tools/common'

export interface AudioOptions {
  name: string
  isPosition?: boolean
  loop?: boolean
  volume?: number
}

/**
 * @description 负责加载声音，并保存到实例中
 */
export class SoundManager {
  audioListener: AudioListener
  audioLoader: AudioLoader
  name: string
  path: string
  sounds: AudioOptions[]
  namedSound: Map<string, Audio | PositionalAudio> = new Map()

  constructor(
    name: string,
    path: string,
    sounds: AudioOptions[],
    manager: LoadingManager
  ) {
    this.name = name
    this.path = path
    this.sounds = sounds
    // 创建 AudioListener
    this.audioListener = new AudioListener()
    this.audioLoader = new AudioLoader(manager)
    this.audioLoader.setPath(path)
  }

  async load(audioListener?: AudioListener) {
    await Promise.all(
      this.sounds.map((sound) => this.loadSound(sound, audioListener))
    )
  }

  async loadSound(
    _sound: AudioOptions,
    audioListener?: AudioListener
  ): Promise<Audio | PositionalAudio> {
    const { name, isPosition = false, loop = false, volume = 0.5 } = _sound

    const listener = audioListener ?? this.audioListener
    const sound = isPosition
      ? new PositionalAudio(listener)
      : new Audio(listener)

    this.namedSound.set(name, sound)
    const audioBuffer = await this.audioLoader.loadAsync(name)
    sound.setBuffer(audioBuffer)
    sound.setLoop(loop)
    sound.setVolume(volume)
    return sound
  }

  setVolume(name: string, volume?: number) {
    const sound = this.namedSound.get(name)
    const _sound = this.sounds.find((_s) => _s.name === name)
    if (!sound) {
      return null
    } else {
      const v = volume ?? _sound?.volume
      if (typeof v !== 'undefined') sound.setVolume(v)
      return sound
    }
  }

  setLoop(name: string, loop?: boolean) {
    const sound = this.namedSound.get(name)
    const _sound = this.sounds.find((_s) => _s.name === name)

    if (!sound) {
      return null
    } else {
      const l = loop ?? _sound?.loop
      if (typeof l !== 'undefined') sound.setLoop(l)
      return sound
    }
  }

  play(name: string, volume?: number, loop?: boolean) {
    this.setLoop(name, loop)
    const sound = this.setVolume(name, volume)

    if (sound && !sound.isPlaying) {
      sound.play()
    }
  }

  stop(name: string) {
    const sound = this.namedSound.get(name)

    if (sound && sound.isPlaying) {
      sound.stop()
    }
  }

  pause(name: string) {
    const sound = this.namedSound.get(name)

    if (sound && sound.isPlaying) {
      sound.pause()
    }
  }

  stopAll() {
    forIter(this.namedSound.values(), (sound) => {
      sound?.stop()
    })
  }
}
