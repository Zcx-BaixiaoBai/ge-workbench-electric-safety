const CSS = `
.esaRoot{
  container-type:inline-size;
  container-name:esa;

  --esa-ink:#211f1a;
  --esa-ink-2:#655f55;
  --esa-ink-3:#8a8377;
  --esa-line:#e8e2d6;
  --esa-line-2:#f1ece3;
  --esa-surface:#ffffff;
  --esa-bg:#faf8f3;
  --esa-surface-2:#f7f3ea;
  --esa-surface-3:#f0eade;
  --esa-gold:#a8762b;
  --esa-gold-strong:#8a5f20;
  --esa-gold-soft:#f8efdd;
  --esa-gold-line:#e8d4ae;
  --esa-clay:#a8492f;
  --esa-clay-soft:#f9ede8;
  --esa-amber:#97701f;
  --esa-amber-soft:#faf1dd;
  --esa-moss:#56704b;
  --esa-moss-soft:#eef2e9;
  --esa-slate:#5c6874;
  --esa-slate-soft:#eef1f4;
  --esa-chart-actual:#2f6b5f;
  --esa-chart-pred:#a8762b;
  --esa-chart-band:rgba(168,118,43,.14);
  --esa-chart-night:rgba(92,104,116,.075);
  --esa-shadow:0 1px 2px rgba(33,31,26,.04), 0 12px 30px rgba(33,31,26,.06);
  --esa-radius:14px;
  --esa-ease:cubic-bezier(.22,.61,.36,1);

  position:relative;
  display:flex;
  flex-direction:column;
  flex:1 1 auto;
  min-height:0;
  min-width:0;
  width:100%;
  overflow:hidden;
  background:var(--esa-bg);
  color:var(--esa-ink);
  font-family:inherit;
  font-size:13px;
  line-height:20px;
  box-sizing:border-box;
  -webkit-font-smoothing:antialiased;
}
.esaRoot *{box-sizing:border-box}
.esaRoot button,.esaRoot input,.esaRoot select,.esaRoot textarea{font-family:inherit;font-size:13px;line-height:20px;color:inherit}
.esaRoot button{cursor:pointer}
.esaRoot button:disabled{cursor:default;opacity:.55}
.esaRoot :is(button,input,select,textarea,summary):focus-visible{outline:2px solid var(--esa-gold);outline-offset:2px}

body[data-ds-dark-theme] .esaRoot{
  --esa-ink:#f1eee7;
  --esa-ink-2:#b0a99b;
  --esa-ink-3:#918a7d;
  --esa-line:#312f2a;
  --esa-line-2:#282621;
  --esa-surface:#1c1b19;
  --esa-bg:#171614;
  --esa-surface-2:#22211e;
  --esa-surface-3:#2a2823;
  --esa-gold:#d0a55e;
  --esa-gold-strong:#ddbb7e;
  --esa-gold-soft:#2d2618;
  --esa-gold-line:#4a3a1d;
  --esa-clay:#d98a72;
  --esa-clay-soft:#2e211d;
  --esa-amber:#d3ad63;
  --esa-amber-soft:#2b2417;
  --esa-moss:#a2b795;
  --esa-moss-soft:#20261d;
  --esa-slate:#a3b0bc;
  --esa-slate-soft:#1f2429;
  --esa-chart-actual:#8fc6b6;
  --esa-chart-pred:#d0a55e;
  --esa-chart-band:rgba(208,165,94,.16);
  --esa-chart-night:rgba(163,176,188,.09);
  --esa-shadow:0 1px 2px rgba(0,0,0,.18), 0 14px 34px rgba(0,0,0,.24);
}

/* ---- 顶栏 ---------------------------------------------------- */
.esaHeader{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:14px;
  min-height:54px;
  padding:8px 22px;
  border-bottom:1px solid var(--esa-line);
  background:var(--esa-surface);
  position:relative;
  z-index:3;
}
.esaBrand{display:flex;align-items:center;gap:10px;min-width:0;flex:1 1 auto}
.esaBrandMark{
  flex:0 0 auto;width:30px;height:30px;border-radius:9px;
  display:grid;place-items:center;color:#fff;
  background:linear-gradient(145deg,#c08a39 0%,#a8762b 48%,#7f5519 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 2px 6px rgba(127,85,25,.22);
}
.esaBrandText{min-width:0}
.esaTitle{
  margin:0;font-size:14px;line-height:20px;font-weight:650;letter-spacing:.01em;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.esaSubtitle{
  margin:1px 0 0;font-size:11px;line-height:15px;color:var(--esa-ink-3);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.esaHeaderActions{display:flex;align-items:center;gap:8px;flex:0 0 auto;min-width:0}
.esaDateField{display:flex;align-items:center;gap:6px;min-width:0}
.esaDateLabel{font-size:11px;color:var(--esa-ink-3);white-space:nowrap}
.esaSelect{
  height:32px;max-width:138px;padding:0 26px 0 10px;
  border:1px solid var(--esa-line);border-radius:8px;
  background:var(--esa-surface-2);color:var(--esa-ink);
  appearance:none;background-image:linear-gradient(45deg,transparent 50%,var(--esa-ink-3) 50%),linear-gradient(135deg,var(--esa-ink-3) 50%,transparent 50%);
  background-position:calc(100% - 14px) 13px,calc(100% - 9px) 13px;
  background-size:5px 5px,5px 5px;background-repeat:no-repeat;
  text-overflow:ellipsis;
}
.esaSyncPill{
  display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 9px;
  border:1px solid transparent;border-radius:8px;color:var(--esa-ink-2);
  font-size:11.5px;white-space:nowrap;background:transparent;
}
.esaSyncPill:hover{border-color:var(--esa-line);background:var(--esa-surface-2)}
.esaDot{width:7px;height:7px;border-radius:50%;background:var(--esa-moss);flex:none}
.esaDot--warn{background:var(--esa-amber)}
.esaDot--risk{background:var(--esa-clay)}
.esaDot--busy{background:var(--esa-gold);animation:esaPulse 1.2s ease-in-out infinite}
@keyframes esaPulse{50%{opacity:.28}}

.esaBtn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  height:32px;padding:0 12px;white-space:nowrap;
  border:1px solid var(--esa-line);border-radius:8px;
  background:var(--esa-surface);color:var(--esa-ink);
  transition:background .16s ease,border-color .16s ease,transform .12s ease;
}
.esaBtn:hover:not(:disabled){background:var(--esa-surface-2);border-color:#d9d0c1}
.esaBtn:active:not(:disabled){transform:translateY(1px)}
.esaBtn svg{flex:0 0 auto}
.esaBtn--ghost{border-color:transparent;background:transparent;color:var(--esa-ink-2)}
.esaBtn--ghost:hover:not(:disabled){background:var(--esa-surface-2);color:var(--esa-ink)}
.esaBtn--primary{
  background:var(--dsw-alias-brand-primary-new-color,#a8762b);
  border-color:transparent;color:#fff;font-weight:500;
}
.esaBtn--primary:hover:not(:disabled){background:#93641f;border-color:transparent}
.esaBtn--primary:active:not(:disabled){background:#7f5519}
.esaBtn--icon{width:32px;padding:0}
.esaBtn--sm{height:28px;padding:0 9px;font-size:12px}
.esaBtn--danger{border-color:#e5c9c0;color:var(--esa-clay);background:var(--esa-clay-soft)}
.esaBtn--danger:hover:not(:disabled){background:#f4ddd5;border-color:#dbb3a7}
.esaSpin{animation:esaSpin .9s linear infinite}
@keyframes esaSpin{to{transform:rotate(360deg)}}

/* ---- 主体 ---------------------------------------------------- */
.esaBody{flex:1 1 auto;min-height:0;min-width:0;display:flex;flex-direction:column;overflow:hidden}
.esaScroll{
  container-type:inline-size;
  container-name:esa-content;
  flex:1 1 auto;min-height:0;min-width:0;overflow:auto;
  scroll-behavior:smooth;
}
.esaInner{max-width:1480px;margin:0 auto;padding:22px 26px 48px;min-width:0}
.esaScroll::-webkit-scrollbar{width:10px;height:10px}
.esaScroll::-webkit-scrollbar-thumb{background:#e1d9ca;border-radius:8px;border:3px solid var(--esa-bg)}
.esaScroll::-webkit-scrollbar-thumb:hover{background:#d2c8b6}
body[data-ds-dark-theme] .esaScroll::-webkit-scrollbar-thumb{background:#3a3833;border-color:var(--esa-bg)}

.esaSplit{flex:1 1 auto;min-height:0;min-width:0;display:flex;align-items:stretch;overflow:hidden}
.esaSplitMain{flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.esaChat{
  flex:0 0 420px;max-width:46%;min-width:320px;
  display:flex;flex-direction:column;min-height:0;
  border-left:1px solid var(--esa-line);background:var(--esa-surface);
  overflow:hidden;
}
.esaChatHeader{
  flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:10px 12px 10px 16px;border-bottom:1px solid var(--esa-line);
}
.esaChatTitle{margin:0;font-size:13px;line-height:20px;font-weight:600}
.esaChatHint{margin:1px 0 0;font-size:11px;line-height:15px;color:var(--esa-ink-3)}
.esaChatBody{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.esaChatEmpty{flex:1;display:grid;place-items:center;padding:28px;text-align:center;color:var(--esa-ink-2)}
.esaChatEmpty p{margin:0 0 12px;max-width:280px;overflow-wrap:anywhere}

/* ---- 汇总 ---------------------------------------------------- */
.esaSummary{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:12px;min-width:0}
.esaStat{
  display:flex;flex-direction:column;align-items:flex-start;gap:2px;
  min-width:0;padding:13px 14px 12px;text-align:left;
  border:1px solid var(--esa-line);border-radius:12px;background:var(--esa-surface);
  transition:border-color .16s ease,background .16s ease,transform .12s ease,box-shadow .16s ease;
}
.esaStat:hover{border-color:#d9d0c1;box-shadow:0 6px 18px rgba(33,31,26,.05);transform:translateY(-1px)}
.esaStat[aria-pressed=true]{border-color:var(--esa-gold-line);background:var(--esa-gold-soft);box-shadow:none}
.esaStatTop{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-width:0}
.esaStatLabel{font-size:11.5px;line-height:16px;color:var(--esa-ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esaStatIcon{flex:none;color:var(--esa-ink-3)}
.esaStatValue{font-size:26px;line-height:32px;font-weight:650;letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.esaStatNote{font-size:10.5px;line-height:15px;color:var(--esa-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.esaStatTone--risk .esaStatValue{color:var(--esa-clay)}
.esaStatTone--warn .esaStatValue{color:var(--esa-amber)}
.esaStatTone--good .esaStatValue{color:var(--esa-moss)}

.esaInsight{
  display:flex;align-items:flex-start;gap:11px;margin:14px 0 0;padding:12px 14px;
  border:1px solid var(--esa-gold-line);border-radius:12px;
  background:linear-gradient(100deg,var(--esa-gold-soft) 0%,var(--esa-surface) 78%);
  min-width:0;
}
.esaInsight--risk{border-color:#e7c9be;background:linear-gradient(100deg,var(--esa-clay-soft) 0%,var(--esa-surface) 78%)}
.esaInsightMark{flex:0 0 auto;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:rgba(168,118,43,.12);color:var(--esa-gold-strong)}
.esaInsight--risk .esaInsightMark{background:rgba(168,73,47,.12);color:var(--esa-clay)}
.esaInsightText{min-width:0}
.esaInsightTitle{margin:0;font-size:12px;line-height:18px;font-weight:650;color:var(--esa-ink)}
.esaInsightBody{margin:1px 0 0;font-size:11.5px;line-height:18px;color:var(--esa-ink-2);overflow-wrap:anywhere}

/* ---- 筛选栏 -------------------------------------------------- */
.esaToolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:18px 0 12px;flex-wrap:wrap;min-width:0}
.esaTabs{display:flex;align-items:center;gap:3px;flex-wrap:wrap;min-width:0}
.esaTab{
  display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;
  border:1px solid transparent;border-radius:8px;background:transparent;
  font-size:12.5px;color:var(--esa-ink-2);white-space:nowrap;
  transition:background .16s ease,border-color .16s ease,color .16s ease;
}
.esaTab:hover{background:var(--esa-surface-2);color:var(--esa-ink)}
.esaTab[aria-selected=true]{background:var(--esa-surface);border-color:var(--esa-line);color:var(--esa-ink);font-weight:600;box-shadow:0 1px 2px rgba(33,31,26,.04)}
.esaTabCount{font-size:10.5px;color:var(--esa-ink-3);font-variant-numeric:tabular-nums}
.esaTab[aria-selected=true] .esaTabCount{color:var(--esa-gold-strong)}
.esaFilterTools{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
.esaSearch{display:flex;align-items:center;gap:6px;height:32px;min-width:196px;padding:0 10px;border:1px solid var(--esa-line);border-radius:8px;background:var(--esa-surface);color:var(--esa-ink-3)}
.esaSearch input{border:0;outline:0;background:transparent;width:100%;min-width:0;color:var(--esa-ink)}
.esaSearch input::placeholder{color:var(--esa-ink-3)}
.esaChip{
  display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 8px;
  border:1px solid var(--esa-gold-line);border-radius:7px;background:var(--esa-gold-soft);
  color:var(--esa-gold-strong);font-size:11px;white-space:nowrap;
}
.esaChip button{border:0;background:transparent;padding:0;height:16px;color:inherit;display:inline-flex;align-items:center}

/* ---- 租户卡片 ------------------------------------------------ */
.esaGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(336px,1fr));gap:14px;min-width:0;align-items:start}
.esaCard{
  display:flex;flex-direction:column;min-width:0;
  border:1px solid var(--esa-line);border-radius:var(--esa-radius);background:var(--esa-surface);
  padding:13px 14px 11px;box-shadow:0 1px 2px rgba(33,31,26,.035);
  transition:border-color .16s ease,box-shadow .18s ease,transform .14s var(--esa-ease);
  content-visibility:auto;contain-intrinsic-size:310px;
}
.esaCard:hover{border-color:#d8cebd;box-shadow:var(--esa-shadow);transform:translateY(-1px)}
.esaCardTop{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;min-width:0}
.esaCardNameWrap{min-width:0;flex:1 1 auto}
.esaCardName{
  margin:0;font-size:15px;line-height:22px;font-weight:650;letter-spacing:.005em;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.esaCardMeta{
  margin:2px 0 0;font-size:11px;line-height:16px;color:var(--esa-ink-3);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.esaBadges{display:flex;flex-wrap:wrap;gap:4px;min-width:0}
.esaBadge{
  display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;
  border-radius:5px;border:1px solid transparent;font-size:10px;line-height:18px;
  white-space:nowrap;font-weight:500;
}
.esaBadge--dual{background:var(--esa-clay-soft);border-color:#eccfc5;color:var(--esa-clay)}
.esaBadge--prev{background:var(--esa-amber-soft);border-color:#ead6ae;color:var(--esa-amber)}
.esaBadge--negative{background:var(--esa-slate-soft);border-color:#d9e0e5;color:var(--esa-slate)}
.esaBadge--model{background:var(--esa-gold-soft);border-color:var(--esa-gold-line);color:var(--esa-gold-strong)}
.esaBadge--code{background:var(--esa-clay-soft);border-color:#eccfc5;color:var(--esa-clay)}
.esaBadge--fault{background:var(--esa-amber-soft);border-color:#ead6ae;color:var(--esa-amber)}
.esaMetrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:11px;min-width:0}
.esaMetric{min-width:0;padding:6px 7px 5px;border-radius:8px;background:var(--esa-surface-2)}
.esaMetricLabel{font-size:9.5px;line-height:14px;color:var(--esa-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esaMetricValue{
  margin-top:1px;font-size:12.5px;line-height:18px;font-weight:600;font-variant-numeric:tabular-nums;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.esaMetricValue--risk{color:var(--esa-clay)}
.esaMetricValue--warn{color:var(--esa-amber)}
.esaMetricValue--good{color:var(--esa-moss)}
.esaChartBox{margin-top:9px;min-width:0;border-radius:10px;background:var(--esa-surface-2);padding:5px 5px 3px;overflow:hidden}
.esaChartLegend{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:4px 5px 3px;font-size:9.5px;line-height:14px;color:var(--esa-ink-3)}
.esaLegendItem{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.esaLegendSwatch{width:9px;height:3px;border-radius:2px;flex:none}
.esaLegendSwatch--band{height:8px;border-radius:2px;background:var(--esa-chart-band)}
.esaLegendSwatch--night{height:8px;border-radius:2px;background:var(--esa-chart-night)}
.esaCardFoot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;min-width:0}
.esaCardFootNote{font-size:10px;line-height:15px;color:var(--esa-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esaCardActions{display:flex;align-items:center;gap:2px;flex:none}
.esaTextBtn{
  display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 6px;
  border:0;border-radius:6px;background:transparent;color:var(--esa-gold-strong);
  font-size:11px;white-space:nowrap;
}
.esaTextBtn:hover{background:var(--esa-gold-soft)}
.esaTextBtn--muted{color:var(--esa-ink-2)}
.esaTextBtn--muted:hover{background:var(--esa-surface-2)}

/* ---- 代码侧异常卡片 ------------------------------------------ */
.esaCodeCard .esaCardName{font-size:14px}
.esaCodeDesc{margin:8px 0 0;font-size:11.5px;line-height:18px;color:var(--esa-ink-2);overflow-wrap:anywhere}
.esaCodeMetrics{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.esaCodeMetric{display:inline-flex;align-items:baseline;gap:4px;padding:3px 7px;border-radius:6px;background:var(--esa-surface-2);font-size:10px;color:var(--esa-ink-3)}
.esaCodeMetric strong{font-size:11.5px;color:var(--esa-ink);font-weight:600;font-variant-numeric:tabular-nums}

/* ---- 空状态 / 骨架屏 / 提示 --------------------------------- */
.esaEmpty{padding:46px 20px;text-align:center;color:var(--esa-ink-2);overflow-wrap:anywhere}
.esaEmptyMark{width:42px;height:42px;margin:0 auto 12px;border-radius:13px;display:grid;place-items:center;background:var(--esa-surface-2);color:var(--esa-ink-3)}
.esaEmptyTitle{margin:0 0 5px;font-size:14px;line-height:21px;font-weight:600;color:var(--esa-ink)}
.esaEmptyHint{margin:0 auto;max-width:460px;font-size:12px;line-height:19px;color:var(--esa-ink-2)}
.esaEmptyActions{display:flex;justify-content:center;gap:8px;margin-top:14px;flex-wrap:wrap}
.esaSha{display:flex;flex-direction:column;gap:12px}
.esaShaRow{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.esaShaBlock{border-radius:12px;background:linear-gradient(90deg,var(--esa-surface-2) 25%,var(--esa-surface-3) 37%,var(--esa-surface-2) 63%);background-size:400% 100%;animation:esaShimmer 1.5s ease infinite}
@keyframes esaShimmer{0%{background-position:100% 0}100%{background-position:0 0}}
.esaNotice{
  margin:0 0 13px;padding:9px 12px;border-radius:9px;font-size:11.5px;line-height:18px;
  background:var(--esa-amber-soft);border:1px solid #ecdab4;color:#7c5d1c;overflow-wrap:anywhere;
}
.esaNotice--risk{background:var(--esa-clay-soft);border-color:#eccfc5;color:#853a26}
.esaNotice--ok{background:var(--esa-moss-soft);border-color:#d9e2d2;color:#40573a}
body[data-ds-dark-theme] .esaNotice{color:#e0c383;border-color:#463a22}
body[data-ds-dark-theme] .esaNotice--risk{color:#e2a18e;border-color:#4d2e26}
body[data-ds-dark-theme] .esaNotice--ok{color:#b5c9a9;border-color:#33402b}
.esaLoadMore{display:flex;justify-content:center;padding:18px 0 4px}

/* ---- 连接引导 ------------------------------------------------ */
.esaConnectWrap{max-width:720px;margin:26px auto 0;padding:0 6px}
.esaConnectCard{
  border:1px solid var(--esa-line);border-radius:16px;background:var(--esa-surface);
  padding:26px 28px 24px;box-shadow:var(--esa-shadow);
}
.esaConnectEyebrow{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:3px 8px;border-radius:6px;background:var(--esa-gold-soft);color:var(--esa-gold-strong);font-size:10.5px;font-weight:500}
.esaConnectTitle{margin:0;font-size:21px;line-height:30px;font-weight:650;letter-spacing:-.01em}
.esaConnectIntro{margin:6px 0 0;font-size:12.5px;line-height:20px;color:var(--esa-ink-2);overflow-wrap:anywhere}
.esaForm{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
.esaField{display:flex;flex-direction:column;gap:5px;min-width:0}
.esaField--wide{grid-column:1 / -1}
.esaFieldLabel{font-size:11.5px;line-height:16px;color:var(--esa-ink-2);font-weight:500}
.esaInput{
  height:36px;width:100%;padding:0 10px;border:1px solid var(--esa-line);border-radius:8px;
  background:var(--esa-surface);color:var(--esa-ink);outline:0;
}
.esaInput:focus{border-color:var(--esa-gold);box-shadow:0 0 0 3px rgba(168,118,43,.12)}
.esaInput::placeholder{color:var(--esa-ink-3)}
.esaFormActions{grid-column:1 / -1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:2px}
.esaFinePrint{font-size:10.5px;line-height:16px;color:var(--esa-ink-3);max-width:430px;overflow-wrap:anywhere}
.esaConnectAside{display:flex;align-items:flex-start;gap:9px;margin-top:18px;padding:10px 12px;border-radius:9px;background:var(--esa-surface-2);color:var(--esa-ink-2);font-size:11px;line-height:17px}
.esaConnectAside svg{flex:none;margin-top:1px;color:var(--esa-gold)}
.esaAlready{max-width:720px;margin:26px auto 0;padding:0 6px}
.esaAlreadyCard{border:1px solid var(--esa-line);border-radius:14px;background:var(--esa-surface);padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.esaAlreadyText{min-width:0}
.esaAlreadyTitle{margin:0;font-size:14px;line-height:21px;font-weight:600}
.esaAlreadyHint{margin:2px 0 0;font-size:11.5px;line-height:18px;color:var(--esa-ink-2);overflow-wrap:anywhere}

/* ---- 图表 ---------------------------------------------------- */
.esaChart{display:block;width:100%;height:auto;overflow:visible}
.esaChart--detail{min-width:620px}
.esaChartSkeleton{height:132px;border-radius:9px;background:linear-gradient(90deg,var(--esa-surface-2) 25%,var(--esa-surface-3) 37%,var(--esa-surface-2) 63%);background-size:400% 100%;animation:esaShimmer 1.5s ease infinite}
.esaChartError{display:flex;align-items:center;justify-content:center;gap:8px;min-height:132px;padding:10px;border-radius:9px;background:var(--esa-surface-2);font-size:11px;color:var(--esa-ink-2);text-align:center;flex-wrap:wrap}
.esaChartEmpty{display:grid;place-items:center;min-height:132px;padding:10px;border-radius:9px;background:var(--esa-surface-2);font-size:11px;color:var(--esa-ink-3);text-align:center}
.esaChartWrap--detail{overflow-x:auto;border:1px solid var(--esa-line);border-radius:12px;background:var(--esa-surface-2);padding:10px 8px 6px}
.esaChartWrap--detail::-webkit-scrollbar{height:9px}
.esaChartWrap--detail::-webkit-scrollbar-thumb{background:#d9d0c1;border-radius:8px;border:2px solid var(--esa-surface-2)}

/* ---- 详情弹层 ------------------------------------------------ */
.esaOverlay{
  position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;
  padding:24px;background:rgba(33,31,26,.34);backdrop-filter:blur(2px);
}
.esaModal{
  width:min(920px,100%);max-height:calc(100% - 8px);overflow:auto;
  border:1px solid var(--esa-line);border-radius:16px;background:var(--esa-surface);
  box-shadow:0 30px 80px rgba(20,18,14,.28);
  animation:esaModalIn .18s var(--esa-ease);
}
.esaModal--settings{width:min(560px,100%)}
@keyframes esaModalIn{from{opacity:0;transform:translateY(6px) scale(.992)}to{opacity:1;transform:none}}
.esaModalHead{
  position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  padding:16px 18px 13px;border-bottom:1px solid var(--esa-line);background:var(--esa-surface);
}
.esaModalTitleWrap{min-width:0}
.esaModalTitle{margin:0;font-size:16px;line-height:24px;font-weight:650;overflow-wrap:anywhere}
.esaModalSub{margin:2px 0 0;font-size:11.5px;line-height:17px;color:var(--esa-ink-3);overflow-wrap:anywhere}
.esaModalBody{padding:16px 18px 20px;min-width:0}
.esaDetailStats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:13px}
.esaDetailStat{min-width:0;padding:8px 9px;border-radius:9px;background:var(--esa-surface-2)}
.esaDetailStatLabel{font-size:10px;line-height:14px;color:var(--esa-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esaDetailStatValue{margin-top:1px;font-size:13px;line-height:19px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.esaDetailSection{margin-top:14px}
.esaDetailSectionTitle{margin:0 0 7px;font-size:12px;line-height:18px;font-weight:600}
.esaTableWrap{overflow-x:auto;border:1px solid var(--esa-line);border-radius:10px}
.esaTable{width:100%;border-collapse:collapse;font-size:11.5px;min-width:520px}
.esaTable th,.esaTable td{padding:7px 9px;text-align:left;border-bottom:1px solid var(--esa-line-2);white-space:nowrap}
.esaTable th{font-size:10px;color:var(--esa-ink-3);font-weight:500;background:var(--esa-surface-2)}
.esaTable tr:last-child td{border-bottom:0}
.esaTable td:nth-child(n+2){font-variant-numeric:tabular-nums}
.esaModalActions{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:16px}
.esaModalActionsRight{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* ---- 设置弹层 ------------------------------------------------ */
.esaSettingsGroup{display:flex;flex-direction:column;gap:10px;padding:12px 0;border-bottom:1px solid var(--esa-line-2)}
.esaSettingsGroup:last-child{border-bottom:0;padding-bottom:0}
.esaSettingsRow{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;font-size:12px;line-height:19px}
.esaSettingsKey{color:var(--esa-ink-3);flex:none}
.esaSettingsValue{color:var(--esa-ink);text-align:right;min-width:0;overflow-wrap:anywhere}
.esaSettingsNote{font-size:11px;line-height:17px;color:var(--esa-ink-3);overflow-wrap:anywhere}
.esaSettingsActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

/* ---- 提示条 -------------------------------------------------- */
.esaSyncError{
  display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  margin:0 0 14px;padding:10px 12px;border-radius:9px;
  background:var(--esa-clay-soft);border:1px solid #eccfc5;color:#853a26;
  font-size:11.5px;line-height:18px;overflow-wrap:anywhere;
}
.esaSyncError button{flex:none}
body[data-ds-dark-theme] .esaSyncError{color:#e2a18e;border-color:#4d2e26}

/* ---- 响应式：按业务内容容器宽度重排 ------------------------- */
@container esa-content (max-width: 1120px){
  .esaDetailStats{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@container esa-content (max-width: 880px){
  .esaSummary{grid-template-columns:repeat(auto-fit,minmax(148px,1fr))}
  .esaGrid{grid-template-columns:repeat(auto-fill,minmax(310px,1fr))}
  .esaToolbar{align-items:flex-start}
  .esaFilterTools{width:100%}
  .esaSearch{flex:1 1 220px}
}
@container esa-content (max-width: 620px){
  .esaInner{padding:16px 14px 38px}
  .esaSummary{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .esaStat{padding:11px 11px 10px}
  .esaStatValue{font-size:23px;line-height:29px}
  .esaGrid{grid-template-columns:1fr;gap:11px}
  .esaMetrics{grid-template-columns:repeat(2,minmax(0,1fr))}
  .esaToolbar{margin-top:14px}
  .esaTabs{width:100%;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:1px}
  .esaTabs::-webkit-scrollbar{display:none}
  .esaTab{flex:0 0 auto}
  .esaDetailStats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .esaOverlay{padding:8px}
  .esaModal{max-height:calc(100% - 4px);border-radius:13px}
  .esaModalHead{padding:13px 14px 11px}
  .esaModalBody{padding:13px 14px 16px}
  .esaConnectCard{padding:20px 17px 18px}
  .esaConnectTitle{font-size:19px;line-height:27px}
  .esaForm{grid-template-columns:1fr}
  .esaFormActions{align-items:flex-start;flex-direction:column}
  .esaAlreadyCard{padding:15px}
}
@container esa (max-width: 1080px){
  .esaSubtitle{display:none}
  .esaHeader{gap:10px}
}
@container esa (max-width: 860px){
  .esaHeader{padding:8px 14px;flex-wrap:wrap;row-gap:8px}
  .esaBrand{flex:1 1 220px}
  .esaHeaderActions{flex:1 1 auto;justify-content:flex-end}
  .esaDateLabel{display:none}
  .esaSyncPill span.esaSyncText{display:none}
  .esaBtn--sync .esaBtnLabel{display:none}
  .esaBtn--sync{width:32px;padding:0}
}
@container esa (max-width: 560px){
  .esaHeader{padding:8px 11px}
  .esaBrandMark{width:28px;height:28px}
  .esaTitle{font-size:13px}
  .esaDateField{display:none}
  .esaHeaderActions{gap:4px}
  .esaBtn--ai .esaBtnLabel{display:none}
  .esaBtn--ai{width:32px;padding:0}
}
@container esa (max-width: 900px){
  .esaChat{
    position:absolute;inset:0;z-index:30;flex:none;width:100%;max-width:none;min-width:0;
    border-left:0;box-shadow:-12px 0 32px rgba(20,18,14,.16);
  }
  .esaSplit{position:relative}
}

/* ---- 减少动效 ------------------------------------------------- */
@media (prefers-reduced-motion: reduce){
  .esaRoot *{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}
}
`;

export default CSS;