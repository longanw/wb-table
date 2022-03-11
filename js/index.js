/**
 *
 * @author yutent<yutent.io@gmail.com>
 * @date 2022/03/11 12:03:59
 */

import '//unpkg.yutent.top/anot/dist/anot.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/input.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/button.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/radio.js'
import '//unpkg.yutent.top/@bytedo/wcui/dist/form/switch.js'
import fetch from '//unpkg.yutent.top/@bytedo/fetch/dist/index.js'

const WB_TABLE = {}

Anot.hideProperty(WB_TABLE, 'length', 0)

Anot({
  $id: 'app',
  state: {
    single: 222,
    words: 0
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
            WB_TABLE[k] = it
            WB_TABLE.length++
          }
        })

        this.single = WB_TABLE.length
      })
  }
})
