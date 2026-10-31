import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import './App.css'

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  const readFile = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください。')
      return
    }

    setFileName(file.name)
    setText('')
    setError('')
    setCopied(false)
    setPreviewUrl(URL.createObjectURL(file))

    const image = new Image()
    const imageUrl = URL.createObjectURL(file)
    image.onload = () => {
      const scale = Math.min(1, 1800 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        setError('画像を読み込めませんでした。別の画像をお試しください。')
        URL.revokeObjectURL(imageUrl)
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(pixels.data, pixels.width, pixels.height, {
        inversionAttempts: 'attemptBoth',
      })

      if (code) {
        setText(code.data)
      } else {
        setError('QRコードが見つかりませんでした。鮮明な画像でもう一度お試しください。')
      }
      URL.revokeObjectURL(imageUrl)
    }
    image.onerror = () => {
      setError('画像を開けませんでした。別の画像をお試しください。')
      URL.revokeObjectURL(imageUrl)
    }
    image.src = imageUrl
  }

  const reset = () => {
    setFileName('')
    setPreviewUrl('')
    setText('')
    setError('')
    setCopied(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('コピーできませんでした。テキストを選択してコピーしてください。')
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="PlainQR ホーム">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M4 4h10v10H4zM18 4h10v10H18zM4 18h10v10H4z" stroke="currentColor" strokeWidth="3" />
              <path d="M19 19h4v4h-4zM25 19h3v3h-3zM19 25h3v3h-3zM25 25h3v3h-3z" fill="currentColor" />
            </svg>
          </span>
          <span>plain<span className="brand-accent">qr</span></span>
        </a>
        <div className="privacy-note"><span className="privacy-dot" />画像は端末内で処理されます</div>
      </header>

      <section className="intro">
        <div className="eyebrow"><span>QR → TEXT</span><span className="eyebrow-line" /></div>
        <h1>QRコードを、<br className="mobile-break" />そのままテキストに。</h1>
        <p className="intro-copy">読み取った内容をリンクに変換せず、純粋なテキストとして表示します。</p>
      </section>

      <section className="workspace" aria-label="QRコード読み取りツール">
        <div className="section-heading">
          <div><span className="step-number">01</span><h2>QRコード画像</h2></div>
          {fileName && <button className="text-button" onClick={reset}>クリア <span aria-hidden="true">↗</span></button>}
        </div>

        <div className="work-grid">
          <div
            className={`upload-card${dragging ? ' is-dragging' : ''}${previewUrl ? ' has-image' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              readFile(event.dataTransfer.files[0])
            }}
          >
            <input
              ref={inputRef}
              className="file-input"
              type="file"
              accept="image/*"
              aria-label="QRコード画像を選択"
              onChange={(event) => readFile(event.target.files?.[0])}
            />
            {previewUrl ? (
              <div className="image-preview">
                <img src={previewUrl} alt="選択したQRコード画像" />
                <span className="file-label">{fileName}</span>
              </div>
            ) : (
              <div className="upload-empty">
                <div className="upload-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M7 17V9a2 2 0 0 1 2-2h8M31 7h8a2 2 0 0 1 2 2v8M41 31v8a2 2 0 0 1-2 2h-8M17 41H9a2 2 0 0 1-2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M24 31V17m0 0-6 6m6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="upload-title">画像をここにドロップ</p>
                <p className="upload-subtitle">または</p>
                <button className="choose-button" onClick={() => inputRef.current?.click()}>
                  ファイルを選ぶ <span aria-hidden="true">↗</span>
                </button>
                <span className="file-types">PNG · JPG · WEBP</span>
              </div>
            )}
            {previewUrl && <button className="replace-button" onClick={() => inputRef.current?.click()}>別の画像を選ぶ</button>}
          </div>

          <div className="result-card">
            <div className="result-topline">
              <div><span className="step-number">02</span><h2>読み取り結果</h2></div>
              {text && <button className={`copy-button${copied ? ' is-copied' : ''}`} onClick={copyText}>
                {copied ? <><span aria-hidden="true">✓</span> コピー済み</> : <><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" /><path d="M10.5 5.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h2.5" stroke="currentColor" /></svg>コピー</>}
              </button>}
            </div>
            <div className={`result-body${text ? ' has-result' : ''}`}>
              {text ? (
                <textarea aria-label="QRコードから読み取ったテキスト" readOnly value={text} />
              ) : error ? (
                <div className="result-message error-message"><span className="message-icon">!</span><p>{error}</p></div>
              ) : (
                <div className="result-message"><span className="result-placeholder-icon">T<span>_</span></span><p>読み取ったテキストが<br />ここに表示されます</p></div>
              )}
            </div>
            <div className="result-footer">
              <span>{text ? `${text.length.toLocaleString()} 文字` : 'テキスト形式で表示'}</span>
              <span className="text-status"><i />{text ? '読み取り完了' : '待機中'}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <span>シンプルに読み取る。余計なことはしない。</span>
        <span className="footer-mark">PLAINQR <span>© 2026</span></span>
      </footer>
    </main>
  )
}

export default App
