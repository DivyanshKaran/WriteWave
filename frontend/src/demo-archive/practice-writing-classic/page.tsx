"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';

type KanjiItem = {
  kanji: string;
  reading: string; // format: kunyomi/onyomi
  meaning: string;
};

const GROUP_A: KanjiItem[] = [
  { kanji: '山', reading: 'やま/サン', meaning: 'mountain' },
  { kanji: '川', reading: 'かわ/セン', meaning: 'river' },
  { kanji: '木', reading: 'き/モク', meaning: 'tree' },
  { kanji: '水', reading: 'みず/スイ', meaning: 'water' },
  { kanji: '火', reading: 'ひ/カ', meaning: 'fire' },
  { kanji: '土', reading: 'つち/ド', meaning: 'soil' },
  { kanji: '日', reading: 'ひ/ニチ', meaning: 'sun' },
  { kanji: '月', reading: 'つき/ゲツ', meaning: 'moon' },
  { kanji: '人', reading: 'ひと/ジン', meaning: 'person' },
  { kanji: '大', reading: 'おお/ダイ', meaning: 'big' }
];

const GROUP_B: KanjiItem[] = [
  { kanji: '本', reading: 'ほん/ホン', meaning: 'book' },
  { kanji: '花', reading: 'はな/カ', meaning: 'flower' },
  { kanji: '雨', reading: 'あめ/ウ', meaning: 'rain' },
  { kanji: '風', reading: 'かぜ/フウ', meaning: 'wind' },
  { kanji: '空', reading: 'そら/クウ', meaning: 'sky' },
  { kanji: '林', reading: 'はやし/リン', meaning: 'forest' },
  { kanji: '森', reading: 'もり/シン', meaning: 'forest' },
  { kanji: '石', reading: 'いし/セキ', meaning: 'stone' },
  { kanji: '竹', reading: 'たけ/チク', meaning: 'bamboo' },
  { kanji: '糸', reading: 'いと/シ', meaning: 'thread' }
];

