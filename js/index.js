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

import { Enum, saveFile, SString } from './lib/core.js'
import FIXED_86F from './lib/86_fixed.js'

const VER_86 = '86'
const VER_86F = '86f'

const WB_CODE_NAME = { 1: '一级简码', 2: '二级简码', 3: '三级简码', 4: '四级简码' }
const WB_TABLE_2312 = new Enum()
const WB_TABLE_GBK = new Enum()
const WB_TABLE_86F = new Enum(FIXED_86F)
const WB_WORDS = new Enum()
const WB_DY = new Enum()
const WB_EMOJI = new Enum()

Anot({
  $id: 'app',
  state: {
    gb2312: 0,
    gbk: 0,
    words: 0,
    dy: 0,
    emoji: 0,
    result: '',
    filter: {
      text: '',
      version: VER_86
    },
    dlOpt: {
      pos: 'front',
      version: VER_86,
      reverse: true,
      pinyin: true,
      tables: ['2312', 'words', 'dy']
    },
    preview: ''
  },
  mounted() {
    Promise.all([
      fetch('./data/gb2312.txt').then(r => r.text()),
      fetch('./data/gbk.txt').then(r => r.text()),
      fetch('./data/words.txt').then(r => r.text()),
      fetch('./data/dy.txt').then(r => r.text()),
      fetch('./data/extra.txt').then(r => r.text()),
      fetch('./data/emoji.txt').then(r => r.text())
    ]).then(([gb2312, gbk, words, dy, extra, emoji]) => {
      //

      gb2312.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_TABLE_2312.add(k, it)
        }
      })

      gbk.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_TABLE_GBK.add(k, it)
        }
      })
      //
      ;(words + extra).split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_WORDS.add(k, it)
        }
      })

      console.log(WB_WORDS)

      dy.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_DY.add(k, it)
        }
      })

      emoji.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_EMOJI.add(k, it)
        }
      })

      WB_TABLE_GBK.concat(WB_TABLE_2312)

      this.gb2312 = WB_TABLE_2312.length
      this.gbk = WB_TABLE_GBK.length
      this.words = WB_WORDS.length
      this.dy = WB_DY.length
      this.emoji = WB_EMOJI.length
    })
  },

  methods: {
    search() {
      var { text, version } = this.filter
      var reverse = false
      var res, resf

      text = text.trim().toLowerCase()

      if (!text) {
        this.result = ''
        return
      }

      reverse = /^[a-z]{1,4}$/.test(text)

      if (!reverse) {
        text = text.replace(/[\sa-z]/g, '')
      }

      if (reverse || text.length === 1) {
        res = [WB_TABLE_GBK.get(text)]
        if (version === VER_86F) {
          resf = [WB_TABLE_86F.get(text)]
        }
      } else {
        res = text.split('').map(t => WB_TABLE_GBK.get(t))
        if (version === VER_86F) {
          resf = text.split('').map(t => WB_TABLE_86F.get(t))
        }
      }

      if (reverse) {
        text = text.toUpperCase()
        // 反查时, 直接替换结果
        if (resf && resf[0]) {
          res = resf
        }
        if (res[0]) {
          res = `【 ${text} 】👉\t${res[0]
            .map(
              t =>
                `${t}(${(resf && resf[0] ? WB_TABLE_86F.get(t) : WB_TABLE_GBK.get(t))
                  .join('、')
                  .toUpperCase()})`
            )
            .join('\t\t')}`
        } else {
          res = `【 ${text} 】👉\t无结果, 请检查你的输入是否正确, 如果确认无误, 可以反馈缺失字库。`
        }
      } else {
        if (resf) {
          resf.forEach((it, i) => {
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
    },

    fileChange(ev) {
      var reader = new FileReader()
      var file = ev.target.files[0]
      var all = new Set()
      var unknow = new Set()

      ev.target.value = ''

      reader.onload = () => {
        let arr = reader.result
          .trim()
          .split('\n')
          .map(_ => _.trim())

        for (let it of arr) {
          it = it.replace(/[\w\s\t]+/g, '')
          all.add(it)
          if (!WB_TABLE_GBK.get(it) && !WB_WORDS.get(it) && !WB_DY.get(it)) {
            unknow.add(it)
          }
        }

        all = Array.from(all)
        unknow = Array.from(unknow)

        this.preview =
          `【${file.name}】\n本次上传, 含有 ${arr.length} 个词条(有效词条 ${all.length} 个)。\n` +
          `其中字库中已经存在 ${all.length - unknow.length}个, 未存在词条 ${
            unknow.length
          } 个, 如下:\n\n${unknow.join('\t')}`

        // window.unknow = unknow
        // console.log(unknow)

        // navigator.clipboard.writeText(Array.from(all).join('\n'))
      }

      reader.readAsText(file)
    },

    openDownloadPanel() {
      this.$refs.dl.show()
    },

    closeDownloadPanel() {
      this.$refs.dl.close()
    },

    download() {
      //
    }
  }
})
