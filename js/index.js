/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2022/03/11 12:03:59
 */

import '//unpkg.yutent.top/anot/dist/anot.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/layer/index.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/input.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/button.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/link.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/radio.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/checkbox.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/switch.js'
import fetch from '//unpkg.yutent.top/@bytedo/fetch/dist/index.js'

import { Enum } from './lib/core.js'
import FIXED_18030 from './lib/18030.js'

const WB_CODE_NAME = { 1: '一级简码', 2: '二级简码', 3: '三级简码', 4: '四级简码' }
const WB_TABLE = new Enum()
const WB_TABLE_18030 = new Enum(FIXED_18030)
const WB_WORDS = new Enum()
const WB_DY = new Enum()

Anot({
  $id: 'app',
  state: {
    single: 0,
    words: 0,
    dy: 0,
    result: '',
    filter: {
      text: '',
      table: '86'
    },
    dlOpt: {
      tables: ['table', 'words', 'dy']
    }
  },
  mounted() {
    Promise.all([
      fetch('./data/table.txt').then(r => r.text()),
      fetch('./data/words.txt').then(r => r.text()),
      fetch('./data/dy.txt').then(r => r.text())
    ]).then(([table, words, dy]) => {
      //

      table.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_TABLE.add(k, it)
        }
      })

      words.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_WORDS.add(k, it)
        }
      })

      dy.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_DY.add(k, it)
        }
      })

      this.single = WB_TABLE.length
      this.words = WB_WORDS.length
      this.dy = WB_DY.length
    })

    this.$refs.dl.show()
  },

  methods: {
    search() {
      var { text, table } = this.filter
      var reverse = false
      var res, res18030

      text = text.trim().toLowerCase()

      if (!text) {
        return
      }

      reverse = /^[a-z]{1,4}$/.test(text)

      if (!reverse) {
        text = text.replace(/[\sa-z]/g, '')
      }

      if (reverse || text.length === 1) {
        res = [WB_TABLE.get(text)]
        if (table === '18030') {
          res18030 = [WB_TABLE_18030.get(text)]
        }
      } else {
        res = text.split('').map(t => WB_TABLE.get(t))
        if (table === '18030') {
          res18030 = text.split('').map(t => WB_TABLE_18030.get(t))
        }
      }

      if (reverse) {
        text = text.toUpperCase()
        // 反查时, 直接替换结果
        if (res18030 && res18030[0]) {
          res = res18030
        }
        if (res[0]) {
          res = `【 ${text} 】👉\t${res[0]
            .map(
              t =>
                `${t}(${(res18030 && res18030[0] ? WB_TABLE_18030.get(t) : WB_TABLE.get(t))
                  .join('、')
                  .toUpperCase()})`
            )
            .join('\t\t')}`
        } else {
          res = `【 ${text} 】👉\t无结果, 请检查你的输入是否正确, 如果确认无误, 可以反馈缺失字库。`
        }
      } else {
        if (res18030) {
          res18030.forEach((it, i) => {
            if (it) {
              res[i] = it
            }
          })
        }
        res = res
          .map((it, i) => {
            if (it) {
              return `【 ${text[i]} 】👉\t${it
                .map(t => `${WB_CODE_NAME[t.length]}: ${t.toUpperCase()}`)
                .join('\t\t')}`
            } else {
              return `【 ${text[i]} 】👉\t无结果, 请检查你的输入是否正确, 如果确认无误, 可以反馈缺失字库。`
            }
          })
          .join('\n')
      }

      this.result = `查询结果: \n${res}`
    }
  }
})
