import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  apply,
  buildReport,
  flattenCodeAnomalies,
  mergeTenants,
  normalizeBaseUrl,
  normalizeCurve,
} from '../dsh/index.js'

const root = await mkdtemp(join(tmpdir(), 'esa-server-test-'))
const originalFetch = globalThis.fetch
const calls = []

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function installFetchMock() {
  globalThis.fetch = async (url, init = {}) => {
    const target = String(url)
    calls.push({ url: target, init })
    if (target.endsWith('/api/auth/login')) {
      return jsonResponse({
        access_token: 'test-token',
        user: { display_name: '测试用户', username: 'tester' },
      })
    }
    if (target.includes('/api/ai-check/results?limit=100')) {
      return jsonResponse([
        {
          id: 84,
          run_date: '2026-10-29',
          period_from: '2026-10-28',
          period_to: '2026-10-28',
          status: 'completed',
          duration_sec: 111.6,
        },
        {
          id: 83,
          run_date: '2026-10-28',
          period_from: '2026-10-27',
          period_to: '2026-10-27',
          status: 'completed',
          duration_sec: 112.4,
        },
        {
          id: 82,
          run_date: '2026-10-27',
          period_from: '2026-10-26',
          period_to: '2026-10-26',
          status: 'failed',
          duration_sec: 20,
        },
      ])
    }
    if (target.endsWith('/api/ai-check/results/84')) {
      return jsonResponse({
        id: 84,
        code_anomalies: [
          {
            project_id: 22,
            project_name: '示例项目',
            anomalies: [
              {
                meter_id: 6609,
                meter_name: '示例商户A',
                room: '示例商户A',
                floor: 'B1层',
                building: '示例项目',
                category: 'abnormal_usage',
                severity: 'medium',
                description: '夜间用电占比 76%，夜间用量 452.8 kWh',
                metrics: { night_delta: 452.8, night_ratio: 0.755, total_delta: 599.6 },
              },
              {
                meter_id: 6816,
                meter_name: '示例仪表A',
                room: '示例房间',
                floor: '9层',
                building: '示例项目',
                category: 'meter_fault',
                severity: 'medium',
                description: '仪表有读数但用电量为0，可能停转或故障',
                metrics: { delta: 0, readings_count: 13 },
              },
            ],
          },
        ],
      })
    }
    if (target.includes('/api/ai-check/timesnet')) {
      return jsonResponse({
        date: '2026-10-29',
        total: 2,
        tenant_total: 361,
        dual: 1,
        top: [
          {
            meter_id: 1523,
            meter_name: '示例商户B',
            project_name: '示例项目',
            is_tenant: true,
            night_actual: 8,
            night_pred: 102.456,
            night_excess: -94.456,
            night_score: 31.5,
            heuristic_hit: false,
            night_q10: 60.239,
            night_q90: 163.053,
            night_score_q: 4.5,
            prev_abnormal: false,
            cleaned_nights: 5,
            pred_capped: false,
            regime_change: false,
          },
          {
            meter_id: 2436,
            meter_name: '示例商户C(示例项目)',
            project_name: '示例项目',
            is_tenant: true,
            night_actual: 394.8,
            night_pred: 572.242,
            night_excess: -177.442,
            night_score: 2.5,
            heuristic_hit: true,
            night_q10: 436.647,
            night_q90: 738.741,
            night_score_q: 3.7,
            prev_abnormal: true,
            cleaned_nights: 8,
            pred_capped: false,
            regime_change: false,
          },
        ],
        negative: [
          {
            meter_id: 2436,
            meter_name: '示例商户C(示例项目)',
            project_name: '示例项目',
            is_tenant: true,
            night_actual: 394.8,
            night_pred: 572.242,
            night_excess: -177.442,
            night_score: 2.5,
            heuristic_hit: true,
            night_q10: 436.647,
            night_q90: 738.741,
            night_score_q: 3.7,
            prev_abnormal: true,
            cleaned_nights: 8,
            pred_capped: false,
            regime_change: false,
          },
        ],
      })
    }
    if (target.includes('/api/forecast/meter-curve')) {
      return jsonResponse({
        from: '2026-10-26',
        to: '2026-10-28',
        days: [
          {
            date: '2026-10-28',
            hours: [
              { h: 0, actual: 0 },
              { h: 1, actual: 0 },
              { h: 5, actual: 128 },
              { h: 6, actual: 22 },
            ],
            pred: [{ h: 0, pred: 16.79, q10: 13.18, q90: 21.43 }],
            night: { actual: 16, pred: 103.48, excess: -87.48, score: 29.159, dual: false },
          },
        ],
      })
    }
    return jsonResponse({ detail: 'unexpected mock request' }, 404)
  }
}

