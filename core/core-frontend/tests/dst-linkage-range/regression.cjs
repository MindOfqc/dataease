const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { spawnSync } = require('node:child_process')

if (process.argv[2] === '--check-zone') {
  const source = fs.readFileSync(path.join(__dirname, '../../src/utils/timeUitils.ts'), 'utf8')
  const context = { Date }
  vm.runInNewContext(source.replaceAll('export const', 'const') + '\nglobalThis.getRange = getRange', context)
  const cases = [
    [2026, 2, 8], [2026, 10, 1], // New York
    [2026, 2, 29], [2026, 9, 25], // London
    [2026, 3, 5], [2026, 9, 4], // Sydney
    [2026, 8, 6], // Santiago skips local midnight
    [2026, 1, 28], [2024, 1, 29], [2026, 11, 31]
  ]
  for (const [year, month, day] of cases) {
    const input = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const expected = [
      new Date(year, month, day).getTime(),
      new Date(year, month, day + 1).getTime() - 1000
    ]
    for (const style of ['date', 'y_M_d']) {
      assert.deepEqual(
        Array.from(context.getRange(input, style)), expected, `${process.env.TZ} ${input} ${style}`
      )
    }
  }
  assert.equal(context.getRange('invalid-date', 'date'), 'invalid-date')
  const withTime = Array.from(context.getRange('2026-02-17T12:34:56.789Z', 'date'))
  assert.deepEqual(withTime, [
    new Date(2026, 1, 17, 12, 34, 56).getTime(),
    new Date(2026, 1, 18, 12, 34, 56).getTime() - 1000
  ])
  const slashInput = new Date('2026/02/17')
  const slashStart = new Date(
    slashInput.getUTCFullYear(), slashInput.getUTCMonth(), slashInput.getUTCDate(),
    slashInput.getUTCHours(), slashInput.getUTCMinutes(), slashInput.getUTCSeconds()
  )
  assert.deepEqual(Array.from(context.getRange('2026/02/17', 'y_M_d')), [
    slashStart.getTime(), slashStart.getTime() + 24 * 60 * 60 * 1000 - 1000
  ])
  assert.deepEqual(Array.from(context.getRange(0, 'date')), [0, 24 * 60 * 60 * 1000 - 1000])
} else {
  for (const zone of [
    'America/New_York', 'Europe/London', 'Australia/Sydney', 'America/Santiago', 'Asia/Shanghai'
  ]) {
    test(`date linkage covers the local calendar day in ${zone}`, () => {
      const result = spawnSync(process.execPath, [__filename, '--check-zone'], {
        encoding: 'utf8', env: { ...process.env, TZ: zone }
      })
      assert.equal(result.status, 0, result.stderr || result.stdout)
    })
  }
}
