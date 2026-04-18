import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  RefreshCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import { read, utils } from 'xlsx'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/upload_file')({
  component: UploadFilePage,
})

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024
const PREVIEW_ROW_LIMIT = 50

type UploadStage = 'idle' | 'uploading' | 'complete'

type WorkbookPreview = {
  previewRows: string[][]
  totalRows: number
  totalColumns: number
  sheetCount: number
  sheetName: string
}

function UploadFilePage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const uploadTimerRef = useRef<number | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<WorkbookPreview | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dataType, setDataType] = useState<string>('drrp_land')

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        window.clearInterval(uploadTimerRef.current)
      }
    }
  }, [])

  const fileMeta = useMemo(() => {
    if (!selectedFile || !preview) {
      return null
    }

    return {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      modified: formatDate(selectedFile.lastModified),
      totalRows: preview.totalRows,
      totalColumns: preview.totalColumns,
      sheetCount: preview.sheetCount,
      sheetName: preview.sheetName,
    }
  }, [preview, selectedFile])

  const previewColumnCount = useMemo(() => {
    if (!preview) {
      return 0
    }

    return preview.previewRows.reduce((max, row) => Math.max(max, row.length), preview.totalColumns)
  }, [preview])

  const isReady = !!selectedFile && !!preview
  const canUpload = isReady && !isParsing && uploadStage !== 'uploading'

  async function handleFile(file: File | null | undefined) {
    if (!file) {
      return
    }

    resetUploadSimulation()
    setErrorMessage(null)
    setIsDragging(false)

    const validationError = validateFile(file)
    if (validationError) {
      clearSelection()
      setErrorMessage(validationError)
      return
    }

    setIsParsing(true)

    try {
      const parsedWorkbook = await parseWorkbook(file)
      setSelectedFile(file)
      setPreview(parsedWorkbook)
    } catch {
      clearSelection()
      setErrorMessage('Failed to read XLSX. Check the file and try again.')
    } finally {
      setIsParsing(false)
    }
  }

  function resetUploadSimulation() {
    if (uploadTimerRef.current) {
      window.clearInterval(uploadTimerRef.current)
      uploadTimerRef.current = null
    }

    setUploadStage('idle')
    setUploadProgress(0)
  }

  function clearSelection() {
    setSelectedFile(null)
    setPreview(null)
    resetUploadSimulation()

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  function startUploadStub() {
    if (!canUpload) {
      return
    }

    resetUploadSimulation()
    setUploadStage('uploading')

    uploadTimerRef.current = window.setInterval(() => {
      setUploadProgress((currentProgress) => {
        const increment = currentProgress < 72 ? 8 : currentProgress < 92 ? 4 : 2
        const nextProgress = Math.min(currentProgress + increment, 100)

        if (nextProgress >= 100) {
          if (uploadTimerRef.current) {
            window.clearInterval(uploadTimerRef.current)
            uploadTimerRef.current = null
          }

          setUploadStage('complete')
        }

        return nextProgress
      })
    }, 220)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />

      {!isReady && (
        <DropzoneCard
          isDragging={isDragging}
          isParsing={isParsing}
          progress={isParsing ? 35 : 0}
          onPickFileClick={() => inputRef.current?.click()}
          onDrop={(event) => {
            event.preventDefault()
            setIsDragging(false)
            void handleFile(event.dataTransfer.files?.[0])
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
        />
      )}

      {errorMessage && <ErrorAlert title="Failed to upload file" message={errorMessage} />}

      {isReady && fileMeta && (
        <div className="space-y-4">
          <FileMetaCard
            fileMeta={fileMeta}
            canUpload={canUpload}
            isUploading={uploadStage === 'uploading'}
            isComplete={uploadStage === 'complete'}
            dataType={dataType}
            onDataTypeChange={setDataType}
            onUpload={startUploadStub}
            onReplace={() => inputRef.current?.click()}
            onRemove={clearSelection}
          />

          {(uploadStage === 'uploading' || uploadStage === 'complete') && (
            <ImportProgressCard
              progress={uploadProgress}
              isComplete={uploadStage === 'complete'}
              message={
                uploadStage === 'complete' ? 'Upload simulation complete.' : 'Simulating file upload to the server.'
              }
            />
          )}

          <PreviewCard
            preview={preview}
            previewColumnCount={previewColumnCount}
            isUploading={uploadStage === 'uploading'}
          />
        </div>
      )}

      {!isReady && !errorMessage && <EmptyPreviewState />}
    </div>
  )
}

function DropzoneCard({
  isDragging,
  isParsing,
  progress,
  onDrop,
  onDragOver,
  onDragLeave,
  onPickFileClick,
}: {
  isDragging: boolean
  isParsing: boolean
  progress: number
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onPickFileClick: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            'relative rounded-2xl border-2 border-dashed bg-background p-8 transition-colors md:p-10',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/20 hover:border-muted-foreground/35 hover:bg-muted/20',
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted/40">
              {isParsing ? (
                <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-base font-medium text-foreground">
                {isParsing
                  ? 'Reading file and preparing preview...'
                  : 'Drag and drop an XLSX file here or select one manually'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">Format: .xlsx</Badge>
              <Badge variant="secondary">Limit: 100 MB</Badge>
            </div>

            <Button type="button" variant="outline" onClick={onPickFileClick} disabled={isParsing}>
              Select File
            </Button>
          </div>

          {isParsing && (
            <div className="mt-6 animate-in fade-in">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Analyzing Excel structure</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorAlert({ title, message }: { title: string; message: string }) {
  return (
    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 border-destructive/30">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

function FileMetaCard({
  fileMeta,
  canUpload,
  isUploading,
  isComplete,
  dataType,
  onDataTypeChange,
  onUpload,
  onReplace,
  onRemove,
}: {
  fileMeta: {
    name: string
    size: string
    modified: string
    totalRows: number
    totalColumns: number
    sheetCount: number
    sheetName: string
  }
  canUpload: boolean
  isUploading: boolean
  isComplete: boolean
  dataType: string
  onDataTypeChange: (value: string) => void
  onUpload: () => void
  onReplace: () => void
  onRemove: () => void
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <p className="truncate text-base font-medium text-foreground">{fileMeta.name}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Size: {fileMeta.size}</Badge>
                <Badge variant="secondary">Updated: {fileMeta.modified}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Rows: {fileMeta.totalRows.toLocaleString('en-US')}</Badge>
                <Badge variant="outline">Columns: {fileMeta.totalColumns.toLocaleString('en-US')}</Badge>
                <Badge variant="secondary">Sheets: {fileMeta.sheetCount}</Badge>
                <Badge variant="secondary">Active: {fileMeta.sheetName}</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Select disabled={!canUpload || isUploading} value={dataType} onValueChange={onDataTypeChange}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drrp_land">DRRP Land</SelectItem>
                  <SelectItem value="drrp_real_estate">DRRP Real Estate</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" onClick={onUpload} disabled={!canUpload} className="min-w-36 gap-2">
                {isUploading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : isComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Uploaded
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>

            <ButtonGroup>
              <Button type="button" variant="outline" onClick={onReplace} disabled={isUploading} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Replace
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onRemove}
                disabled={isUploading}
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ImportProgressCard({
  progress,
  message,
  isComplete,
}: {
  progress: number
  message: string
  isComplete: boolean
}) {
  return (
    <Card
      className={cn('animate-in fade-in slide-in-from-bottom-2', isComplete ? 'border-primary/20 bg-primary/5' : '')}
    >
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-sm font-medium leading-none">
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
              )}
              {isComplete ? 'Upload complete' : 'Sending file to server'}
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <span className="text-2xl font-semibold tracking-tight text-foreground">{progress}%</span>
        </div>

        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  )
}

function PreviewCard({
  preview,
  previewColumnCount,
  isUploading,
}: {
  preview: WorkbookPreview
  previewColumnCount: number
  isUploading: boolean
}) {
  const headerRow = preview.previewRows[0] ?? []
  const bodyRows = preview.previewRows.slice(1)

  return (
    <Card className={cn('overflow-hidden transition-opacity', isUploading && 'pointer-events-none opacity-60')}>
      <CardHeader className="border-b px-6 pb-3 pt-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              File Preview
            </CardTitle>
            <CardDescription className="mt-1">
              Showing {Math.min(PREVIEW_ROW_LIMIT, preview.previewRows.length)} of{' '}
              {preview.totalRows.toLocaleString('en-US')} rows from the first sheet.
            </CardDescription>
          </div>

          <Badge variant="outline" className="shrink-0">
            {preview.sheetName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="[&>div]:max-h-[460px] [&>div]:overflow-auto">
          <Table className="min-w-[960px] text-sm">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="sticky left-0 z-20 h-8 w-14 bg-muted text-center text-xs font-medium text-muted-foreground shadow-[inset_-1px_-1px_0_var(--color-border)]">
                  #
                </TableHead>
                {Array.from({ length: previewColumnCount }, (_, index) => (
                  <TableHead
                    key={index}
                    className="h-8 min-w-44 bg-muted text-center text-xs font-medium text-muted-foreground shadow-[inset_0_-1px_0_var(--color-border)]"
                  >
                    {toSpreadsheetColumn(index)}
                  </TableHead>
                ))}
              </TableRow>

              {preview.previewRows.length > 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableHead className="sticky left-0 top-0 z-50 h-10 w-14 bg-muted text-center font-semibold text-primary shadow-[inset_-1px_-1px_0_var(--color-border)]">
                    1
                  </TableHead>

                  {Array.from({ length: previewColumnCount }, (_, columnIndex) => {
                    const value = headerRow[columnIndex]?.trim() || `Column ${columnIndex + 1}`

                    return (
                      <TableHead
                        key={columnIndex}
                        className="sticky top-0 z-40 h-10 min-w-44 bg-muted font-semibold text-foreground shadow-[inset_0_-1px_0_var(--color-border)]"
                      >
                        <span className="block truncate" title={value}>
                          {value}
                        </span>
                      </TableHead>
                    )
                  })}
                </TableRow>
              )}
            </TableHeader>

            <TableBody>
              {preview.previewRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(previewColumnCount + 1, 2)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No rows found in the file for preview.
                  </TableCell>
                </TableRow>
              ) : bodyRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(previewColumnCount + 1, 2)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    The preview contains only the first row, which is currently displayed as column headers.
                  </TableCell>
                </TableRow>
              ) : (
                bodyRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="sticky left-0 z-20 w-14 bg-background text-center font-medium text-muted-foreground shadow-[inset_-1px_0_0_var(--color-border)]">
                      {rowIndex + 2}
                    </TableCell>

                    {Array.from({ length: previewColumnCount }, (_, columnIndex) => {
                      const value = row[columnIndex] || ''
                      const isEmpty = value.trim().length === 0

                      return (
                        <TableCell
                          key={columnIndex}
                          className={cn('max-w-72 align-top', isEmpty && 'text-muted-foreground/50')}
                        >
                          <span className="block truncate" title={value}>
                            {isEmpty ? '—' : value}
                          </span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyPreviewState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted/30">
          <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground">Table preview will appear here</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            After selecting a valid XLSX file, we will show the first 50 rows, the number of columns, and basic file
            information.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

async function parseWorkbook(file: File): Promise<WorkbookPreview> {
  const fileBuffer = await file.arrayBuffer()
  const workbook = read(fileBuffer, { type: 'array', cellDates: true })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    throw new Error('Missing worksheet')
  }

  const worksheet = workbook.Sheets[firstSheetName]
  const rows = utils.sheet_to_json<(string | number | boolean | Date | null)[]>(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  })

  const range = worksheet['!ref'] ? utils.decode_range(worksheet['!ref']) : null
  const totalRows = range ? range.e.r + 1 : rows.length
  const totalColumns = range ? range.e.c + 1 : rows.reduce((max, row) => Math.max(max, row.length), 0)

  return {
    previewRows: rows.slice(0, PREVIEW_ROW_LIMIT).map((row) => row.map((cell) => formatCellValue(cell))),
    totalRows,
    totalColumns,
    sheetCount: workbook.SheetNames.length,
    sheetName: firstSheetName,
  }
}

function formatCellValue(value: string | number | boolean | Date | null) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(value)
  }

  if (value === null || value === undefined || value === '') {
    return ''
  }

  return String(value)
}

function validateFile(file: File) {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    return 'An .xlsx file is required.'
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Maximum file size for upload is 100 MB.'
  }

  return null
}

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

function toSpreadsheetColumn(index: number) {
  let current = index
  let column = ''

  while (current >= 0) {
    column = String.fromCharCode((current % 26) + 65) + column
    current = Math.floor(current / 26) - 1
  }

  return column
}
