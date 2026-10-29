import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

import { JSDOM } from 'jsdom'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'

const report = {
  version: 1,
  date: '2026-10-29',
  period: { from: '2026-10-28', to: '2026-10-28' },
  status: 'completed',
  durationSec: 111.6,
  syncedAt: '2026-10-29T08:30:00.000Z',
  summary: {
    tenantTotal: 361,
    modelTotal: 2,
    dual: 1,
    negative: 1,
    codeAnomalies: 1,
    focus: 1,
    projects: 1,
  },
  tenants: [
    {
      meterId: 1523,
      name: '示例商户B',
      project: '示例项目',
      building: '示例项目',
      floor: '',
      isTenant: true,
      nightActual: 8,
      nightPred: 102.456,
      nightExcess: -94.456,
      nightScore: 31.5,
      q10: 60.239,
      q90: 163.053,
      scoreQ: 4.5,
      cleanedNights: 5,
      predCapped: false,
      regimeChange: false,
      heuristicHit: false,
      prevAbnormal: false,
      model: true,
      negative: false,
      focus: false,
      tags: ['model'],
    },
    {
      meterId: 2436,
      name: '示例商户C(示例项目)',
      project: '示例项目',
      building: '示例项目',
      floor: '',
      isTenant: true,
      nightActual: 394.8,
      nightPred: 572.242,
      nightExcess: -177.442,
      nightScore: 2.5,
      q10: 436.647,
      q90: 738.741,
      scoreQ: 3.7,
      cleanedNights: 8,
      predCapped: false,
      regimeChange: false,
      heuristicHit: true,
      prevAbnormal: true,
      model: true,
      negative: true,
      focus: true,
      tags: ['model', 'negative', 'focus', 'heuristic', 'prev'],
    },
  ],
  code: [
    {
      id: '22-6609-abnormal_usage-0',
      meterId: 6609,
      name: '示例商户A',
      project: '示例项目',
      building: '示例项目',
      floor: 'B1层',
      room: '示例商户A',
      category: 'abnormal_usage',
      categoryLabel: '夜间用电异常',
      severity: 'medium',
      description: '夜间用电占比 76%，夜间用量 452.8 kWh',
      metrics: { nightDelta: 452.8, nightRatio: 0.755, totalDelta: 599.6, delta: null, readingsCount: null },
    },
  ],
  availableDates: ['2026-10-29', '2026-10-28'],
  warnings: [],
}

