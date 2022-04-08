/**
 * 保存词组
 */
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
 * 生成五笔编码
 */
export function createCode(dict, word) {
  if (/^[a-zA-Z]+/.test(word)) {
    return word.match(/^([a-zA-Z]+)/)[1].toLowerCase()
  }

  switch (word.length) {
    case 1: {
      let c = dict.get(word)
      return c?.shift()
    }
    case 2: {
      let c1 = dict.get(word[0])?.pop()
      let c2 = dict.get(word[1])?.pop()
      if (c1 && c2) {
        return c1.slice(0, 2) + c2.slice(0, 2)
      } else {
        console.error(word, '词组中存在未收录单字, 请到github上提交issues')
        break
      }
    }

    case 3: {
      let c1 = dict.get(word[0])?.pop()
      let c2 = dict.get(word[1])?.pop()
      let c3 = dict.get(word[2])?.pop()

      if (c1 && c2 && c3) {
        return c1[0] + c2[0] + c3.slice(0, 2)
      } else {
        console.error(word, '词组中存在未收录单字, 请到github上提交issues')
        break
      }
      break
    }

    default: {
      let c1 = dict.get(word[0])?.pop()
      let c2 = dict.get(word[1])?.pop()
      let c3 = dict.get(word[2])?.pop()
      let ce = dict.get(word[word.length - 1])?.pop()
      if (c1 && c2 && c3 && ce) {
        return c1[0] + c2[0] + c3[0] + ce[0]
      } else {
        console.error(word, '词组中存在未收录单字, 请到github上提交issues')
        break
      }
    }
  }
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

  toLowerCase() {
    return this.#origin.toLowerCase()
  }

  toUpperCase() {
    return this.#origin.toUpperCase()
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
    // k += ''
    k = k.toString()

    if (this.#dict_k[k]) {
      return [...this.#dict_k[k]]
    } else if (this.#dict_v[k]) {
      return [...this.#dict_v[k]]
    }
  }

  clone() {
    var data = JSON.parse(this.toJson())
    return new Enum(data)
  }

  concat(...args) {
    for (let li of args) {
      li.forEach((it, k) => {
        this.add(k, it)
      })
    }
  }

  slice(f, t) {
    var res = []
    var n = 0
    if (t === void 0) {
      t = this.length
    }
    if (f < 0) {
      f += this.length
    }
    this.forEach((v, k) => {
      if (n >= t) {
        return false
      }
      if (n >= f) {
        res.push({ [k]: [...v] })
      }
      n++
    })
    return res
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
