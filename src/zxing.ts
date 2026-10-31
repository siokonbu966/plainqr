import {
  readBarcodesFromImageFile,
  setZXingModuleOverrides,
} from '@sec-ant/zxing-wasm/reader'
import wasmUrl from '../node_modules/@sec-ant/zxing-wasm/dist/reader/zxing_reader.wasm?url'

setZXingModuleOverrides({
  locateFile: (path, prefix) => path.endsWith('.wasm') ? wasmUrl : `${prefix}${path}`,
})

export async function decodeWithZXing(file: File) {
  const [result] = await readBarcodesFromImageFile(file, {
    formats: ['QRCode'],
    tryHarder: true,
    maxSymbols: 1,
  })

  return result?.text ?? null
}
