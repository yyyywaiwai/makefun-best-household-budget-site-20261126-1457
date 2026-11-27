// Maplewood Ledger — charts drawn with plain canvas, no library.
// A donut for the month's spending split and bars for the monthly trend.

export function paintDonut(canvas, slices) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 8;
  const inner = outer * 0.58;
  ctx.clearRect(0, 0, width, height);
  const total = slices.reduce((sum, s) => sum + s.spent, 0);
  if (total <= 0) {
    ctx.fillStyle = '#a8a29e';
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No spending yet this month', cx, cy);
    return;
  }
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    if (slice.spent <= 0) continue;
    const sweep = (slice.spent / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#1c1917';
  ctx.font = '800 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`$${Math.round(total).toLocaleString('en-US')}`, cx, cy - 2);
  ctx.fillStyle = '#78716c';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText('spent this month', cx, cy + 20);
}

export function paintMonthBars(canvas, months) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  if (months.length === 0) return;
  const padLeft = 52;
  const padBottom = 30;
  const padTop = 14;
  const plotW = width - padLeft - 12;
  const plotH = height - padTop - padBottom;
  const maxVal = Math.max(...months.flatMap((m) => [m.income, m.spending]), 100);
  const niceMax = Math.ceil(maxVal / 1000) * 1000;
  const yOf = (v) => padTop + plotH - (v / niceMax) * plotH;

  ctx.strokeStyle = '#e7e0d4';
  ctx.fillStyle = '#78716c';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let step = 0; step <= 4; step += 1) {
    const value = (niceMax / 4) * step;
    const y = yOf(value);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
    ctx.fillText(`$${Math.round(value / 1000)}k`, padLeft - 8, y + 4);
  }

  const slot = plotW / months.length;
  const barW = Math.min(30, slot / 3.2);
  months.forEach((m, i) => {
    const center = padLeft + slot * i + slot / 2;
    ctx.fillStyle = '#0f766e';
    const incomeH = plotH - (yOf(m.income) - padTop);
    ctx.fillRect(center - barW - 3, yOf(m.income), barW, incomeH);
    ctx.fillStyle = '#d97706';
    const spendH = plotH - (yOf(m.spending) - padTop);
    ctx.fillRect(center + 3, yOf(m.spending), barW, spendH);
    ctx.fillStyle = '#1c1917';
    ctx.textAlign = 'center';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText(m.month.slice(5), center, height - 10);
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(padLeft, 2, 12, 12);
  ctx.fillStyle = '#1c1917';
  ctx.fillText('Income', padLeft + 18, 12);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(padLeft + 86, 2, 12, 12);
  ctx.fillStyle = '#1c1917';
  ctx.fillText('Spending', padLeft + 104, 12);
}
