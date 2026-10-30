import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const outDir = path.join(root, 'lighthouse-reports')
const lighthouse = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse')
const pages = [
  { name: 'home', path: '/' },
  { name: 'nft-detail', path: '/nfts/nft_1' },
]
const profiles = [
  { name: 'mobile', flags: ['--form-factor=mobile', '--screenEmulation.mobile=true'] },
  { name: 'desktop', flags: ['--preset=desktop', '--form-factor=desktop', '--screenEmulation.mobile=false'] },
]

await mkdir(outDir, { recursive: true })

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options })
    child.once('error', reject)
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)))
  })
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(url)).ok) return } catch { /* preview is starting */ }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('Preview did not start')
}

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit', detached: process.platform !== 'win32' })
try {
  await waitForServer('http://127.0.0.1:4173')
  for (const page of pages) {
    for (const profile of profiles) {
      for (let runNumber = 1; runNumber <= 3; runNumber += 1) {
        const base = path.join(outDir, `${page.name}-${profile.name}-${runNumber}`)
        await run(lighthouse, [`http://127.0.0.1:4173${page.path}`, '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless --no-sandbox', '--output=json', '--output=html', `--output-path=${base}`, ...profile.flags], { cwd: root, env: { ...process.env, CHROME_PATH: chromium.executablePath() } })
      }
    }
  }
  const summary = []
  for (const page of pages) for (const profile of profiles) {
    const records = []
    for (let runNumber = 1; runNumber <= 3; runNumber += 1) records.push(JSON.parse(await readFile(path.join(outDir, `${page.name}-${profile.name}-${runNumber}.report.json`), 'utf8')))
    const median = (values) => [...values].sort((a, b) => a - b)[1]
    summary.push({ page: page.name, profile: profile.name, performance: median(records.map((r) => r.categories.performance.score * 100)), accessibility: median(records.map((r) => r.categories.accessibility.score * 100)), bestPractices: median(records.map((r) => r.categories['best-practices'].score * 100)), seo: median(records.map((r) => r.categories.seo.score * 100)), lcpMs: median(records.map((r) => r.audits['largest-contentful-paint'].numericValue)), cls: median(records.map((r) => r.audits['cumulative-layout-shift'].numericValue)), tbtMs: median(records.map((r) => r.audits['total-blocking-time'].numericValue)) })
  }
  await writeFile(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
  console.table(summary)
} finally {
  if (preview.pid) process.kill(process.platform === 'win32' ? preview.pid : -preview.pid, 'SIGTERM')
}
