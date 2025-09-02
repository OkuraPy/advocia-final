'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configurar worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export default function TestPDFPage() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [error, setError] = useState<string | null>(null)
  
  const testUrl = 'https://gczqdsfsjglotowcxobe.supabase.co/storage/v1/object/public/documents/b828a753-5b50-49e1-bc8f-07c72efcb37b/1754539835388-5ata409.pdf'

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('✅ PDF loaded! Pages:', numPages)
    setNumPages(numPages)
  }

  function onDocumentLoadError(error: Error) {
    console.error('❌ PDF load error:', error)
    setError(error.message)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test PDF Viewer</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">URL: {testUrl}</p>
        <p className="text-sm text-gray-600">Status: {error ? `Error: ${error}` : numPages ? `Loaded (${numPages} pages)` : 'Loading...'}</p>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <Document
          file={testUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Loading PDF...</div>}
          error={<div>Error loading PDF!</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            onLoadSuccess={() => console.log('Page loaded')}
            onLoadError={(e) => console.error('Page error:', e)}
          />
        </Document>
      </div>

      {numPages && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}