export default function ClassicWritingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<KanjiItem>(GROUP_A[0]);
  const [isDrawing, setIsDrawing] = useState(false);

  const [kunyomi, onyomi] = useMemo(() => {
    const parts = selected.reading.split('/');
    return [parts[0] ?? '', parts[1] ?? ''];
  }, [selected]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof TouchEvent) {
        const t = e.touches[0] ?? e.changedTouches[0];
        return { x: (t.clientX - rect.left), y: (t.clientY - rect.top) };
      }
      const m = e as MouseEvent;
      return { x: (m.clientX - rect.left), y: (m.clientY - rect.top) };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const end = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start as any);
      canvas.removeEventListener('touchmove', move as any);
      window.removeEventListener('touchend', end);
    };
  }, [isDrawing]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const showHint = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.font = '400px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#999999';
    ctx.fillText(selected.kanji, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  };

  const checkDrawing = () => {
    alert('Great job! Keep practicing! 頑張って！');
  };

  const onSelect = (item: KanjiItem) => {
    setSelected(item);
    clearCanvas();
  };

  return (
    <div>
      <header className="header">
        <div className="logo">漢字 MASTER</div>
        <div
          className={menuOpen ? 'burger active' : 'burger'}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen(!menuOpen); }}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      <div className={menuOpen ? 'side-menu active' : 'side-menu'}>
        <div className="menu-section">
          <h3>Hiragana あ-な</h3>
          <div className="kanji-grid">
            {GROUP_A.map((k) => (
              <button
                key={k.kanji}
                className={
                  'kanji-item' + (selected.kanji === k.kanji ? ' selected' : '')
                }
                onClick={() => onSelect(k)}
                aria-pressed={selected.kanji === k.kanji}
              >
                {k.kanji}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <h3>Hiragana は-ん</h3>
          <div className="kanji-grid">
            {GROUP_B.map((k) => (
              <button
                key={k.kanji}
                className={
                  'kanji-item' + (selected.kanji === k.kanji ? ' selected' : '')
                }
                onClick={() => onSelect(k)}
                aria-pressed={selected.kanji === k.kanji}
              >
                {k.kanji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main>
        <section className="canvas-section">
          <div className="canvas-header">
            <h1 id="currentKanji">{selected.kanji}</h1>
            <p id="currentMeaning">{selected.meaning}</p>
          </div>
          <div className="canvas-container">
            <canvas id="drawingCanvas" ref={canvasRef} width={500} height={500}></canvas>
          </div>
          <div className="canvas-controls">
            <button className="btn btn-primary" onClick={checkDrawing}>Check</button>
            <button className="btn btn-secondary" onClick={showHint}>Show Hint</button>
            <button className="btn btn-danger" onClick={clearCanvas}>Clear</button>
          </div>
        </section>

        <section className="info-section">
          <div className="info-block">
            <h2>Pronunciation</h2>
            <div className="pronunciation">
              <div className="pronunciation-item">
                <div className="pronunciation-label">Kun'yomi</div>
                <div className="pronunciation-value" id="kunyomi">{kunyomi}</div>
              </div>
              <div className="pronunciation-item">
                <div className="pronunciation-label">On'yomi</div>
                <div className="pronunciation-value" id="onyomi">{onyomi}</div>
              </div>
            </div>
          </div>

          <div className="info-block">
            <h2>Stroke Order</h2>
            <div className="stroke-order">
              <div className="stroke-step">
                <span className="stroke-number">1</span>
                <span>｜</span>
              </div>
              <div className="stroke-step">
                <span className="stroke-number">2</span>
                <span>山</span>
              </div>
              <div className="stroke-step">
                <span className="stroke-number">3</span>
                <span>山</span>
              </div>
            </div>
          </div>

          <div className="info-block">
            <h2>Vocabulary</h2>
            <div className="vocabulary-list">
              <div className="vocab-item">
                <div className="vocab-kanji">{selected.kanji}</div>
                <div className="vocab-reading">{kunyomi}</div>
                <div className="vocab-meaning">{selected.meaning}</div>
              </div>
              <div className="vocab-item">
                <div className="vocab-kanji">火山</div>
                <div className="vocab-reading">かざん</div>
                <div className="vocab-meaning">volcano</div>
              </div>
              <div className="vocab-item">
                <div className="vocab-kanji">登山</div>
                <div className="vocab-reading">とざん</div>
                <div className="vocab-meaning">mountain climbing</div>
              </div>
              <div className="vocab-item">
                <div className="vocab-kanji">山林</div>
                <div className="vocab-reading">さんりん</div>
                <div className="vocab-meaning">mountain forest</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --black: #000000;
          --white: #FFFFFF;
          --gray-100: #F5F5F5;
          --gray-200: #E8E8E8;
          --gray-300: #CCCCCC;
          --gray-400: #999999;
          --accent-green: #00FF88;
          --accent-red: #FF3366;
          --accent-green-hover: #00CC6A;
          --accent-red-hover: #CC2952;
        }
        .header {
          position: fixed; top: 0; left: 0; right: 0; height: 80px;
          background: var(--white); border-bottom: 2px solid var(--black);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; z-index: 1000;
        }
        .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .burger { width: 40px; height: 40px; cursor: pointer; display: flex; flex-direction: column; justify-content: center; gap: 8px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .burger:hover { transform: scale(1.1); }
        .burger span { display: block; height: 2px; background: var(--black); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .burger.active span:nth-child(1) { transform: rotate(45deg) translate(8px, 8px); }
        .burger.active span:nth-child(2) { opacity: 0; }
        .burger.active span:nth-child(3) { transform: rotate(-45deg) translate(8px, -8px); }

        .side-menu { position: fixed; top: 80px; right: -400px; width: 400px; height: calc(100vh - 80px); background: var(--white); border-left: 2px solid var(--black); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 999; overflow-y: auto; }
        .side-menu.active { right: 0; }
        .menu-section { padding: 30px; border-bottom: 1px solid var(--gray-200); }
        .menu-section h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; font-weight: 600; }
        .kanji-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .kanji-item { aspect-ratio: 1; border: 1px solid var(--gray-300); display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; transition: all 0.2s ease; background: var(--white); }
        .kanji-item:hover { background: var(--black); color: var(--white); transform: scale(1.05); }
        .kanji-item.selected { background: var(--black); color: var(--white); border-color: var(--black); }

        main { margin-top: 80px; display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 80px); }
        .canvas-section { border-right: 2px solid var(--black); display: flex; flex-direction: column; background: var(--gray-100); position: relative; }
        .canvas-header { padding: 40px; background: var(--white); border-bottom: 1px solid var(--gray-200); }
        .canvas-header h1 { font-size: 72px; font-weight: 300; margin-bottom: 10px; }
        .canvas-header p { font-size: 18px; color: var(--gray-400); }
        .canvas-container { flex: 1; padding: 40px; display: flex; align-items: center; justify-content: center; }
        #drawingCanvas { border: 2px solid var(--black); background: var(--white); cursor: crosshair; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .canvas-controls { padding: 30px 40px; background: var(--white); border-top: 1px solid var(--gray-200); display: flex; gap: 15px; }
        .btn { padding: 15px 30px; font-size: 14px; font-weight: 600; border: 2px solid var(--black); cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 1px; }
        .btn-primary { background: var(--accent-green); color: var(--black); border-color: var(--accent-green); }
        .btn-primary:hover { background: var(--accent-green-hover); border-color: var(--accent-green-hover); transform: translateY(-2px); }
        .btn-secondary { background: var(--white); color: var(--black); }
        .btn-secondary:hover { background: var(--black); color: var(--white); }
        .btn-danger { background: var(--accent-red); color: var(--white); border-color: var(--accent-red); }
        .btn-danger:hover { background: var(--accent-red-hover); border-color: var(--accent-red-hover); }

        .info-section { display: flex; flex-direction: column; background: var(--white); }
        .info-block { padding: 40px; border-bottom: 1px solid var(--gray-200); animation: fadeIn 0.6s ease; }
        .info-block h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; font-weight: 600; color: var(--gray-400); }
        .stroke-order { display: flex; gap: 15px; flex-wrap: wrap; }
        .stroke-step { width: 80px; height: 80px; border: 1px solid var(--gray-300); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 36px; position: relative; background: var(--gray-100); }
        .stroke-number { position: absolute; top: 5px; left: 8px; font-size: 10px; font-weight: 600; color: var(--gray-400); }
        .pronunciation { display: flex; gap: 20px; margin-bottom: 20px; }
        .pronunciation-item { flex: 1; padding: 20px; background: var(--gray-100); border: 1px solid var(--gray-200); }
        .pronunciation-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--gray-400); margin-bottom: 8px; }
        .pronunciation-value { font-size: 24px; font-weight: 300; }
        .vocabulary-list { display: flex; flex-direction: column; gap: 15px; }
        .vocab-item { padding: 20px; border: 1px solid var(--gray-200); background: var(--gray-100); transition: all 0.2s ease; cursor: pointer; }
        .vocab-item:hover { border-color: var(--black); transform: translateX(5px); }
        .vocab-kanji { font-size: 24px; margin-bottom: 5px; }
        .vocab-reading { font-size: 14px; color: var(--gray-400); margin-bottom: 5px; }
        .vocab-meaning { font-size: 14px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) {
          main { grid-template-columns: 1fr; }
          .canvas-section { border-right: none; border-bottom: 2px solid var(--black); }
          .side-menu { width: 100%; right: -100%; }
        }
      `}</style>
    </div>
  );
}


