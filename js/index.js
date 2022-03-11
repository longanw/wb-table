/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2022/03/11 12:03:59
 */

import '//unpkg.yutent.top/anot/dist/anot.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/layer/index.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/input.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/button.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/radio.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/switch.js'
import fetch from '//unpkg.yutent.top/@bytedo/fetch/dist/index.js'

import { Enum } from './lib/core.js'

const WB_CODE_NAME = new Enum({ 1: '一级简码', 2: '二级简码', 3: '三级简码', 4: '四级简码' })
const WB_TABLE = new Enum()

Anot.hideProperty(WB_TABLE, 'length', 0)

Anot({
  $id: 'app',
  state: {
    single: 0,
    words: 0,
    result: '',
    filter: {
      txt: '',
      table: '86',
      reverse: false
    }
  },
  mounted() {
    fetch('./data/table.txt')
      .then(r => r.text())
      .then(r => {
        // console.log(r)
        r.split('\n').forEach(it => {
          it = it
            .trim()
            .split(' ')
            .map(_ => _.trim())

          let k = it.shift()

          if (k) {
            WB_TABLE.add(k, it)
          }
        })

        window.foo = WB_TABLE

        console.log(WB_TABLE)

        this.single = WB_TABLE.length
      })
  },

  methods: {
    search() {
      var params = { ...this.filter }
      var res

      params.txt = params.txt.toLowerCase()

      if (params.reverse && !/^[a-z]{1,4}$/.test(params.txt)) {
        return layer.toast('不合法的五笔编码', 'warning')
      }

      res = WB_TABLE.get(params.txt)

      if (params.reverse) {
        res = res.join('\t')
      } else {
        res = res.map(t => `${WB_CODE_NAME.get(t.length)}: ${t}`).join('\t')
      }

      this.result = `查询结果: 【 ${params.txt} 】\n${res.toUpperCase()}`
    }
  }
})
