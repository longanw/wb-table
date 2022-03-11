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
      table: '86'
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
      var reverse = false
      var res

      params.txt = params.txt.trim().toLowerCase()

      reverse = /^[a-z]{1,4}$/.test(params.txt)

      if (!reverse) {
        params.txt = params.txt.replace(/[\sa-z]/g, '')
      }

      if (params.txt.length > 1) {
        res = params.txt.split('').map(t => WB_TABLE.get(t))
      } else {
        res = [WB_TABLE.get(params.txt)]
      }

      if (reverse) {
        if (res[0]) {
          res = `【 ${params.txt} 】👉\t${res[0].join('\t\t')}`
        } else {
          res = `【 ${
            params.txt
          } 】👉\t无结果, 请检查你的输入是否正确, 如果确认无误, 可以反馈缺失字库。`
        }
      } else {
        res = res
          .map((it, i) => {
            if (it) {
              return `【 ${params.txt[i]} 】👉\t${it
                .map(t => `${WB_CODE_NAME.get(t.length)}: ${t.toUpperCase()}`)
                .join('\t\t')}`
            } else {
              return `【 ${
                params.txt[i]
              } 】👉\t无结果, 请检查你的输入是否正确, 如果确认无误, 可以反馈缺失字库。`
            }
          })
          .join('\n')
      }

      this.result = `查询结果: \n${res}`
    }
  }
})
