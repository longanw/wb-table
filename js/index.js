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

import { Enum, saveFile, SString, createCode } from './lib/core.js'
import FIXED_86F from './lib/86_fixed.js'

const VER_86 = '86'
const VER_86F = '86f'

const WB_CODE_NAME = { 1: '一级简码', 2: '二级简码', 3: '三级简码', 4: '四级简码' }
const WB_TABLE_2312 = new Enum()
const WB_TABLE_GBK = new Enum()
const WB_TABLE_GBK_TEMP = new Enum()
const WB_TABLE_86F = new Enum(FIXED_86F)
const WB_WORDS = new Enum()
const WB_DY = new Enum()
const WB_EMOJI = new Enum()
const WB_NET = new Enum()
const WB_CODE = new Enum()

Anot({
  $id: 'app',
  state: {
    gb2312: 0,
    gbk: 0,
    words: 0,
    dy: 0,
    emoji: 0,
    nethot: 0,
    code: 0,
    result: '',
    filter: {
      text: '',
      version: VER_86
    },
    dlOpt: {
      pos: 'front',
      version: VER_86,
      reverse: true,
      pinyin: false,
      tables: ['2312', 'words']
    },
    total: 0,
    preview: ''
  },

  watch: {
    'dlOpt.tables'() {
      this.calculate()
    }
  },

  mounted() {
    Promise.all([
      fetch('./data/gb2312.txt').then(r => r.text()),
      fetch('./data/gbk.txt').then(r => r.text()),
      fetch('./data/words.txt').then(r => r.text()),
      fetch('./data/dy.txt').then(r => r.text()),
      fetch('./data/emoji.txt').then(r => r.text()),
      fetch('./data/nethot.txt').then(r => r.text()),
      fetch('./data/code.txt').then(r => r.text())
    ]).then(([gb2312, gbk, words, dy, emoji, nethot, code]) => {
      //

      gb2312.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_TABLE_2312.add(k, it)
        }
      })

      // 先使用gb2312, 目的是为了词库顺序以gb2312优先
      WB_TABLE_GBK_TEMP.concat(WB_TABLE_2312)

      gbk.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_TABLE_GBK.add(k, it)
          WB_TABLE_GBK_TEMP.add(k, it)
        }
      })

      //
      words.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_WORDS.add(k, createCode(WB_TABLE_GBK_TEMP, k))
        }
      })

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

      nethot.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_NET.add(k, createCode(WB_TABLE_GBK_TEMP, k))
        }
      })
      code.split('\n').forEach(it => {
        it = it.split(' ')

        let k = it.shift()

        if (k) {
          WB_CODE.add(k, createCode(WB_TABLE_GBK_TEMP, k))
        }
      })

      this.gb2312 = WB_TABLE_2312.length
      this.gbk = WB_TABLE_GBK.length
      this.words = WB_WORDS.length
      this.dy = WB_DY.length
      this.emoji = WB_EMOJI.length
      this.nethot = WB_NET.length
      this.code = WB_CODE.length

      this.calculate()
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

      text = new SString(text)

      if (reverse || text.length === 1) {
        console.log(text, text + '')
        res = [WB_TABLE_GBK.get(text)]
        if (version === VER_86F) {
          resf = [WB_TABLE_86F.get(text)]
        }
      } else {
        res = text.split().map(t => WB_TABLE_GBK.get(t))
        if (version === VER_86F) {
          resf = text.split().map(t => WB_TABLE_86F.get(t))
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
                `${t}(<b>${(resf && resf[0] ? WB_TABLE_86F.get(t) : WB_TABLE_GBK.get(t))
                  .join('、')
                  .toUpperCase()}</b>)`
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
              return `【 ${text.at(i)} 】👉\t${it
                .map(t => `${WB_CODE_NAME[t.length]}: <b>${t.toUpperCase()}</b>`)
                .join('\t\t')}`
            } else {
              return `【 ${text.at(
                i
              )} 】👉\t无结果, 请检查你的输入是否正确, 如果确认无误, 可以反馈缺失字库。`
            }
          })
          .join('\n')
        // 词库查询
        {
          let extra =
            WB_WORDS.get(text) ||
            WB_DY.get(text) ||
            WB_EMOJI.get(text) ||
            WB_NET.get(text) ||
            WB_CODE.get(text)

          if (extra) {
            let t = extra.shift()
            res += `\n\n${'-'.repeat(6)} 词库查询结果 ${'-'.repeat(32)}\n【 ${text} 】👉\t${
              WB_CODE_NAME[t.length]
            }: <b>${t.toUpperCase()}</b>`
          }
        }
      }

      this.result = `${'-'.repeat(6)} 字库查询结果 ${'-'.repeat(32)}\n${res}`
    },

    calculate() {
      var num = this.gb2312

      if (this.dlOpt.tables.includes('gbk')) {
        num += this.gbk
      }
      num += this.words
      num += this.dy

      if (this.dlOpt.tables.includes('emoji')) {
        num += this.emoji
      }
      if (this.dlOpt.tables.includes('nethot')) {
        num += this.nethot
      }

      if (this.dlOpt.tables.includes('code')) {
        num += this.code
      }

      this.total = num
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
      var opt = { ...this.dlOpt }
      var temp = new Enum()

      temp.concat(WB_TABLE_2312)

      // 生成反查字库
      if (opt.reverse) {
        if (opt.tables.includes('gbk')) {
          let bin = new Blob([WB_TABLE_GBK_TEMP.toString()], { type: 'text/plain' })
          saveFile(bin, 'wb_table_gbk_reverse.txt')
        } else {
          let bin = new Blob([WB_TABLE_2312.toString()], { type: 'text/plain' })
          saveFile(bin, 'wb_table_gb2312_reverse.txt')
        }
      }

      // 默认词库
      temp.concat(WB_WORDS)

      // emoji表情
      if (opt.tables.includes('emoji')) {
        temp.concat(WB_EMOJI)
      }

      // 网络热词
      if (opt.tables.includes('nethot')) {
        temp.concat(WB_NET)
      }

      // 计算机术语
      if (opt.tables.includes('code')) {
        temp.concat(WB_CODE)
      }

      // gbk 大字符集, 顺序往后调
      if (opt.tables.includes('gbk')) {
        temp.concat(WB_TABLE_GBK)
      }

      // 异形字库
      if (opt.tables.includes('dy')) {
        temp.concat(WB_DY)
      }

      // 暂未支持
      // if (opt.tables.includes('personal')) {
      //   temp.concat(WB_PERSONAL)
      // }

      let bin = new Blob([temp.toString(opt.pos === 'front')], { type: 'text/plain' })
      saveFile(bin, `wb_table_${opt.pos}.txt`)

      this.closeDownloadPanel()
    }
  }
})
