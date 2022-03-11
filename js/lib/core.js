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
      if (Array.isArray(v)) {
        for (let t of v) {
          delete this.#dict_v[t]
        }
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

  forEach(callback, forV) {
    var dict = forV ? this.#dict_v : this.#dict_k
    for (let k in dict) {
      if (callback(k, dict[k]) === false) {
        break
      }
    }
    return this
  }

  toString() {
    return JSON.stringify(this.#dict_k)
  }
}