const curve = {
  meterId: 2436,
  date: '2026-10-29',
  from: '2026-10-26',
  to: '2026-10-28',
  days: [
    {
      date: '2026-10-28',
      hours: Array.from({ length: 24 }, (_, hour) => ({ h: hour, actual: hour === 5 ? 128 : hour > 8 ? 20 + hour : 0 })),
      pred: Array.from({ length: 24 }, (_, hour) => ({ h: hour, pred: hour === 5 ? 45 : 30, q10: 10, q90: 60 })),
      night: { actual: 16, pred: 103.48, excess: -87.48, score: 29.159, dual: false },
    },
  ],
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

test('renders the business dashboard and switches to the model filter', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://127.0.0.1:43129/',
    pretendToBeVisual: true,
  })
  const { window } = dom
  const rootElement = window.document.getElementById('root')

  global.window = window
  global.document = window.document
  global.HTMLElement = window.HTMLElement
  global.Node = window.Node
  global.Event = window.Event
  global.IS_REACT_ACT_ENVIRONMENT = true

  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const path = new URL(String(url), 'http://127.0.0.1:43129').pathname
    if (path.endsWith('/api/electric-safety/status')) {
      return json({
        configured: true,
        baseUrl: 'https://energy.example.com',
        username: 'tester',
        displayName: '测试用户',
        connectedAt: '2026-10-29T08:00:00.000Z',
        lastSync: '2026-10-29T08:30:00.000Z',
        lastSuccess: '2026-10-29T08:30:00.000Z',
        reportDate: '2026-10-29',
        stale: false,
        syncing: false,
        error: null,
        availableDates: ['2026-10-29', '2026-10-28'],
      })
    }
    if (path.endsWith('/api/electric-safety/report')) {
      return json({
        ok: true,
        report,
        status: { configured: true, stale: false, syncing: false, error: null },
      })
    }
    if (path.endsWith('/api/electric-safety/curve')) {
      return json({ ok: true, curve, cached: false })
    }
    return json({ error: `unexpected ${path}` }, 404)
  }

  let loaded = null
  window.__ModuleLoader__ = {
    load(entry) {
      loaded = entry
    },
  }
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  window.eval(source)
  assert.ok(loaded, 'bundle should register with the module loader')

  const plugin = loaded.factory((name) => {
    assert.equal(name, 'react')
    return React
  })

  let Panel = null
  const fakeService = {
    currentSession: () => null,
    ownsSession: () => false,
    defaultWorkspace: () => null,
    newWorkspaceSession: () => Promise.resolve(null),
    run: () => {},
  }
  plugin.apply({
    sessions: {},
    conversation: {},
    desktopWorkbenches: {
      register(_descriptor, Component) {
        Panel = Component
        return () => {}
      },
    },
    effect(callback) {
      callback()
    },
  })
  assert.equal(typeof Panel, 'function')

  const root = createRoot(rootElement)
  await act(async () => {
    root.render(React.createElement(Panel, {
      service: fakeService,
      entry: {},
      active: true,
      conversation: null,
      host: { sessions: { binding: () => null }, conversation: {} },
    }))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 80))
  })

  const text = rootElement.textContent || ''
  assert.match(text, /用电安全助手/)
  assert.match(text, /重点关注/)
  assert.match(text, /示例商户C/)
  assert.match(text, /代码侧异常/)
  assert.ok(rootElement.querySelector('[data-dsh-workbench-toolbar]'), 'compact toolbar marker should exist')
  assert.ok(rootElement.querySelector('svg.esaChart'), 'tenant curve should render as SVG')

  const modelButton = [...rootElement.querySelectorAll('button')].find((button) => button.textContent.includes('模型偏离'))
  assert.ok(modelButton, 'model summary/filter control should exist')
  await act(async () => {
    modelButton.click()
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50))
  })
  assert.match(rootElement.textContent || '', /示例商户B/)
  globalThis.fetch = originalFetch
})
test('renders the guided connection form when status is unconfigured', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://127.0.0.1:43129/',
    pretendToBeVisual: true,
  })
  const { window } = dom
  const rootElement = window.document.getElementById('root')

  global.window = window
  global.document = window.document
  global.HTMLElement = window.HTMLElement
  global.Node = window.Node
  global.Event = window.Event
  global.IS_REACT_ACT_ENVIRONMENT = true

  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const path = new URL(String(url), 'http://127.0.0.1:43129').pathname
    if (path.endsWith('/api/electric-safety/status')) {
      return json({
        configured: false,
        baseUrl: 'https://energy.example.com',
        username: null,
        displayName: null,
        connectedAt: null,
        lastSync: null,
        lastSuccess: null,
        reportDate: null,
        stale: true,
        syncing: false,
        error: null,
        availableDates: [],
      })
    }
    return json({ error: `unexpected ${path}` }, 404)
  }

  let loaded = null
  window.__ModuleLoader__ = { load(entry) { loaded = entry } }
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  window.eval(source)
  const plugin = loaded.factory(() => React)

  let Panel = null
  plugin.apply({
    sessions: {},
    conversation: {},
    desktopWorkbenches: { register(_descriptor, Component) { Panel = Component; return () => {} } },
    effect(callback) { callback() },
  })

  const root = createRoot(rootElement)
  await act(async () => {
    root.render(React.createElement(Panel, {
      service: {
        currentSession: () => 'session-test',
        ownsSession: () => { throw new Error('Workbench registration requires a client package entry name.') },
        defaultWorkspace: () => null,
        newWorkspaceSession: () => Promise.resolve(null),
        run: () => {},
      },
      entry: {},
      active: true,
      conversation: null,
      host: { sessions: { binding: () => null }, conversation: {} },
    }))
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60))
  })

  const text = rootElement.textContent || ''
  assert.match(text, /连接能源系统，开始每日自检/)
  assert.match(text, /connection\.env/)
  assert.match(text, /连接并同步/)
  globalThis.fetch = originalFetch
})
