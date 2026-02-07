// Simple DB health check against local server
(async () => {
  try {
    const res = await fetch('http://localhost:3000/health/db');
    const txt = await res.text();
    console.log('HEALTH:', txt);
  } catch (e) {
    console.error('HEALTH FAILED:', e);
    process.exit(1);
  }
})();
