export function createPanel(React) {
  const h = React.createElement
  const { useCallback, useEffect, useMemo, useRef, useState } = React

  const API = '/api/electric-safety'
  const DEFAULT_BASE_URL = 'https://energy.example.com'

  const numberFormatter = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 })
  const integerFormatter = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 })

  function cx(...values) {
    return values.filter(Boolean).join(' ')
  }

  function fmtNumber(value, digits = 1) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
    return value.toLocaleString('zh-CN', { maximumFractionDigits: digits })
  }

  function fmtKwh(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
    return `${numberFormatter.format(value)} kWh`
  }

  function fmtSigned(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
    return `${value > 0 ? '+' : ''}${numberFormatter.format(value)}`
  }

  function fmtPercent(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
    return `${Math.round(value * 100)}%`
  }

  function fmtCount(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
    return integerFormatter.format(value)
  }

  function fmtTime(value) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }

  function fmtDateTime(value) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)
  }

  function shortDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''))
    return match ? `${match[2]}-${match[3]}` : value || '—'
  }

  function scoreTone(score) {
    if (typeof score !== 'number' || !Number.isFinite(score)) return ''
    if (score >= 3) return 'risk'
    if (score >= 1.5) return 'warn'
    return ''
  }

  function StatusDot({ tone }) {
    return h('span', { className: cx('esaDot', tone ? `esaDot--${tone}` : ''), 'aria-hidden': 'true' })
  }

  function Icon({ name, size = 16, className }) {
    const common = {
      width: size,
      height: size,
      className,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.75,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    }
    switch (name) {
      case 'bolt':
        return h('svg', common, h('path', { d: 'M13 2 4.6 13.4h6.2L10 22l8.4-11.4h-6.2L13 2Z', fill: 'currentColor', stroke: 'none' }))
      case 'shield':
        return h('svg', common, h('path', { d: 'M12 3 5 6v5.2c0 4.3 2.9 7.5 7 9.8 4.1-2.3 7-5.5 7-9.8V6l-7-3Z' }), h('path', { d: 'm9.2 12.1 1.9 1.9 3.8-4' }))
      case 'refresh':
        return h('svg', common, h('path', { d: 'M20 6v5h-5' }), h('path', { d: 'M4 18v-5h5' }), h('path', { d: 'M6.1 9.2A7 7 0 0 1 18.4 7.7L20 11' }), h('path', { d: 'M17.9 14.8A7 7 0 0 1 5.6 16.3L4 13' }))
      case 'sparkles':
        return h('svg', common, h('path', { d: 'm12 3 1.3 4.1L17.5 8.5l-4.2 1.4L12 14l-1.3-4.1-4.2-1.4 4.2-1.4L12 3Z' }), h('path', { d: 'm18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z' }))
      case 'settings':
        return h('svg', common, h('path', { d: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z' }), h('path', { d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z' }))
      case 'search':
        return h('svg', common, h('circle', { cx: 11, cy: 11, r: 6.5 }), h('path', { d: 'm16 16 4 4' }))
      case 'close':
        return h('svg', common, h('path', { d: 'm6 6 12 12M18 6 6 18' }))
      case 'arrow':
        return h('svg', common, h('path', { d: 'M5 12h14M13 6l6 6-6 6' }))
      case 'chevron':
        return h('svg', common, h('path', { d: 'm6 9 6 6 6-6' }))
      case 'chart':
        return h('svg', common, h('path', { d: 'M4 19V5M4 19h16' }), h('path', { d: 'm7 15 3.2-3.2 2.6 2.1L18 8' }), h('path', { d: 'M18 8h-3.2M18 8v3.2' }))
      case 'alert':
        return h('svg', common, h('path', { d: 'M12 3 2.8 20h18.4L12 3Z' }), h('path', { d: 'M12 9v4.5M12 17h.01' }))
      case 'info':
        return h('svg', common, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M12 11v5M12 8h.01' }))
      case 'clock':
        return h('svg', common, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M12 7v5l3 2' }))
      case 'building':
        return h('svg', common, h('path', { d: 'M4 21V4h10v17M14 9h6v12M7 8h4M7 12h4M7 16h4M17 13h.01M17 17h.01' }))
      case 'users':
        return h('svg', common, h('circle', { cx: 9, cy: 8, r: 3.2 }), h('path', { d: 'M3.5 20c.4-3.2 2.4-5 5.5-5s5.1 1.8 5.5 5' }), h('path', { d: 'M16 5.5a3 3 0 0 1 0 5.8M17.5 15c2 .5 3.2 2.1 3.5 4.5' }))
      case 'link':
        return h('svg', common, h('path', { d: 'M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2' }), h('path', { d: 'M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2' }))
      default:
        return h('svg', common, h('circle', { cx: 12, cy: 12, r: 8 }))
    }
  }

  function Badge({ tone, children }) {
    return h('span', { className: cx('esaBadge', tone ? `esaBadge--${tone}` : '') }, children)
  }

  function TenantBadges({ tenant }) {
    const badges = []
    if (tenant.heuristicHit) badges.push(h(Badge, { key: 'dual', tone: 'dual' }, '双命中'))
    if (tenant.prevAbnormal) badges.push(h(Badge, { key: 'prev', tone: 'prev' }, '连续偏离'))
    if (tenant.negative) badges.push(h(Badge, { key: 'negative', tone: 'negative' }, '负向偏离'))
    if (tenant.model && !tenant.heuristicHit && !tenant.prevAbnormal) {
      badges.push(h(Badge, { key: 'model', tone: 'model' }, '模型偏离'))
    }
    return h('div', { className: 'esaBadges' }, ...badges)
  }

  function chartSeries(curve) {
    const days = Array.isArray(curve?.days) ? curve.days.slice(-3) : []
    if (!days.length) return null
    const count = days.length * 24
    const actual = new Array(count).fill(null)
    const predicted = new Array(count).fill(null)
    const q10 = new Array(count).fill(null)
    const q90 = new Array(count).fill(null)
    days.forEach((day, dayIndex) => {
      for (const point of Array.isArray(day.hours) ? day.hours : []) {
        const hour = Number(point?.h)
        if (hour < 0 || hour > 23) continue
        actual[dayIndex * 24 + hour] = typeof point.actual === 'number' ? point.actual : null
      }
      for (const point of Array.isArray(day.pred) ? day.pred : []) {
        const hour = Number(point?.h)
        if (hour < 0 || hour > 23) continue
        const index = dayIndex * 24 + hour
        predicted[index] = typeof point.pred === 'number' ? point.pred : null
        q10[index] = typeof point.q10 === 'number' ? point.q10 : null
        q90[index] = typeof point.q90 === 'number' ? point.q90 : null
      }
    })
    const values = [...actual, ...predicted, ...q90].filter((value) => typeof value === 'number' && Number.isFinite(value))
    const maxY = Math.max(1, ...values) * 1.08
    return { days, count, actual, predicted, q10, q90, maxY }
  }

  function pathFromSeries(values, xScale, yScale) {
    let path = ''
    let open = false
    values.forEach((value, index) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        open = false
        return
      }
      const command = open ? 'L' : 'M'
      path += `${command}${xScale(index).toFixed(2)},${yScale(value).toFixed(2)} `
      open = true
    })
    return path.trim()
  }

  function Chart({ curve, mode = 'compact', tenantName }) {
    const series = chartSeries(curve)
    if (!series) {
      return h('div', { className: 'esaChartEmpty' }, '暂无曲线数据')
    }
    const detail = mode === 'detail'
    const width = detail ? 860 : 600
    const height = detail ? 300 : 150
    const pad = detail ? { left: 48, right: 16, top: 14, bottom: 34 } : { left: 4, right: 4, top: 6, bottom: 4 }
    const plotWidth = width - pad.left - pad.right
    const plotHeight = height - pad.top - pad.bottom
    const xScale = (index) => pad.left + (series.count <= 1 ? 0 : (index / (series.count - 1)) * plotWidth)
    const yScale = (value) => pad.top + plotHeight - (value / series.maxY) * plotHeight
    const actualPath = pathFromSeries(series.actual, xScale, yScale)
    const predictedPath = pathFromSeries(series.predicted, xScale, yScale)
    const bandPoints = []
    for (let index = 0; index < series.count; index += 1) {
      if (typeof series.q10[index] === 'number' && typeof series.q90[index] === 'number') {
        bandPoints.push({ index, low: series.q10[index], high: series.q90[index] })
      }
    }
    let bandPath = ''
    if (bandPoints.length > 1) {
      bandPath = `M${bandPoints.map((point) => `${xScale(point.index).toFixed(2)},${yScale(point.high).toFixed(2)}`).join(' L')} L${[...bandPoints].reverse().map((point) => `${xScale(point.index).toFixed(2)},${yScale(point.low).toFixed(2)}`).join(' L')} Z`
    }
    const nightRects = series.days.map((day, dayIndex) => {
      const start = xScale(dayIndex * 24)
      const end = xScale(dayIndex * 24 + 6)
      return h('rect', {
        key: `night-${day.date}`,
        x: start,
        y: pad.top,
        width: Math.max(0, end - start),
        height: plotHeight,
        fill: 'var(--esa-chart-night)',
      })
    })
    const separators = series.days.slice(1).map((day, index) => {
      const x = xScale((index + 1) * 24)
      return h('line', {
        key: `sep-${day.date}`,
        x1: x,
        x2: x,
        y1: pad.top,
        y2: pad.top + plotHeight,
        stroke: 'var(--esa-line)',
        strokeWidth: 1,
        vectorEffect: 'non-scaling-stroke',
      })
    })
    const grid = []
    if (detail) {
      for (let step = 0; step <= 4; step += 1) {
        const value = (series.maxY / 4) * step
        const y = yScale(value)
        grid.push(h('line', {
          key: `grid-${step}`,
          x1: pad.left,
          x2: width - pad.right,
          y1: y,
          y2: y,
          stroke: 'var(--esa-line-2)',
          strokeWidth: 1,
          vectorEffect: 'non-scaling-stroke',
        }))
        grid.push(h('text', {
          key: `grid-label-${step}`,
          x: pad.left - 8,
          y: y + 4,
          textAnchor: 'end',
          fill: 'var(--esa-ink-3)',
          fontSize: 10,
        }, fmtNumber(value, 0)))
      }
      series.days.forEach((day, dayIndex) => {
        grid.push(h('text', {
          key: `day-label-${day.date}`,
          x: xScale(dayIndex * 24 + 12),
          y: height - 10,
          textAnchor: 'middle',
          fill: 'var(--esa-ink-3)',
          fontSize: 10,
        }, shortDate(day.date)))
      })
    }
    return h('svg', {
      className: cx('esaChart', detail && 'esaChart--detail'),
      viewBox: `0 0 ${width} ${height}`,
      role: 'img',
      'aria-label': `${tenantName || '租户'} 实际用电与模型预测曲线`,
    },
      h('rect', { x: 0, y: 0, width, height, fill: 'transparent' }),
      ...nightRects,
      ...separators,
      ...grid,
      bandPath ? h('path', { d: bandPath, fill: 'var(--esa-chart-band)', stroke: 'none' }) : null,
      predictedPath ? h('path', {
        d: predictedPath,
        fill: 'none',
        stroke: 'var(--esa-chart-pred)',
        strokeWidth: 1.6,
        strokeDasharray: '5 4',
        vectorEffect: 'non-scaling-stroke',
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
      }) : null,
      actualPath ? h('path', {
        d: actualPath,
        fill: 'none',
        stroke: 'var(--esa-chart-actual)',
        strokeWidth: 2,
        vectorEffect: 'non-scaling-stroke',
        strokeLinejoin: 'round',
        strokeLinecap: 'round',
      }) : null,
    )
  }

  function ChartLegend() {
    return h('div', { className: 'esaChartLegend' },
      h('span', { className: 'esaLegendItem' }, h('span', { className: 'esaLegendSwatch', style: { background: 'var(--esa-chart-actual)' } }), '实际用电'),
      h('span', { className: 'esaLegendItem' }, h('span', { className: 'esaLegendSwatch', style: { background: 'var(--esa-chart-pred)' } }), '模型预测'),
      h('span', { className: 'esaLegendItem' }, h('span', { className: 'esaLegendSwatch esaLegendSwatch--band' }), '80% 区间'),
      h('span', { className: 'esaLegendItem' }, h('span', { className: 'esaLegendSwatch esaLegendSwatch--night' }), '00–06 深夜窗'),
    )
  }

  function ChartArea({ meterId, curveState, onLoad, onRetry, tenantName, detail = false }) {
    const ref = useRef(null)
    useEffect(() => {
      const node = ref.current
      if (!node || !meterId) return
      let triggered = false
      const trigger = () => {
        if (triggered) return
        triggered = true
        onLoad(meterId)
      }
      if (typeof IntersectionObserver === 'undefined') {
        trigger()
        return
      }
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trigger()
          observer.disconnect()
        }
      }, { rootMargin: detail ? '0px' : '280px 0px' })
      observer.observe(node)
      return () => observer.disconnect()
    }, [detail, meterId, onLoad])

    let body
    if (curveState?.data) {
      body = h(Chart, { curve: curveState.data, mode: detail ? 'detail' : 'compact', tenantName })
    } else if (curveState?.error) {
      body = h('div', { className: 'esaChartError' },
        h('span', null, '曲线加载失败'),
        h('button', { type: 'button', className: 'esaTextBtn', onClick: () => onRetry(meterId) }, '重试'),
      )
    } else if (curveState?.loading || meterId) {
      body = h('div', { className: 'esaChartSkeleton' })
    } else {
      body = h('div', { className: 'esaChartEmpty' }, '该异常没有可用的仪表曲线')
    }

    if (detail) {
      return h('div', { ref, className: 'esaChartWrap--detail' },
        body,
        h(ChartLegend),
      )
    }
    return h('div', { ref, className: 'esaChartBox' },
      body,
      h(ChartLegend),
    )
  }

  function TenantCard({ tenant, curveState, onOpen, onAsk, onLoadCurve, onRetryCurve }) {
    const score = scoreTone(tenant.nightScore)
    return h('article', { className: 'esaCard' },
      h('div', { className: 'esaCardTop' },
        h('div', { className: 'esaCardNameWrap' },
          h('h3', { className: 'esaCardName', title: tenant.name }, tenant.name),
          h('p', { className: 'esaCardMeta' },
            [tenant.project || '未标注项目', tenant.floor ? `${tenant.floor}` : null, `仪表 ${tenant.meterId}`].filter(Boolean).join(' · '),
          ),
        ),
        h(TenantBadges, { tenant }),
      ),
      h('div', { className: 'esaMetrics' },
        h('div', { className: 'esaMetric' },
          h('div', { className: 'esaMetricLabel' }, '夜实际'),
          h('div', { className: 'esaMetricValue' }, fmtNumber(tenant.nightActual)),
        ),
        h('div', { className: 'esaMetric' },
          h('div', { className: 'esaMetricLabel' }, '夜预测'),
          h('div', { className: 'esaMetricValue' }, fmtNumber(tenant.nightPred)),
        ),
        h('div', { className: 'esaMetric' },
          h('div', { className: 'esaMetricLabel' }, '偏差 kWh'),
          h('div', { className: cx('esaMetricValue', score === 'risk' && 'esaMetricValue--risk') }, fmtSigned(tenant.nightExcess)),
        ),
        h('div', { className: 'esaMetric' },
          h('div', { className: 'esaMetricLabel' }, '偏离分'),
          h('div', { className: cx('esaMetricValue', score === 'risk' && 'esaMetricValue--risk', score === 'warn' && 'esaMetricValue--warn') }, fmtNumber(tenant.nightScore)),
        ),
      ),
      h(ChartArea, {
        meterId: tenant.meterId,
        curveState,
        onLoad: onLoadCurve,
        onRetry: onRetryCurve,
        tenantName: tenant.name,
      }),
      h('div', { className: 'esaCardFoot' },
        h('span', { className: 'esaCardFootNote' },
          tenant.prevAbnormal ? '连续偏离，建议优先核查' : tenant.negative ? '负向偏离，关注是否提前闭店' : '模型偏离，按分数排序',
        ),
        h('div', { className: 'esaCardActions' },
          h('button', { type: 'button', className: 'esaTextBtn esaTextBtn--muted', onClick: () => onAsk(tenant) }, '问 AI'),
          h('button', { type: 'button', className: 'esaTextBtn', onClick: () => onOpen(tenant) }, '详情', h(Icon, { name: 'arrow', size: 13 })),
        ),
      ),
    )
  }

  function CodeCard({ item, curveState, onOpen, onAsk, onLoadCurve, onRetryCurve }) {
    const isFault = item.category === 'meter_fault'
    return h('article', { className: 'esaCard esaCodeCard' },
      h('div', { className: 'esaCardTop' },
        h('div', { className: 'esaCardNameWrap' },
          h('h3', { className: 'esaCardName', title: item.name }, item.name),
          h('p', { className: 'esaCardMeta' },
            [item.project || '未标注项目', item.floor || null, `仪表 ${item.meterId}`].filter(Boolean).join(' · '),
          ),
        ),
        h('div', { className: 'esaBadges' },
          h(Badge, { tone: isFault ? 'fault' : 'code' }, item.categoryLabel),
          item.severity === 'high' ? h(Badge, { tone: 'dual' }, '高风险') : null,
        ),
      ),
      h('p', { className: 'esaCodeDesc' }, item.description || '能源系统未提供描述'),
      h('div', { className: 'esaCodeMetrics' },
        typeof item.metrics.nightRatio === 'number'
          ? h('span', { className: 'esaCodeMetric' }, '夜间占比 ', h('strong', null, fmtPercent(item.metrics.nightRatio)))
          : null,
        typeof item.metrics.nightDelta === 'number'
          ? h('span', { className: 'esaCodeMetric' }, '夜间用量 ', h('strong', null, `${fmtNumber(item.metrics.nightDelta)} kWh`))
          : null,
        typeof item.metrics.totalDelta === 'number'
          ? h('span', { className: 'esaCodeMetric' }, '总增量 ', h('strong', null, `${fmtNumber(item.metrics.totalDelta)} kWh`))
          : null,
        typeof item.metrics.delta === 'number'
          ? h('span', { className: 'esaCodeMetric' }, '读数增量 ', h('strong', null, fmtNumber(item.metrics.delta)))
          : null,
        typeof item.metrics.readingsCount === 'number'
          ? h('span', { className: 'esaCodeMetric' }, '读数 ', h('strong', null, `${fmtNumber(item.metrics.readingsCount, 0)} 次`))
          : null,
      ),
      h(ChartArea, {
        meterId: item.meterId,
        curveState,
        onLoad: onLoadCurve,
        onRetry: onRetryCurve,
        tenantName: item.name,
      }),
      h('div', { className: 'esaCardFoot' },
        h('span', { className: 'esaCardFootNote' }, item.room ? `房间：${item.room}` : '代码侧检测'),
        h('div', { className: 'esaCardActions' },
          h('button', { type: 'button', className: 'esaTextBtn esaTextBtn--muted', onClick: () => onAsk(item) }, '问 AI'),
          h('button', { type: 'button', className: 'esaTextBtn', onClick: () => onOpen(item) }, '详情', h(Icon, { name: 'arrow', size: 13 })),
        ),
      ),
    )
  }

  function ConnectForm({ initial, busy, error, onSubmit, compact = false }) {
    const [baseUrl, setBaseUrl] = useState(initial?.baseUrl || DEFAULT_BASE_URL)
    const [username, setUsername] = useState(initial?.username || '')
    const [password, setPassword] = useState('')
    const [localError, setLocalError] = useState('')

    const submit = (event) => {
      event.preventDefault()
      if (!username.trim()) {
        setLocalError('请填写能源系统用户名')
        return
      }
      if (!password) {
        setLocalError('请填写能源系统密码')
        return
      }
      setLocalError('')
      onSubmit({ baseUrl: baseUrl.trim() || DEFAULT_BASE_URL, username: username.trim(), password })
    }

    return h('form', { className: cx('esaForm', compact && 'esaForm--compact'), onSubmit: submit },
      h('label', { className: 'esaField esaField--wide' },
        h('span', { className: 'esaFieldLabel' }, '能源系统地址'),
        h('input', {
          className: 'esaInput',
          type: 'url',
          value: baseUrl,
          onChange: (event) => setBaseUrl(event.target.value),
          placeholder: DEFAULT_BASE_URL,
          spellCheck: false,
          autoCapitalize: 'off',
        }),
      ),
      h('label', { className: 'esaField' },
        h('span', { className: 'esaFieldLabel' }, '用户名'),
        h('input', {
          className: 'esaInput',
          type: 'text',
          value: username,
          onChange: (event) => setUsername(event.target.value),
          autoComplete: 'username',
          spellCheck: false,
          autoCapitalize: 'off',
        }),
      ),
      h('label', { className: 'esaField' },
        h('span', { className: 'esaFieldLabel' }, '密码'),
        h('input', {
          className: 'esaInput',
          type: 'password',
          value: password,
          onChange: (event) => setPassword(event.target.value),
          autoComplete: 'current-password',
        }),
      ),
      localError || error
        ? h('div', { className: 'esaNotice esaNotice--risk esaField--wide', role: 'alert' }, localError || error)
        : null,
      h('div', { className: 'esaFormActions' },
        h('button', { type: 'submit', className: 'esaBtn esaBtn--primary', disabled: busy },
          busy ? h(Icon, { name: 'refresh', size: 15 }) : h(Icon, { name: 'link', size: 15 }),
          busy ? '正在连接并同步…' : compact ? '保存并重新同步' : '连接并同步',
        ),
        h('span', { className: 'esaFinePrint' },
          '账号保存在本机工作台数据目录的 connection.env（仅本人可读）；不写入对话记录，也不会上传。',
        ),
      ),
    )
  }

  function ConnectPanel({ status, busy, error, onConnect }) {
    return h('div', { className: 'esaConnectWrap' },
      h('div', { className: 'esaConnectCard' },
        h('span', { className: 'esaConnectEyebrow' }, h(Icon, { name: 'shield', size: 13 }), '本机连接'),
        h('h2', { className: 'esaConnectTitle' }, '连接能源系统，开始每日自检'),
        h('p', { className: 'esaConnectIntro' },
          '填写一次能源管理系统账号，工作台会每天读取 AI 自检报告、异常租户和用电曲线。只读数据，不修改系统里的任何配置。',
        ),
        h(ConnectForm, {
          initial: { baseUrl: status?.baseUrl, username: status?.username },
          busy,
          error,
          onSubmit: onConnect,
        }),
        h('div', { className: 'esaConnectAside' },
          h(Icon, { name: 'info', size: 15 }),
          h('span', null, '第一次连接会立即同步最新报告。如果今天还没有 AI 自检结果，会显示上一份可用报告，并在顶部标明时间。'),
        ),
      ),
    )
  }

  function AlreadyPanel({ status, busy, error, onSync }) {
    return h('div', { className: 'esaAlready' },
      h('div', { className: 'esaAlreadyCard' },
        h('div', { className: 'esaAlreadyText' },
          h('p', { className: 'esaAlreadyTitle' }, '已连接能源系统，等待第一份报告'),
          h('p', { className: 'esaAlreadyHint' },
            error || '本地还没有报告缓存。可以立即同步，或稍后打开工作台自动同步。',
          ),
        ),
        h('button', { type: 'button', className: 'esaBtn esaBtn--primary', disabled: busy, onClick: () => onSync() },
          h(Icon, { name: 'refresh', size: 15 }), busy ? '同步中…' : '立即同步',
        ),
      ),
    )
  }

  function Summary({ report, status, filter, onFilter }) {
    const summary = report.summary
    const items = [
      {
        id: 'all',
        label: '租户总数',
        value: fmtCount(summary.tenantTotal),
        note: `${fmtCount(summary.projects)} 个项目`,
        icon: 'users',
        tone: '',
      },
      {
        id: 'model',
        label: '模型偏离',
        value: fmtCount(summary.modelTotal),
        note: '按偏离分排序',
        icon: 'chart',
        tone: summary.modelTotal > 0 ? 'warn' : 'good',
      },
      {
        id: 'dual',
        label: '双命中',
        value: fmtCount(summary.dual),
        note: '模型与规则同日命中',
        icon: 'alert',
        tone: summary.dual > 0 ? 'risk' : 'good',
      },
      {
        id: 'negative',
        label: '负向偏离',
        value: fmtCount(summary.negative),
        note: '预测该开却全关',
        icon: 'clock',
        tone: summary.negative > 0 ? 'warn' : '',
      },
      {
        id: 'code',
        label: '代码侧异常',
        value: fmtCount(summary.codeAnomalies),
        note: summary.codeAnomalies > 0 ? '夜间未闭店 / 通讯 / 跳值' : '未发现',
        icon: 'shield',
        tone: summary.codeAnomalies > 0 ? 'risk' : 'good',
      },
    ]
    return h('div', { className: 'esaSummary', role: 'group', 'aria-label': '今日自检汇总' },
      ...items.map((item) => h('button', {
        key: item.id,
        type: 'button',
        className: cx('esaStat', item.tone && `esaStatTone--${item.tone}`),
        'aria-pressed': filter === item.id,
        onClick: () => onFilter(item.id),
      },
        h('span', { className: 'esaStatTop' },
          h('span', { className: 'esaStatLabel' }, item.label),
          h('span', { className: 'esaStatIcon' }, h(Icon, { name: item.icon, size: 15 })),
        ),
        h('span', { className: 'esaStatValue' }, item.value),
        h('span', { className: 'esaStatNote' }, item.note),
      )),
    )
  }

  function Insight({ report }) {
    const summary = report.summary
    const first = report.tenants.find((tenant) => tenant.focus) || report.tenants[0]
    const risk = summary.codeAnomalies > 0 || summary.dual > 0
    const watch = !risk && (summary.modelTotal > 0 || summary.negative > 0)
    const pieces = []
    pieces.push(summary.codeAnomalies > 0 ? `代码侧发现 ${summary.codeAnomalies} 个异常` : '代码侧未发现异常')
    pieces.push(`模型偏离 ${summary.modelTotal} 只`)
    if (summary.dual > 0) pieces.push(`双命中 ${summary.dual} 只`)
    if (summary.negative > 0) pieces.push(`负向偏离 ${summary.negative} 只`)
    if (first) pieces.push(`优先核查「${first.name}」`)
    return h('div', { className: cx('esaInsight', risk && 'esaInsight--risk') },
      h('span', { className: 'esaInsightMark' }, h(Icon, { name: risk ? 'alert' : watch ? 'chart' : 'shield', size: 16 })),
      h('div', { className: 'esaInsightText' },
        h('p', { className: 'esaInsightTitle' }, risk ? '今天有需要优先核查的异常' : watch ? '今天有模型偏离，建议按分数抽查' : '今天整体平稳'),
        h('p', { className: 'esaInsightBody' }, `${pieces.join('；')}。报告日期 ${report.date}，数据周期 ${report.period.from} 至 ${report.period.to}。`),
      ),
    )
  }

  function SyncBanner({ status, onSync, busy }) {
    if (!status?.error) return null
    return h('div', { className: 'esaSyncError', role: 'alert' },
      h('span', null, `同步失败：${status.error}${status.lastSuccess ? `。当前展示 ${fmtDateTime(status.lastSuccess)} 的缓存。` : ''}`),
      h('button', { type: 'button', className: 'esaBtn esaBtn--sm', disabled: busy, onClick: () => onSync() }, '重试'),
    )
  }

  function Toolbar({ report, filter, onFilter, query, onQuery, onToggleAll, allShown, counts }) {
    const filters = [
      { id: 'focus', label: '重点关注', count: counts.focus },
      { id: 'dual', label: '双命中', count: counts.dual },
      { id: 'model', label: '模型偏离', count: counts.model },
      { id: 'negative', label: '负向偏离', count: counts.negative },
      { id: 'code', label: '代码侧异常', count: counts.code },
      { id: 'all', label: '全部异常', count: counts.all },
    ]
    return h('div', { className: 'esaToolbar' },
      h('div', { className: 'esaTabs', role: 'tablist', 'aria-label': '异常分类' },
        ...filters.map((item) => h('button', {
          key: item.id,
          type: 'button',
          role: 'tab',
          className: 'esaTab',
          'aria-selected': filter === item.id,
          onClick: () => onFilter(item.id),
        }, item.label, h('span', { className: 'esaTabCount' }, fmtCount(item.count)))),
      ),
      h('div', { className: 'esaFilterTools' },
        filter === 'model' && report.summary.modelTotal > 12
          ? h('button', { type: 'button', className: 'esaBtn esaBtn--sm', onClick: onToggleAll },
            allShown ? '只看前 12' : `展开全部 ${fmtCount(report.summary.modelTotal)}`,
          )
          : null,
        h('label', { className: 'esaSearch' },
          h(Icon, { name: 'search', size: 15 }),
          h('input', {
            type: 'search',
            value: query,
            onChange: (event) => onQuery(event.target.value),
            placeholder: '搜索租户、项目或楼栋',
            'aria-label': '搜索租户、项目或楼栋',
          }),
        ),
      ),
    )
  }

  function EmptyState({ title, hint, action }) {
    return h('div', { className: 'esaEmpty' },
      h('div', { className: 'esaEmptyMark' }, h(Icon, { name: 'search', size: 19 })),
      h('p', { className: 'esaEmptyTitle' }, title),
      h('p', { className: 'esaEmptyHint' }, hint),
      action ? h('div', { className: 'esaEmptyActions' }, action) : null,
    )
  }

  function Overlay({ children, onClose, label, modalClassName }) {
    return h('div', {
      className: 'esaOverlay',
      role: 'presentation',
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose()
      },
    },
      h('div', {
        className: cx('esaModal', modalClassName),
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': label,
        onMouseDown: (event) => event.stopPropagation(),
      }, children),
    )
  }

  function useEscape(onClose, active = true) {
    useEffect(() => {
      if (!active) return
      const handle = (event) => {
        if (event.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handle)
      return () => window.removeEventListener('keydown', handle)
    }, [active, onClose])
  }

  function DetailDialog({ selection, report, curveState, onClose, onAsk, onRetryCurve }) {
    useEscape(onClose)
    const closeRef = useRef(null)
    useEffect(() => {
      closeRef.current?.focus()
    }, [])
    const isCode = selection.kind === 'code'
    const item = selection.item
    const days = curveState?.data?.days ?? []
    const note = '卡片指标来自 AI 自检汇总，曲线来自原始逐时用电；两者口径可能不同，请结合现场情况判断。'
    return h('div', {
      className: 'esaOverlay',
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose()
      },
    },
      h('div', {
        className: 'esaModal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': isCode ? '异常详情' : '租户用电详情',
        onMouseDown: (event) => event.stopPropagation(),
      },
        h('div', { className: 'esaModalHead' },
          h('div', { className: 'esaModalTitleWrap' },
            h('h2', { className: 'esaModalTitle' }, item.name),
            h('p', { className: 'esaModalSub' },
              [item.project || '未标注项目', item.floor || null, `仪表 ${item.meterId}`].filter(Boolean).join(' · '),
            ),
          ),
          h('button', { ref: closeRef, type: 'button', className: 'esaBtn esaBtn--icon esaBtn--ghost', onClick: onClose, 'aria-label': '关闭' }, h(Icon, { name: 'close', size: 17 })),
        ),
        h('div', { className: 'esaModalBody' },
          isCode
            ? h('div', null,
                h('div', { className: 'esaBadges', style: { marginBottom: '10px' } },
                  h(Badge, { tone: item.category === 'meter_fault' ? 'fault' : 'code' }, item.categoryLabel),
                  h(Badge, { tone: 'model' }, item.severity === 'high' ? '高风险' : item.severity === 'low' ? '低风险' : '中风险'),
                ),
                h('p', { className: 'esaCodeDesc' }, item.description || '能源系统未提供描述'),
                h('div', { className: 'esaCodeMetrics' },
                  typeof item.metrics.nightRatio === 'number' ? h('span', { className: 'esaCodeMetric' }, '夜间占比 ', h('strong', null, fmtPercent(item.metrics.nightRatio))) : null,
                  typeof item.metrics.nightDelta === 'number' ? h('span', { className: 'esaCodeMetric' }, '夜间用量 ', h('strong', null, `${fmtNumber(item.metrics.nightDelta)} kWh`)) : null,
                  typeof item.metrics.totalDelta === 'number' ? h('span', { className: 'esaCodeMetric' }, '总增量 ', h('strong', null, `${fmtNumber(item.metrics.totalDelta)} kWh`)) : null,
                  typeof item.metrics.delta === 'number' ? h('span', { className: 'esaCodeMetric' }, '读数增量 ', h('strong', null, fmtNumber(item.metrics.delta))) : null,
                  typeof item.metrics.readingsCount === 'number' ? h('span', { className: 'esaCodeMetric' }, '读数 ', h('strong', null, `${fmtNumber(item.metrics.readingsCount, 0)} 次`)) : null,
                ),
              )
            : h('div', null,
                h('div', { className: 'esaDetailStats' },
                  h('div', { className: 'esaDetailStat' }, h('div', { className: 'esaDetailStatLabel' }, '夜实际'), h('div', { className: 'esaDetailStatValue' }, fmtNumber(item.nightActual))),
                  h('div', { className: 'esaDetailStat' }, h('div', { className: 'esaDetailStatLabel' }, '夜预测'), h('div', { className: 'esaDetailStatValue' }, fmtNumber(item.nightPred))),
                  h('div', { className: 'esaDetailStat' }, h('div', { className: 'esaDetailStatLabel' }, '偏差 kWh'), h('div', { className: 'esaDetailStatValue' }, fmtSigned(item.nightExcess))),
                  h('div', { className: 'esaDetailStat' }, h('div', { className: 'esaDetailStatLabel' }, '偏离分'), h('div', { className: 'esaDetailStatValue' }, fmtNumber(item.nightScore))),
                  h('div', { className: 'esaDetailStat' }, h('div', { className: 'esaDetailStatLabel' }, 'q10–q90'), h('div', { className: 'esaDetailStatValue' }, `${fmtNumber(item.q10)}–${fmtNumber(item.q90)}`)),
                  h('div', { className: 'esaDetailStat' }, h('div', { className: 'esaDetailStatLabel' }, '连续偏离'), h('div', { className: 'esaDetailStatValue' }, item.prevAbnormal ? '是' : '否')),
                ),
                h('div', { className: 'esaBadges', style: { marginTop: '9px' } }, h(TenantBadges, { tenant: item })),
              ),
          h('div', { className: 'esaDetailSection' },
            h('h3', { className: 'esaDetailSectionTitle' }, '72 小时用电曲线'),
            h(ChartArea, {
              meterId: item.meterId,
              curveState,
              onLoad: () => {},
              onRetry: onRetryCurve,
              tenantName: item.name,
              detail: true,
            }),
            h('p', { className: 'esaFinePrint', style: { marginTop: '7px' } }, note),
          ),
          !isCode && days.length
            ? h('div', { className: 'esaDetailSection' },
                h('h3', { className: 'esaDetailSectionTitle' }, '夜间窗口汇总'),
                h('div', { className: 'esaTableWrap' },
                  h('table', { className: 'esaTable' },
                    h('thead', null,
                      h('tr', null,
                        h('th', null, '日期'),
                        h('th', null, '夜实际 kWh'),
                        h('th', null, '夜预测 kWh'),
                        h('th', null, '偏差 kWh'),
                        h('th', null, '偏离分'),
                      ),
                    ),
                    h('tbody', null,
                      ...days.map((day) => h('tr', { key: day.date },
                        h('td', null, day.date),
                        h('td', null, fmtNumber(day.night?.actual)),
                        h('td', null, fmtNumber(day.night?.pred)),
                        h('td', null, fmtSigned(day.night?.excess)),
                        h('td', null, fmtNumber(day.night?.score)),
                      )),
                    ),
                  ),
                ),
              )
            : null,
          h('div', { className: 'esaModalActions' },
            h('span', { className: 'esaFinePrint' }, '需要更细的判断时，可以让 AI 结合当前报告继续分析。'),
            h('div', { className: 'esaModalActionsRight' },
              h('button', { type: 'button', className: 'esaBtn esaBtn--ghost', onClick: onClose }, '关闭'),
              h('button', { type: 'button', className: 'esaBtn esaBtn--primary', onClick: () => onAsk(isCode ? { kind: 'code', item } : { kind: 'tenant', item }) },
                h(Icon, { name: 'sparkles', size: 15 }), '让 AI 分析',
              ),
            ),
          ),
        ),
      ),
    )
  }

  function SettingsDialog({ status, report, busy, onClose, onSync, onDisconnect, onReconnect }) {
    useEscape(onClose)
    const [confirming, setConfirming] = useState(false)
    return h(Overlay, { onClose, label: '用电安全助手设置', modalClassName: 'esaModal--settings' },
      h('div', { className: 'esaModalHead' },
        h('div', { className: 'esaModalTitleWrap' },
          h('h2', { className: 'esaModalTitle' }, '设置'),
          h('p', { className: 'esaModalSub' }, '连接状态、同步与本机账号'),
        ),
        h('button', { type: 'button', className: 'esaBtn esaBtn--icon esaBtn--ghost', onClick: onClose, 'aria-label': '关闭' }, h(Icon, { name: 'close', size: 17 })),
      ),
      h('div', { className: 'esaModalBody' },
        h('div', { className: 'esaSettingsGroup' },
          h('div', { className: 'esaSettingsRow' },
            h('span', { className: 'esaSettingsKey' }, '状态'),
            h('span', { className: 'esaSettingsValue' }, status.configured ? '已连接能源系统' : '未连接'),
          ),
          status.configured ? h('div', { className: 'esaSettingsRow' },
            h('span', { className: 'esaSettingsKey' }, '账号'),
            h('span', { className: 'esaSettingsValue' }, status.username || '—', status.displayName ? ` · ${status.displayName}` : ''),
          ) : null,
          h('div', { className: 'esaSettingsRow' },
            h('span', { className: 'esaSettingsKey' }, '系统地址'),
            h('span', { className: 'esaSettingsValue' }, status.baseUrl || DEFAULT_BASE_URL),
          ),
          h('div', { className: 'esaSettingsRow' },
            h('span', { className: 'esaSettingsKey' }, '最近同步'),
            h('span', { className: 'esaSettingsValue' }, fmtDateTime(status.lastSuccess || status.lastSync)),
          ),
          report ? h('div', { className: 'esaSettingsRow' },
            h('span', { className: 'esaSettingsKey' }, '当前报告'),
            h('span', { className: 'esaSettingsValue' }, `${report.date}（数据周期 ${report.period.from} 至 ${report.period.to}）`),
          ) : null,
          h('p', { className: 'esaSettingsNote' },
            '账号保存在本机的 connection.env（权限 600），不写入对话记录，也不会上传。断开连接只删除账号，已同步的报告缓存仍保留。',
          ),
        ),
        h('div', { className: 'esaSettingsGroup' },
          h('div', { className: 'esaSettingsActions' },
            h('button', { type: 'button', className: 'esaBtn esaBtn--primary', disabled: busy || !status.configured, onClick: () => onSync() },
              h(Icon, { name: 'refresh', size: 15 }), busy ? '同步中…' : '立即同步',
            ),
            h('button', { type: 'button', className: 'esaBtn', onClick: onReconnect },
              h(Icon, { name: 'settings', size: 15 }), status.configured ? '更换账号' : '连接能源系统',
            ),
            status.configured
              ? h('button', { type: 'button', className: 'esaBtn esaBtn--danger', onClick: () => setConfirming(true) }, '断开连接')
              : null,
          ),
          confirming
            ? h('div', { className: 'esaNotice esaNotice--risk', style: { marginTop: '10px' } },
                '确定断开连接吗？只会删除本机保存的账号，已同步的报告仍会保留。',
                h('div', { className: 'esaSettingsActions', style: { marginTop: '8px' } },
                  h('button', { type: 'button', className: 'esaBtn esaBtn--danger esaBtn--sm', onClick: () => { setConfirming(false); onDisconnect() } }, '确定断开'),
                  h('button', { type: 'button', className: 'esaBtn esaBtn--sm', onClick: () => setConfirming(false) }, '取消'),
                ),
              )
            : null,
        ),
      ),
    )
  }

  function ChatDrawer({ conversation, busy, onClose, onCreate }) {
    return h('aside', { className: 'esaChat', 'aria-label': 'AI 协助' },
      h('div', { className: 'esaChatHeader' },
        h('div', null,
          h('h2', { className: 'esaChatTitle' }, 'AI 协助'),
          h('p', { className: 'esaChatHint' }, '基于当前报告继续问，不会自动发送'),
        ),
        h('button', { type: 'button', className: 'esaBtn esaBtn--icon esaBtn--ghost', onClick: onClose, 'aria-label': '关闭 AI 协助' }, h(Icon, { name: 'close', size: 17 })),
      ),
      h('div', { className: 'esaChatBody' },
        busy
          ? h('div', { className: 'esaChatEmpty' },
              h('div', null,
                h('p', null, '正在准备本工作台会话…'),
                h('div', { className: 'esaChartSkeleton', style: { width: '180px', height: '6px' } }),
              ),
            )
          : conversation || h('div', { className: 'esaChatEmpty' },
              h('div', null,
                h('p', null, '还没有可用的工作台会话。'),
                h('button', { type: 'button', className: 'esaBtn esaBtn--primary', onClick: onCreate }, '创建会话并写入分析请求'),
              ),
            ),
      ),
    )
  }

  function BusinessPanel({ service, entry, active, conversation, host }) {
    const [status, setStatus] = useState(null)
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState('')
    const [error, setError] = useState('')
    const [connectError, setConnectError] = useState('')
    const [notice, setNotice] = useState('')
    const [filter, setFilter] = useState('focus')
    const [query, setQuery] = useState('')
    const [showAllModel, setShowAllModel] = useState(false)
    const [visibleCount, setVisibleCount] = useState(24)
    const [curves, setCurves] = useState({})
    const [selection, setSelection] = useState(null)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [connectOpen, setConnectOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)
    const [aiBusy, setAiBusy] = useState(false)
    const autoSyncRef = useRef(false)
    const curveRequests = useRef(new Set())
    const curvesRef = useRef({})
    const autoOpenedChatRef = useRef(false)

    useEscape(() => setConnectOpen(false), connectOpen)

    const request = useCallback(async (path, options) => {
      const response = await fetch(path, {
        credentials: 'same-origin',
        cache: 'no-store',
        ...options,
      })
      let data = null
      try {
        data = await response.json()
      } catch {
        data = null
      }
      if (!response.ok) {
        const failure = new Error(data?.error || `HTTP ${response.status}`)
        failure.status = response.status
        throw failure
      }
      return data
    }, [])

    const syncNow = useCallback(async ({ date, silent = false } = {}) => {
      setBusy('sync')
      setError('')
      try {
        const data = await request(`${API}/sync`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(date ? { date } : {}),
        })
        if (data?.ok === false) {
          if (data.status) setStatus(data.status)
          setError(data.error || '同步失败')
          return null
        }
        if (data?.status) setStatus(data.status)
        if (data?.report) {
          setReport(data.report)
          setFilter('focus')
          setQuery('')
          setVisibleCount(24)
          setShowAllModel(false)
          setCurves({})
          setSelection(null)
        }
        if (!silent) setNotice('已同步最新报告')
        return data?.report || null
      } catch (syncError) {
        setError(syncError instanceof Error ? syncError.message : String(syncError))
        try {
          const latest = await request(`${API}/status`)
          setStatus(latest)
        } catch {
          /* keep the visible error */
        }
        return null
      } finally {
        setBusy('')
      }
    }, [request])

    useEffect(() => {
      curvesRef.current = curves
    }, [curves])

    useEffect(() => {
      let alive = true
      ;(async () => {
        setLoading(true)
        try {
          const snapshot = await request(`${API}/status`)
          if (!alive) return
          setStatus(snapshot)
          let loadedReport = null
          if (snapshot.configured) {
            try {
              const data = await request(`${API}/report${snapshot.reportDate ? `?date=${encodeURIComponent(snapshot.reportDate)}` : ''}`)
              if (alive && data?.report) {
                loadedReport = data.report
                setReport(data.report)
                if (data.status) setStatus(data.status)
              }
            } catch (reportError) {
              if (reportError?.status !== 404 && alive) setError(reportError.message)
            }
          }
          if (!alive) return
          setLoading(false)
          if (snapshot.configured && (snapshot.stale || !loadedReport) && !autoSyncRef.current) {
            autoSyncRef.current = true
            void syncNow({ silent: true })
          }
        } catch (loadError) {
          if (!alive) return
          setError(loadError instanceof Error ? loadError.message : String(loadError))
          setLoading(false)
        }
      })()
      return () => { alive = false }
    }, [request, syncNow])

    useEffect(() => {
      if (autoOpenedChatRef.current) return
      let owned = false
      try {
        const current = service?.currentSession?.()
        owned = Boolean(current && service?.ownsSession?.(current))
      } catch {
        /* The host's ownsSession() can throw outside the workbench client fiber. */
        owned = false
      }
      if (owned) {
        autoOpenedChatRef.current = true
        setChatOpen(true)
      }
    }, [conversation, service, status, report])

    const loadCurve = useCallback(async (meterId) => {
      if (!report || !meterId) return
      const key = `${report.date}:${meterId}`
      const existing = curvesRef.current[key]
      if (existing && (existing.loading || existing.data)) return
      if (curveRequests.current.has(key)) return
      curveRequests.current.add(key)
      setCurves((previous) => ({ ...previous, [key]: { loading: true } }))
      try {
        const data = await request(`${API}/curve?meter_id=${encodeURIComponent(meterId)}&date=${encodeURIComponent(report.date)}`)
        setCurves((previous) => ({ ...previous, [key]: { loading: false, data: data.curve } }))
      } catch (curveError) {
        setCurves((previous) => ({
          ...previous,
          [key]: { loading: false, error: curveError instanceof Error ? curveError.message : String(curveError) },
        }))
      } finally {
        curveRequests.current.delete(key)
      }
    }, [report, request])

    const retryCurve = useCallback((meterId) => {
      if (!report || !meterId) return
      const key = `${report.date}:${meterId}`
      const next = { ...curvesRef.current }
      delete next[key]
      curvesRef.current = next
      setCurves(next)
      curveRequests.current.delete(key)
      void loadCurve(meterId)
    }, [loadCurve, report])

    const curveFor = useCallback((meterId) => {
      if (!report || !meterId) return null
      return curves[`${report.date}:${meterId}`] || null
    }, [curves, report])

    const changeDate = useCallback(async (date) => {
      if (!date || date === report?.date) return
      setBusy('load')
      setError('')
      try {
        const data = await request(`${API}/report?date=${encodeURIComponent(date)}`)
        if (data?.report) {
          setReport(data.report)
          if (data.status) setStatus(data.status)
          setFilter('focus')
          setQuery('')
          setVisibleCount(24)
          setShowAllModel(false)
          setCurves({})
          setSelection(null)
        }
      } catch (loadError) {
        if (loadError?.status === 404 && status?.configured) {
          const synced = await syncNow({ date, silent: true })
          if (!synced) setError(loadError instanceof Error ? loadError.message : String(loadError))
        } else {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
        }
      } finally {
        setBusy('')
      }
    }, [report, request, status, syncNow])

    const connect = useCallback(async (form) => {
      setBusy('connect')
      setConnectError('')
      try {
        const data = await request(`${API}/connect`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (data?.status) setStatus(data.status)
        if (data?.report) {
          setReport(data.report)
          setFilter('focus')
          setQuery('')
          setVisibleCount(24)
          setShowAllModel(false)
          setCurves({})
          setSelection(null)
        }
        if (data?.ok === false) {
          setConnectError(data.error || '已连接，但同步失败')
          return false
        }
        setConnectOpen(false)
        setSettingsOpen(false)
        setNotice('已连接能源系统并同步报告')
        return true
      } catch (connectFailure) {
        setConnectError(connectFailure instanceof Error ? connectFailure.message : String(connectFailure))
        return false
      } finally {
        setBusy('')
      }
    }, [request])

    const disconnect = useCallback(async () => {
      setBusy('disconnect')
      setError('')
      try {
        const data = await request(`${API}/disconnect`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
        if (data?.status) setStatus(data.status)
        setNotice('已断开连接；本机报告缓存仍然保留')
      } catch (disconnectError) {
        setError(disconnectError instanceof Error ? disconnectError.message : String(disconnectError))
      } finally {
        setBusy('')
      }
    }, [request])

    const writeDraft = (sessionId, prompt) => {
      try {
        const conversationApi = host?.conversation
        const sessions = host?.sessions
        if (!conversationApi?.input?.requestDraftInitialization || typeof sessions?.binding !== 'function') return 'unavailable'
        const binding = sessions.binding(sessionId)
        if (!binding) return 'unavailable'
        return conversationApi.input.requestDraftInitialization(binding, { prompt })
      } catch {
        return 'unavailable'
      }
    }

    const openAi = useCallback(async (prompt) => {
      setAiBusy(true)
      setError('')
      try {
        let sessionId = null
        const current = service?.currentSession?.()
        let owned = false
        try {
          owned = Boolean(current && service?.ownsSession?.(current))
        } catch {
          owned = false
        }
        if (owned) sessionId = current
        if (!sessionId) {
          const workspace = service?.defaultWorkspace?.()
          const creation = workspace ? service.newSession(workspace.workspaceId) : service.newWorkspaceSession()
          service?.run?.(creation)
          sessionId = await creation
        }
        if (!sessionId) throw new Error('没有创建可用的工作台会话')
        const applied = writeDraft(sessionId, prompt)
        if (applied === 'applied') {
          setNotice('已把分析请求写入对话草稿，确认后发送')
        } else if (applied === 'preserved') {
          await navigator?.clipboard?.writeText?.(prompt).catch(() => {})
          setNotice('对话里已有草稿，分析请求已复制到剪贴板')
        } else {
          await navigator?.clipboard?.writeText?.(prompt).catch(() => {})
          setNotice('已复制分析请求，粘贴到对话里发送')
        }
        setChatOpen(true)
      } catch (aiError) {
        setError(aiError instanceof Error ? aiError.message : String(aiError))
      } finally {
        setAiBusy(false)
      }
    }, [host, service])

    const buildTenantPrompt = (tenant) => {
      if (!report) return ''
      const lines = [
        `请分析这个用电异常租户：${tenant.name}（${tenant.project || '未标注项目'}${tenant.floor ? `，${tenant.floor}` : ''}，仪表 ${tenant.meterId}）。`,
        `报告日期 ${report.date}，数据周期 ${report.period.from} 至 ${report.period.to}。`,
        `夜实际 ${fmtNumber(tenant.nightActual)} kWh，夜预测 ${fmtNumber(tenant.nightPred)} kWh，偏差 ${fmtSigned(tenant.nightExcess)} kWh，偏离分 ${fmtNumber(tenant.nightScore)}。`,
        tenant.heuristicHit ? '该租户同日规则命中。' : '',
        tenant.prevAbnormal ? '该租户连续出现偏离。' : '',
        tenant.negative ? '该租户属于负向偏离（预测该开却全关）。' : '',
        '',
        '请判断更可能是计量/通讯问题、设备未停机、提前闭店，还是真实用电异常；给出今天可执行的核查步骤。不要编造报告里没有的数据。',
      ]
      return lines.filter((line) => line !== '').join('\n')
    }

    const buildCodePrompt = (item) => {
      if (!report) return ''
      return [
        `请分析这条能源系统代码侧异常：${item.name}（${item.project || '未标注项目'}${item.floor ? `，${item.floor}` : ''}，仪表 ${item.meterId}）。`,
        `类型：${item.categoryLabel}；严重程度：${item.severity || 'medium'}。`,
        `描述：${item.description || '无'}。`,
        `报告日期 ${report.date}。`,
        '',
        '请判断这条异常更像计量/通讯故障、设备未停机、夜间未闭店还是数据跳值，并给出核查顺序。不要编造报告里没有的数据。',
      ].join('\n')
    }

    const buildReportPrompt = () => {
      if (!report) return ''
      const lines = [
        `请分析能源管理系统 ${report.date} 的 AI 自检报告（数据周期 ${report.period.from} 至 ${report.period.to}）。`,
        `汇总：租户 ${fmtCount(report.summary.tenantTotal)} 只；模型偏离 ${fmtCount(report.summary.modelTotal)} 只；双命中 ${fmtCount(report.summary.dual)} 只；负向偏离 ${fmtCount(report.summary.negative)} 只；代码侧异常 ${fmtCount(report.summary.codeAnomalies)} 个。`,
        '',
        '重点关注租户（按偏离分排序，最多 12 条）：',
      ]
      const focus = report.tenants.filter((tenant) => tenant.focus).slice(0, 12)
      focus.forEach((tenant, index) => {
        const marks = [
          tenant.heuristicHit ? '规则命中' : '',
          tenant.prevAbnormal ? '连续偏离' : '',
          tenant.negative ? '负向偏离' : '',
        ].filter(Boolean).join('、')
        lines.push(`${index + 1}. ${tenant.name}（${tenant.project || '未标注项目'}）：夜实际 ${fmtNumber(tenant.nightActual)} kWh，夜预测 ${fmtNumber(tenant.nightPred)} kWh，偏差 ${fmtSigned(tenant.nightExcess)} kWh，偏离分 ${fmtNumber(tenant.nightScore)}${marks ? `，${marks}` : ''}`)
      })
      if (report.code.length) {
        lines.push('')
        lines.push(`代码侧异常 ${report.code.length} 个，例如：`)
        report.code.slice(0, 8).forEach((item, index) => {
          lines.push(`${index + 1}. ${item.name}（${item.project || '未标注项目'}）：${item.categoryLabel}；${item.description || '无描述'}`)
        })
      }
      lines.push('')
      lines.push('请按核查优先级给出建议：先判断哪些是计量/通讯问题，哪些是真实的夜间未闭店或设备未停机；再给出今天最值得现场核查的 5 个租户和核查要点。不要编造报告里没有的数据。')
      return lines.join('\n')
    }

    const suggestFor = (target) => {
      if (!target) return openAi(buildReportPrompt())
      if (target.kind === 'code') return openAi(buildCodePrompt(target.item))
      return openAi(buildTenantPrompt(target.item))
    }

    const counts = useMemo(() => {
      const tenants = report?.tenants ?? []
      return {
        all: tenants.length,
        focus: tenants.filter((tenant) => tenant.focus).length,
        dual: tenants.filter((tenant) => tenant.heuristicHit || tenant.prevAbnormal).length,
        model: tenants.filter((tenant) => tenant.model).length,
        negative: tenants.filter((tenant) => tenant.negative).length,
        code: report?.code?.length ?? 0,
      }
    }, [report])

    const matchesQuery = useCallback((item) => {
      if (!query.trim()) return true
      const needle = query.trim().toLowerCase()
      return [
        item.name,
        item.project,
        item.building,
        item.floor,
        item.room,
        item.categoryLabel,
        item.description,
        item.meterId ? `仪表 ${item.meterId}` : '',
      ].some((value) => String(value || '').toLowerCase().includes(needle))
    }, [query])

    const visible = useMemo(() => {
      if (!report) return { tenants: [], code: [] }
      const tenants = report.tenants
      let list = []
      if (filter === 'code') {
        const code = report.code.filter(matchesQuery)
        return { tenants: [], code: code.slice(0, visibleCount) }
      }
      if (filter === 'focus') list = tenants.filter((tenant) => tenant.focus)
      else if (filter === 'dual') list = tenants.filter((tenant) => tenant.heuristicHit || tenant.prevAbnormal)
      else if (filter === 'negative') list = tenants.filter((tenant) => tenant.negative)
      else if (filter === 'model') list = tenants.filter((tenant) => tenant.model)
      else list = tenants
      list = list.filter(matchesQuery)
      if (filter === 'model' && !showAllModel) list = list.slice(0, 12)
      else list = list.slice(0, visibleCount)
      return { tenants: list, code: [] }
    }, [filter, matchesQuery, report, showAllModel, visibleCount])

    useEffect(() => {
      setVisibleCount(24)
    }, [filter, query, report?.date])

    const openDetail = useCallback((item) => {
      const target = item?.kind === 'code' ? item : item?.category && item?.metrics ? { kind: 'code', item } : { kind: 'tenant', item }
      setSelection(target)
      if (target.item?.meterId) void loadCurve(target.item.meterId)
    }, [loadCurve])

    const openTenant = useCallback((tenant) => {
      setSelection({ kind: 'tenant', item: tenant })
      if (tenant.meterId) void loadCurve(tenant.meterId)
    }, [loadCurve])

    const openCode = useCallback((item) => {
      setSelection({ kind: 'code', item })
      if (item.meterId) void loadCurve(item.meterId)
    }, [loadCurve])

    const askTenant = useCallback((tenant) => {
      const prompt = buildTenantPrompt(tenant)
      void openAi(prompt)
    }, [openAi, report])

    const askCode = useCallback((item) => {
      const prompt = buildCodePrompt(item)
      void openAi(prompt)
    }, [openAi, report])

    const askReport = useCallback(() => {
      if (!report) return
      void openAi(buildReportPrompt())
    }, [openAi, report])

    const handleFilter = useCallback((next) => {
      setFilter(next)
      setVisibleCount(24)
      setQuery('')
    }, [])

    const hasCachedReport = Boolean(report)
    const configured = Boolean(status?.configured)
    const syncBusy = busy === 'sync'
    const dateOptions = report?.availableDates?.length ? report.availableDates : status?.availableDates || []

    if (loading) {
      return h('div', { className: 'esaRoot' },
        h('div', { className: 'esaHeader', 'data-dsh-workbench-toolbar': '' },
          h('div', { className: 'esaBrand' },
            h('div', { className: 'esaBrandMark' }, h(Icon, { name: 'bolt', size: 17 })),
            h('div', { className: 'esaBrandText' },
              h('h1', { className: 'esaTitle' }, '用电安全助手'),
              h('p', { className: 'esaSubtitle' }, '每日 AI 自检 · 异常租户用电曲线'),
            ),
          ),
          h('div', { className: 'esaHeaderActions' },
            h('span', { className: 'esaSyncPill' }, h(StatusDot, { tone: 'busy' }), h('span', null, '正在读取…')),
          ),
        ),
        h('div', { className: 'esaBody' },
          h('div', { className: 'esaScroll' },
            h('div', { className: 'esaInner' },
              h('div', { className: 'esaSha' },
                h('div', { className: 'esaShaRow' },
                  ...Array.from({ length: 5 }, (_, index) => h('div', { key: index, className: 'esaShaBlock', style: { height: '82px' } })),
                ),
                h('div', { className: 'esaShaBlock', style: { height: '44px' } }),
                h('div', { className: 'esaShaBlock', style: { height: '310px' } }),
                h('div', { className: 'esaShaBlock', style: { height: '310px' } }),
              ),
            ),
          ),
        ),
      )
    }

    const header = h('header', { className: 'esaHeader', 'data-dsh-workbench-toolbar': '' },
      h('div', { className: 'esaBrand' },
        h('div', { className: 'esaBrandMark' }, h(Icon, { name: 'bolt', size: 17 })),
        h('div', { className: 'esaBrandText' },
          h('h1', { className: 'esaTitle' }, '用电安全助手'),
          h('p', { className: 'esaSubtitle' }, '每日 AI 自检 · 异常租户用电曲线'),
        ),
      ),
      h('div', { className: 'esaHeaderActions', 'data-dsh-no-drag': '' },
        dateOptions.length && report
          ? h('label', { className: 'esaDateField' },
              h('span', { className: 'esaDateLabel' }, '报告日期'),
              h('select', {
                className: 'esaSelect',
                value: report.date,
                onChange: (event) => void changeDate(event.target.value),
                'aria-label': '选择报告日期',
              }, ...dateOptions.map((date) => h('option', { key: date, value: date }, date))),
            )
          : null,
        h('button', {
          type: 'button',
          className: 'esaSyncPill',
          onClick: () => void syncNow(),
          disabled: syncBusy || !configured,
          title: status?.error || (status?.lastSuccess ? `上次同步 ${fmtDateTime(status.lastSuccess)}` : '尚未同步'),
        },
          h(StatusDot, { tone: status?.syncing || syncBusy ? 'busy' : status?.error ? 'risk' : status?.stale ? 'warn' : 'ok' }),
          h('span', { className: 'esaSyncText' }, status?.syncing || syncBusy ? '同步中…' : status?.error ? '同步失败' : status?.stale ? '待同步' : status?.lastSuccess ? `已同步 ${fmtTime(status.lastSuccess)}` : '待同步'),
        ),
        h('button', {
          type: 'button',
          className: 'esaBtn esaBtn--ghost esaBtn--sync',
          onClick: () => void syncNow(),
          disabled: syncBusy || !configured,
          'aria-label': '立即同步',
          title: '立即同步',
        },
          h(Icon, { name: 'refresh', size: 15, className: syncBusy ? 'esaSpin' : '' }),
          h('span', { className: 'esaBtnLabel' }, syncBusy ? '同步中' : '立即同步'),
        ),
        h('button', {
          type: 'button',
          className: 'esaBtn esaBtn--primary esaBtn--ai',
          onClick: askReport,
          disabled: aiBusy || !report,
          title: report ? '把当前报告摘要写入对话草稿' : '同步报告后可问 AI',
        },
          h(Icon, { name: 'sparkles', size: 15 }),
          h('span', { className: 'esaBtnLabel' }, aiBusy ? '准备中…' : '问 AI'),
        ),
        h('button', {
          type: 'button',
          className: 'esaBtn esaBtn--icon esaBtn--ghost',
          onClick: () => setSettingsOpen(true),
          'aria-label': '打开设置',
          title: '设置',
        }, h(Icon, { name: 'settings', size: 16 })),
      ),
    )

    if (!configured && !hasCachedReport) {
      return h('div', { className: 'esaRoot' },
        header,
        h('div', { className: 'esaBody' },
          h('div', { className: 'esaScroll' },
            h('div', { className: 'esaInner' },
              h(SyncBanner, { status, onSync: () => void syncNow(), busy: syncBusy }),
              h(ConnectPanel, { status, busy: busy === 'connect', error: connectError, onConnect: connect }),
            ),
          ),
        ),
        connectOpen ? h(Overlay, { onClose: () => setConnectOpen(false), label: '连接能源系统', modalClassName: 'esaModal--settings' },
          h('div', { className: 'esaModalHead' },
            h('div', { className: 'esaModalTitleWrap' },
              h('h2', { className: 'esaModalTitle' }, '连接能源系统'),
              h('p', { className: 'esaModalSub' }, '账号只保存在本机，不写入对话记录'),
            ),
            h('button', { type: 'button', className: 'esaBtn esaBtn--icon esaBtn--ghost', onClick: () => setConnectOpen(false), 'aria-label': '关闭' }, h(Icon, { name: 'close', size: 17 })),
          ),
          h('div', { className: 'esaModalBody' },
            h(ConnectForm, { initial: { baseUrl: status?.baseUrl, username: status?.username }, compact: true, busy: busy === 'connect', error: connectError, onSubmit: connect }),
          ),
        ) : null,
      )
    }

    if (!hasCachedReport) {
      return h('div', { className: 'esaRoot' },
        header,
        h('div', { className: 'esaBody' },
          h('div', { className: 'esaScroll' },
            h('div', { className: 'esaInner' },
              h(SyncBanner, { status, onSync: () => void syncNow(), busy: syncBusy }),
              h(AlreadyPanel, { status, busy: syncBusy, error: status?.error, onSync: () => void syncNow() }),
            ),
          ),
        ),
        settingsOpen ? h(SettingsDialog, {
          status,
          report,
          busy: busy === 'sync' || busy === 'disconnect',
          onClose: () => setSettingsOpen(false),
          onSync: () => void syncNow(),
          onDisconnect: disconnect,
          onReconnect: () => { setSettingsOpen(false); setConnectOpen(true) },
        }) : null,
        connectOpen ? h(Overlay, { onClose: () => setConnectOpen(false), label: '连接能源系统', modalClassName: 'esaModal--settings' },
          h('div', { className: 'esaModalHead' },
            h('div', { className: 'esaModalTitleWrap' },
              h('h2', { className: 'esaModalTitle' }, '连接能源系统'),
              h('p', { className: 'esaModalSub' }, '账号只保存在本机，不写入对话记录'),
            ),
            h('button', { type: 'button', className: 'esaBtn esaBtn--icon esaBtn--ghost', onClick: () => setConnectOpen(false), 'aria-label': '关闭' }, h(Icon, { name: 'close', size: 17 })),
          ),
          h('div', { className: 'esaModalBody' },
            h(ConnectForm, { initial: { baseUrl: status?.baseUrl, username: status?.username }, compact: true, busy: busy === 'connect', error: connectError, onSubmit: connect }),
          ),
        ) : null,
      )
    }

    const list = visible.tenants
    const codeList = visible.code
    const totalForFilter = filter === 'code'
      ? report.code.filter(matchesQuery).length
      : filter === 'model' && !showAllModel
        ? Math.min(12, report.tenants.filter((tenant) => tenant.model).filter(matchesQuery).length)
        : filter === 'focus'
          ? report.tenants.filter((tenant) => tenant.focus).filter(matchesQuery).length
          : filter === 'dual'
            ? report.tenants.filter((tenant) => tenant.heuristicHit || tenant.prevAbnormal).filter(matchesQuery).length
            : filter === 'negative'
              ? report.tenants.filter((tenant) => tenant.negative).filter(matchesQuery).length
              : filter === 'model'
                ? report.tenants.filter((tenant) => tenant.model).filter(matchesQuery).length
                : report.tenants.filter(matchesQuery).length
    const canLoadMore = filter === 'code'
      ? visibleCount < totalForFilter
      : filter === 'model' && !showAllModel
        ? false
        : visibleCount < totalForFilter

    const mainContent = h('div', { className: 'esaScroll' },
      h('div', { className: 'esaInner' },
        !configured
          ? h('div', { className: 'esaNotice' },
              '当前未连接能源系统，展示的是上次同步的缓存。',
              h('button', { type: 'button', className: 'esaBtn esaBtn--sm', style: { marginLeft: '10px' }, onClick: () => setConnectOpen(true) }, '重新连接'),
            )
          : null,
        h(SyncBanner, { status, onSync: () => void syncNow(), busy: syncBusy }),
        error ? h('div', { className: 'esaNotice esaNotice--risk', role: 'alert' }, error) : null,
        notice ? h('div', { className: 'esaNotice esaNotice--ok', role: 'status' }, notice, h('button', { type: 'button', className: 'esaTextBtn', style: { marginLeft: '8px' }, onClick: () => setNotice('') }, '知道了')) : null,
        h(Summary, { report, status, filter, onFilter: handleFilter }),
        h(Insight, { report }),
        h(Toolbar, {
          report,
          filter,
          onFilter: handleFilter,
          query,
          onQuery: setQuery,
          onToggleAll: () => setShowAllModel((value) => !value),
          allShown: showAllModel,
          counts,
        }),
        filter === 'code'
          ? (codeList.length
              ? h('div', { className: 'esaGrid' },
                  ...codeList.map((item) => h(CodeCard, {
                    key: item.id,
                    item,
                    curveState: curveFor(item.meterId),
                    onOpen: openCode,
                    onAsk: askCode,
                    onLoadCurve: loadCurve,
                    onRetryCurve: retryCurve,
                  })),
                )
              : h(EmptyState, { title: '没有匹配的代码侧异常', hint: query ? '换个关键词试试，或清空搜索。' : '这份报告没有代码侧异常。' }))
          : (list.length
              ? h('div', { className: 'esaGrid' },
                  ...list.map((tenant) => h(TenantCard, {
                    key: tenant.meterId,
                    tenant,
                    curveState: curveFor(tenant.meterId),
                    onOpen: openTenant,
                    onAsk: askTenant,
                    onLoadCurve: loadCurve,
                    onRetryCurve: retryCurve,
                  })),
                )
              : h(EmptyState, {
                  title: '没有匹配的异常租户',
                  hint: query ? '换个关键词试试，或清空搜索。' : '当前分类下没有记录。',
                  action: query ? h('button', { type: 'button', className: 'esaBtn esaBtn--sm', onClick: () => setQuery('') }, '清空搜索') : null,
                })),
        canLoadMore
          ? h('div', { className: 'esaLoadMore' },
              h('button', { type: 'button', className: 'esaBtn', onClick: () => setVisibleCount((count) => count + 24) }, `加载更多（已显示 ${filter === 'code' ? codeList.length : list.length} / ${totalForFilter}）`),
            )
          : null,
        h('p', { className: 'esaFinePrint', style: { marginTop: '18px' } },
          `报告 ${report.date} · 数据周期 ${report.period.from} 至 ${report.period.to} · 本地同步 ${fmtDateTime(report.syncedAt)}`,
          report.warnings?.length ? ` · ${report.warnings.join(' ')}` : '',
        ),
      ),
    )

    const body = chatOpen
      ? h('div', { className: 'esaSplit' },
          h('div', { className: 'esaSplitMain' }, mainContent),
          h(ChatDrawer, {
            conversation,
            busy: aiBusy,
            onClose: () => setChatOpen(false),
            onCreate: askReport,
          }),
        )
      : mainContent

    return h('div', { className: 'esaRoot' },
      header,
      h('div', { className: 'esaBody' }, body),
      selection ? h(DetailDialog, {
        selection,
        report,
        curveState: curveFor(selection.item.meterId),
        onClose: () => setSelection(null),
        onAsk: (target) => { setSelection(null); void suggestFor(target) },
        onRetryCurve: retryCurve,
      }) : null,
      settingsOpen ? h(SettingsDialog, {
        status,
        report,
        busy: busy === 'sync' || busy === 'disconnect',
        onClose: () => setSettingsOpen(false),
        onSync: () => void syncNow(),
        onDisconnect: disconnect,
        onReconnect: () => { setSettingsOpen(false); setConnectOpen(true) },
      }) : null,
      connectOpen ? h(Overlay, { onClose: () => setConnectOpen(false), label: '连接能源系统', modalClassName: 'esaModal--settings' },
        h('div', { className: 'esaModalHead' },
          h('div', { className: 'esaModalTitleWrap' },
            h('h2', { className: 'esaModalTitle' }, '连接能源系统'),
            h('p', { className: 'esaModalSub' }, '账号只保存在本机，不写入对话记录'),
          ),
          h('button', { type: 'button', className: 'esaBtn esaBtn--icon esaBtn--ghost', onClick: () => setConnectOpen(false), 'aria-label': '关闭' }, h(Icon, { name: 'close', size: 17 })),
        ),
        h('div', { className: 'esaModalBody' },
          h(ConnectForm, { initial: { baseUrl: status?.baseUrl, username: status?.username }, compact: true, busy: busy === 'connect', error: connectError, onSubmit: connect }),
        ),
      ) : null,
    )
  }

  class PanelErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { error: null }
    }

    static getDerivedStateFromError(error) {
      return { error }
    }

    componentDidCatch(error, info) {
      try {
        window.__ESA_LAST_ERROR__ = {
          message: error?.message || String(error),
          stack: error?.stack || '',
          componentStack: info?.componentStack || '',
          at: new Date().toISOString(),
        }
      } catch {
        /* diagnostics must never throw */
      }
      try {
        console.error('[electric-safety] panel render failed', error, info)
      } catch {
        /* ignore console failures */
      }
    }

    render() {
      if (this.state.error) {
        return h('div', { className: 'esaRoot' },
          h('header', { className: 'esaHeader', 'data-dsh-workbench-toolbar': '' },
            h('div', { className: 'esaBrand' },
              h('div', { className: 'esaBrandMark' }, h(Icon, { name: 'bolt', size: 17 })),
              h('div', { className: 'esaBrandText' },
                h('h1', { className: 'esaTitle' }, '用电安全助手'),
                h('p', { className: 'esaSubtitle' }, '界面加载出错'),
              ),
            ),
          ),
          h('div', { className: 'esaBody' },
            h('div', { className: 'esaScroll' },
              h('div', { className: 'esaInner' },
                h('div', { className: 'esaNotice esaNotice--risk', role: 'alert' },
                  '工作台界面加载出错：',
                  String(this.state.error?.message || this.state.error),
                ),
                h('button', { type: 'button', className: 'esaBtn', onClick: () => this.setState({ error: null }) }, '重试'),
              ),
            ),
          ),
        )
      }
      return this.props.children
    }
  }

  function apply(ctx) {
    const host = {
      sessions: ctx.sessions,
      conversation: ctx.conversation,
    }
    const Panel = (props) => h(PanelErrorBoundary, null, h(BusinessPanel, { ...props, host }))
    ctx.effect(() => ctx.desktopWorkbenches.register({
      title: '用电安全助手',
      description: '每日拉取能源管理系统 AI 自检报告，汇总异常租户并展示实际/预测用电曲线。',
      repository: 'https://github.com/Zcx-BaixiaoBai/ge-workbench-electric-safety',
      customFrame: true,
      headerLayout: 'compact',
    }, Panel), 'electric safety workbench registration')
  }

  return { apply, inject: ['desktopWorkbenches', 'sessions', 'conversation'] }
}