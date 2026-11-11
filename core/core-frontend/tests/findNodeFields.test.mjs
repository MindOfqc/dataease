import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findNodeFields } from '../src/views/visualized/data/dataset/form/findNodeFields.ts'

const fields = [{ id: 'original-field' }]
const nodes = [
  {
    id: 'root',
    currentDsFields: [],
    children: [
      {
        id: 'left',
        currentDsFields: fields,
        children: [{ id: 'deep', currentDsFields: [{ id: 'deep-field' }] }]
      },
      {
        id: 'right',
        currentDsFields: [],
        children: [{ id: 'other', currentDsFields: [{ id: 'other-field' }] }]
      }
    ]
  }
]

test('retains fields found before a later sibling subtree', () => {
  const result = findNodeFields(nodes, 'left')
  assert.deepEqual(result, fields)
  assert.notEqual(result, fields)
  assert.deepEqual(findNodeFields(nodes, 'deep'), [{ id: 'deep-field' }])
})

test('finds later branches and handles unknown ids', () => {
  assert.deepEqual(findNodeFields(nodes, 'other'), [{ id: 'other-field' }])
  assert.deepEqual(findNodeFields(nodes, 'missing'), [])
})
