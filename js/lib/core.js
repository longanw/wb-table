export function saveFile(bin, fileName) {
  var link = document.createElement('a')
  link.href = URL.createObjectURL(bin)
  link.download = fileName
  // 兼容火狐浏览器对于a链接click无效的问题，将a链接作为子节点放置到body元素下
  document.body.appendChild(link)
  link.click()
  // 下载后移除a链接
  document.body.removeChild(link)
}

/**
 * 增强版 String
 */
export class SString {
  #origin = ''
  #list = []

  constructor(str = '') {
    this.#origin = str

    for (let it of str) {
      this.#list.push(it)
    }
  }

  get length() {
    return this.#list.length
  }

  at(index = 0) {
    if (this.length > 0) {
      while (index < 0) {
        index += this.length
      }
      return this.#list[index]
    }
  }

  split() {
    return this.#list
  }

  forEach(callback) {
    for (let i in this.#list) {
      if (callback(this.#list[i], i) === false) {
        break
      }
    }
    return this
  }

  toString() {
    return this.#origin
  }
}

/**
 * 特殊版 Enum
 */
export class Enum {
  #dict_k = Object.create(null)
  #dict_v = Object.create(null)
  length = 0

  constructor(obj = {}) {
    for (let k in obj) {
      this.add(k, obj[k])
    }
  }

  add(k, v) {
    if (this.#dict_k[k]) {
      var _v = this.#dict_k[k]

      for (let t of _v) {
        this.#dict_v[t] = this.#dict_v[t].filter(i => i !== k)
      }
    } else {
      this.#dict_k[k] = Array.isArray(v) ? v : [v]
      this.length++
    }

    if (Array.isArray(v)) {
      for (let t of v) {
        if (this.#dict_v[t]) {
          this.#dict_v[t].push(k)
        } else {
          this.#dict_v[t] = [k]
        }
      }
    } else {
      this.#dict_v[v] = [k]
    }
  }

  remove(k) {
    var v = this.#dict_k[k]
    if (v) {
      delete this.#dict_k[k]
      for (let t of v) {
        delete this.#dict_v[t]
      }
      this.length--
    }
  }

  get(k) {
    if (this.#dict_k[k]) {
      return this.#dict_k[k]
    } else if (this.#dict_v[k]) {
      return this.#dict_v[k]
    }
  }

  concat(...args) {
    for (let li of args) {
      li.forEach((it, k) => {
        this.add(k, it)
      })
    }
  }

  forEach(callback, forV) {
    var dict = forV ? this.#dict_v : this.#dict_k
    for (let k in dict) {
      if (callback(dict[k], k) === false) {
        break
      }
    }
    return this
  }

  toString(forV) {
    var dict = forV ? this.#dict_v : this.#dict_k
    var text = ''
    for (let k in dict) {
      text += `${k} ${dict[k].join(' ')}\n`
    }
    return text.trim()
  }

  toJson(forV) {
    return JSON.stringify(forV ? this.#dict_v : this.#dict_k)
  }
}