let handlers
let fakeCtx

before(() => {
  installFetchMock()
  handlers = new Map()
  fakeCtx = {
    connection: {
      fetch: {
        register(definition) {
          handlers.set(definition.path, definition.fetch)
        },
      },
    },
    effect() {
      /* Do not start the background scheduler in this unit test. */
    },
  }
  apply(fakeCtx, { root })
})

after(async () => {
  globalThis.fetch = originalFetch
  await rm(root, { recursive: true, force: true })
})

async function call(path, { method = 'GET', body } = {}) {
  const pathname = new URL(`http://127.0.0.1${path}`).pathname
  const handler = handlers.get(pathname)
  assert.ok(handler, `route ${pathname} should be registered`)
  const request = new Request(`http://127.0.0.1${path}`, {
    method,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const response = await handler(request)
  const payload = await response.json()
  return { status: response.status, payload }
}

test('normalizes upstream URLs and rejects non-http schemes', () => {
  assert.equal(normalizeBaseUrl('https://energy.example.com/'), 'https://energy.example.com')
  assert.equal(normalizeBaseUrl('https://example.com/api/'), 'https://example.com/api')
  assert.throws(() => normalizeBaseUrl('file:///tmp/data'), /http/)
})

test('merges top and negative tenants, preserving focus badges', () => {
  const tenants = mergeTenants(
    [
      {
        meter_id: 1523,
        meter_name: '示例商户B',
        project_name: '示例项目',
        night_actual: 8,
        night_pred: 102.5,
        night_excess: -94.5,
        night_score: 31.5,
      },
      {
        meter_id: 2436,
        meter_name: '示例商户C',
        project_name: '示例项目',
        night_actual: 394.8,
        night_pred: 572.2,
        night_excess: -177.4,
        night_score: 2.5,
        heuristic_hit: true,
      },
    ],
    [
      {
        meter_id: 2436,
        meter_name: '示例商户C',
        project_name: '示例项目',
        night_actual: 394.8,
        night_pred: 572.2,
        night_excess: -177.4,
        night_score: 2.5,
        heuristic_hit: true,
        prev_abnormal: true,
      },
    ],
  )
  assert.equal(tenants.length, 2)
  const haidilao = tenants.find((tenant) => tenant.meterId === 2436)
  assert.equal(haidilao.negative, true)
  assert.equal(haidilao.focus, true)
  assert.equal(haidilao.heuristicHit, true)
  assert.ok(haidilao.tags.includes('negative'))
  assert.ok(haidilao.tags.includes('focus'))
})

test('flattens code anomalies with readable labels', () => {
  const code = flattenCodeAnomalies({
    code_anomalies: [
      {
        project_id: 22,
        project_name: '示例项目',
        anomalies: [
          {
            meter_id: 6609,
            meter_name: '示例商户A',
            category: 'abnormal_usage',
            metrics: { night_ratio: 0.76 },
          },
          {
            meter_id: 6816,
            meter_name: '示例仪表A',
            category: 'meter_fault',
            metrics: { delta: 0, readings_count: 13 },
          },
        ],
      },
    ],
  })
  assert.equal(code.length, 2)
  assert.equal(code[0].categoryLabel, '夜间用电异常')
  assert.equal(code[1].categoryLabel, '计量 / 通讯故障')
})

test('builds a normalized report with dates and warnings', () => {
  const report = buildReport({
    target: {
      run_date: '2026-10-29',
      period_from: '2026-10-28',
      period_to: '2026-10-28',
      status: 'completed',
      duration_sec: 111.6,
    },
    detail: {
      code_anomalies: [
        {
          project_name: '示例项目',
          anomalies: [{ meter_id: 6609, meter_name: '示例商户A', category: 'abnormal_usage' }],
        },
      ],
    },
    timesnet: {
      tenant_total: 361,
      dual: 2,
      top: [{ meter_id: 1523, meter_name: '示例商户B', night_score: 31.5, night_excess: -94.5 }],
      negative: [{ meter_id: 2436, meter_name: '示例商户C', night_excess: -177.4 }],
    },
    results: [
      { run_date: '2026-10-29', status: 'completed' },
      { run_date: '2026-10-28', status: 'completed' },
      { run_date: '2026-10-27', status: 'failed' },
    ],
    syncedAt: '2026-10-29T08:00:00.000Z',
  })
  assert.equal(report.summary.tenantTotal, 361)
  assert.equal(report.summary.modelTotal, 1)
  assert.equal(report.summary.dual, 2)
  assert.equal(report.summary.negative, 1)
  assert.equal(report.summary.codeAnomalies, 1)
  assert.deepEqual(report.availableDates, ['2026-10-29', '2026-10-28'])
  assert.equal(report.warnings.length, 0)
})

test('normalizes meter curve payloads', () => {
  const curve = normalizeCurve(
    {
      from: '2026-10-26',
      to: '2026-10-28',
      days: [
        {
          date: '2026-10-28',
          hours: [{ h: 5, actual: 128 }],
          pred: [{ h: 5, pred: 33.65, q10: 10.47, q90: 61.57 }],
          night: { actual: 16, pred: 103.48, excess: -87.48, score: 29.159, dual: false },
        },
      ],
    },
    1523,
    '2026-10-29',
  )
  assert.equal(curve.meterId, 1523)
  assert.equal(curve.days[0].hours[0].actual, 128)
  assert.equal(curve.days[0].pred[0].q90, 61.57)
  assert.equal(curve.days[0].night.score, 29.159)
})

test('walks the local connect, report, curve, and disconnect flow', async () => {
  const initial = await call('/api/electric-safety/status')
  assert.equal(initial.status, 200)
  assert.equal(initial.payload.configured, false)

  const connected = await call('/api/electric-safety/connect', {
    method: 'POST',
    body: {
      baseUrl: 'https://energy.example.com',
      username: 'tester',
      password: 'p@ss"word',
    },
  })
  assert.equal(connected.status, 200)
  assert.equal(connected.payload.ok, true)
  assert.equal(connected.payload.status.configured, true)
  assert.equal(connected.payload.report.date, '2026-10-29')
  assert.equal(connected.payload.report.summary.codeAnomalies, 2)
  assert.equal(connected.payload.report.summary.tenantTotal, 361)

  const credentialsText = await readFile(join(root, 'connection.env'), 'utf8')
  assert.match(credentialsText, /ENERGY_USERNAME="tester"/)
  assert.ok(credentialsText.includes('ENERGY_PASSWORD='))
  const credentialsMode = (await stat(join(root, 'connection.env'))).mode & 0o777
  assert.equal(credentialsMode, 0o600)

  const report = await call('/api/electric-safety/report?date=2026-10-29')
  assert.equal(report.status, 200)
  assert.equal(report.payload.report.tenants.length, 2)

  const curve = await call('/api/electric-safety/curve?meter_id=1523&date=2026-10-29')
  assert.equal(curve.status, 200)
  assert.equal(curve.payload.curve.meterId, 1523)
  assert.equal(curve.payload.curve.days[0].hours.find((point) => point.h === 5)?.actual, 128)

  const authHeaders = calls
    .filter((entry) => entry.url.includes('/api/ai-check/results?limit=100'))
    .map((entry) => entry.init.headers?.authorization)
  assert.ok(authHeaders.every((value) => value === 'Bearer test-token'))

  const disconnected = await call('/api/electric-safety/disconnect', {
    method: 'POST',
    body: {},
  })
  assert.equal(disconnected.status, 200)
  assert.equal(disconnected.payload.status.configured, false)
  await assert.rejects(readFile(join(root, 'connection.env'), 'utf8'))
  const cached = await call('/api/electric-safety/report')
  assert.equal(cached.status, 200)
  assert.equal(cached.payload.report.date, '2026-10-29')
})

test('rejects sync before a connection exists', async () => {
  const response = await call('/api/electric-safety/sync', { method: 'POST', body: {} })
  assert.equal(response.status, 400)
  assert.match(response.payload.error, /还没有连接能源系统/)
})