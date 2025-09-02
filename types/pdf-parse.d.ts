declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion: string
    IsAcroFormPresent: boolean
    IsXFAPresent: boolean
    [key: string]: any
  }

  interface PDFMetadata {
    _metadata?: {
      [key: string]: any
    }
    [key: string]: any
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata
    text: string
    version: string
  }

  function pdf(dataBuffer: Buffer | ArrayBuffer | Uint8Array): Promise<PDFData>
  export = pdf
}