import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import vm from 'node:vm'

test('bundle registers the workbench as a compact custom frame', async () => {
  const source = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(source.includes('connection.env'), 'client should explain the local env file')
  assert.ok(!source.includes('ENERGY_PASSWORD'), 'client must never contain the credential env key')

  let loaded = null
  const appended = []
  const document = {
    getElementById: () => null,
    createElement: () => ({ id: '', textContent: '' }),
    head: { appendChild: (node) => appended.push(node) },
  }
  const window = {
    __ModuleLoader__: {
      load: (entry) => { loaded = entry },
    },
  }
  const context = vm.createContext({ window, document, console, Intl, URL, setTimeout, clearTimeout })
  vm.runInContext(source, context, { filename: 'lib/client.js' })

  assert.ok(loaded, 'module loader entry should be registered')
  assert.equal(loaded.id, 'ge-workbench-electric-safety')

  const React = {
    Component: class {},
    createElement: () => null,
    useCallback: (callback) => callback,
    useEffect: () => {},
    useMemo: (factory) => factory(),
    useRef: (value) => ({ current: value }),
    useState: (value) => [typeof value === 'function' ? value() : value, () => {}],
  }
  const plugin = loaded.factory((name) => {
    assert.equal(name, 'react')
    return React
  })

  assert.equal(typeof plugin.apply, 'function')
  assert.deepEqual(Array.from(plugin.inject), ['desktopWorkbenches', 'sessions', 'conversation'])

  let descriptor = null
  const ctx = {
    sessions: {},
    conversation: {},
    desktopWorkbenches: {
      register(next, Component) {
        descriptor = next
        assert.equal(typeof Component, 'function')
        return () => {}
      },
    },
    effect(callback) {
      callback()
    },
  }
  plugin.apply(ctx)

  assert.ok(descriptor, 'register() should receive a descriptor')
  assert.equal(descriptor.title, '用电安全助手')
  assert.equal(descriptor.repository, 'https://github.com/Zcx-BaixiaoBai/ge-workbench-electric-safety')
  assert.equal(descriptor.customFrame, true)
  assert.equal(descriptor.headerLayout, 'compact')
  assert.ok(appended.length >= 1, 'styles should be installed once')
})