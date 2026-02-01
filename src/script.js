const speedEl = document.getElementById("speed")
const toast = document.getElementById("toast")
const label = document.querySelector(".label")

const testUrl = "https://speed.cloudflare.com/__down?bytes=20000000"
const duration = 8000

let samples = []
let startTime = performance.now()

async function run() {
  while (performance.now() - startTime < duration) {
    const t0 = performance.now()
    const res = await fetch(testUrl, { cache: "no-store" })
    const reader = res.body.getReader()
    let bytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.length

      const elapsed = (performance.now() - t0) / 1000
      if (elapsed > 0) {
        const live = (bytes * 8) / elapsed / 1024 / 1024
        speedEl.textContent = live.toFixed(2)
      }
    }

    const total = (performance.now() - t0) / 1000
    const mbps = (bytes * 8) / total / 1024 / 1024
    samples.push(mbps)
  }

  finish()
}

function finish() {
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length
  speedEl.textContent = avg.toFixed(2)
  label.textContent = "Completed"

  if (avg <= 50) {
    notify("Your internet speed is poor. Try moving closer to your router or checking your connection.")
  }
}

function notify(text) {
  toast.textContent = text
  toast.classList.add("show")
}

run()
