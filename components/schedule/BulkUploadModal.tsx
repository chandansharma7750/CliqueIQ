"use client"

import { useState, useRef } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Upload, X, FileText, CheckCircle, AlertCircle, Download, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CSVRow {
  platform: string
  caption: string
  scheduled_at: string
  image_url?: string
  _valid: boolean
  _error?: string
}

const PLATFORMS = ["instagram", "facebook", "linkedin", "youtube"]

function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["']/g, ""))
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields
    const cols = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((c) => c.trim().replace(/^"|"$/g, "")) ?? []

    const row: Record<string, string> = {}
    header.forEach((h, idx) => { row[h] = cols[idx] ?? "" })

    const platform = row["platform"]?.toLowerCase()
    const caption = row["caption"] ?? ""
    const scheduled_at = row["scheduled_at"] ?? row["date"] ?? ""
    const image_url = row["image_url"] ?? row["image"] ?? ""

    let valid = true
    let error = ""

    if (!platform || !PLATFORMS.includes(platform)) {
      valid = false; error = `Invalid platform "${platform}"`
    } else if (!scheduled_at) {
      valid = false; error = "Missing scheduled_at"
    } else {
      const d = new Date(scheduled_at)
      if (isNaN(d.getTime())) {
        valid = false; error = `Invalid date "${scheduled_at}"`
      } else if (d < new Date()) {
        valid = false; error = "Date is in the past"
      }
    }

    rows.push({ platform, caption, scheduled_at, image_url: image_url || undefined, _valid: valid, _error: error })
  }

  return rows
}

interface Props {
  onUploaded: () => void
}

export function BulkUploadModal({ onUploaded }: Props) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<CSVRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRows(parseCSV(text))
      setDone(false)
    }
    reader.readAsText(file)
  }

  const validRows = rows.filter((r) => r._valid)
  const invalidRows = rows.filter((r) => !r._valid)

  const handleUpload = async () => {
    if (validRows.length === 0) return
    setUploading(true)
    try {
      await Promise.all(
        validRows.map((row) =>
          fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: row.platform,
              caption: row.caption,
              scheduled_at: new Date(row.scheduled_at).toISOString(),
              image_url: row.image_url || null,
              status: "scheduled",
            }),
          })
        )
      )
      setDone(true)
      onUploaded()
    } catch {
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = `platform,caption,scheduled_at,image_url
instagram,"Check out our new collection! 🔥 #fashion #india","${new Date(Date.now() + 86400000).toISOString().slice(0, 16)}",
facebook,"Exciting news from our team! Stay tuned for more updates.","${new Date(Date.now() + 172800000).toISOString().slice(0, 16)}",
youtube,"New video dropping soon! Subscribe to get notified.","${new Date(Date.now() + 259200000).toISOString().slice(0, 16)}",`

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk-schedule-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setRows([])
    setDone(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Upload CSV
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-slate-900">Bulk Schedule from CSV</Dialog.Title>
              <p className="text-sm text-slate-500 mt-0.5">Upload a CSV to schedule multiple posts at once</p>
            </div>
            <Dialog.Close className="rounded-full p-1 hover:bg-slate-100">
              <X className="h-4 w-4 text-slate-500" />
            </Dialog.Close>
          </div>

          {done ? (
            <div className="text-center py-10">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-900">{validRows.length} posts scheduled!</p>
              <p className="text-sm text-slate-500 mt-1">They&apos;re now visible on your calendar.</p>
              <Button className="mt-4" onClick={() => { setOpen(false); reset() }}>Close</Button>
            </div>
          ) : rows.length === 0 ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors",
                  dragOver ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                )}
              >
                <Upload className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-slate-700">Drop your CSV file here</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>

              {/* Template download */}
              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Need the CSV format?</p>
                  <p className="text-xs text-slate-500">Columns: platform, caption, scheduled_at, image_url</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                  <Download className="h-3.5 w-3.5" />
                  Template
                </Button>
              </div>

              {/* Format guide */}
              <div className="mt-3 rounded-lg bg-violet-50 border border-violet-100 p-3 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-violet-700">Format guide:</p>
                <p><span className="font-medium">platform</span> — instagram | facebook | linkedin | youtube</p>
                <p><span className="font-medium">scheduled_at</span> — ISO format e.g. 2026-06-15T10:00</p>
                <p><span className="font-medium">image_url</span> — optional, public URL to image</p>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{rows.length} rows parsed</span>
                  {validRows.length > 0 && <Badge className="bg-green-100 text-green-700 text-xs">{validRows.length} valid</Badge>}
                  {invalidRows.length > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{invalidRows.length} errors</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500">
                  <X className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <div key={i} className={cn("flex items-start gap-3 p-3", !row._valid && "bg-red-50/50")}>
                    <div className="flex-shrink-0 mt-0.5">
                      {row._valid
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-700 capitalize">{row.platform || "—"}</span>
                        <span className="text-xs text-slate-400">{row.scheduled_at}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{row.caption || "(no caption)"}</p>
                      {!row._valid && <p className="text-xs text-red-600 mt-0.5">{row._error}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  {validRows.length} post{validRows.length !== 1 ? "s" : ""} will be scheduled
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={reset}>Re-upload</Button>
                  <Button
                    size="sm"
                    disabled={validRows.length === 0 || uploading}
                    onClick={handleUpload}
                    className="gap-2"
                  >
                    {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Scheduling…</> : `Schedule ${validRows.length} Posts`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
