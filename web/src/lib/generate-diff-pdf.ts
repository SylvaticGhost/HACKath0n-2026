/* eslint-disable @typescript-eslint/no-explicit-any */
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import { format, isValid } from 'date-fns'
import type { LandDiffViewDto, RealtyDiffViewDto } from 'shared'
;(pdfMake as any).vfs = (pdfFonts as any).vfs

const STATUS_LABELS: Record<string, string> = {
  CONFLICT: 'Conflict',
  NEW_IN_REGISTRY: 'Registry only',
  MISSING_IN_REGISTRY: 'Missing in registry',
  MATCH: 'Match',
}

const STATUS_COLORS: Record<string, string> = {
  CONFLICT: '#FEE2E2',
  NEW_IN_REGISTRY: '#EFF6FF',
  MISSING_IN_REGISTRY: '#FEF3C7',
  MATCH: '#F0FDF4',
}

function fmtVal(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return String(value)
}

function fmtDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value as string)
  return isValid(d) ? format(d, 'dd.MM.yyyy') : String(value)
}

// ─── Bulk report ─────────────────────────────────────────────────────────────

function bulkHeaderSection(entityLabel: string, count: number, docNumber: string, date: string): any[] {
  return [
    { text: 'DATA UPDATE REQUEST', style: 'docTitle', alignment: 'center', margin: [0, 0, 0, 6] },
    { text: `Object: ${entityLabel}`, alignment: 'center', fontSize: 11, margin: [0, 0, 0, 3] },
    {
      columns: [
        { text: `Date: ${date}`, alignment: 'left', fontSize: 9, color: '#555' },
        { text: `Document No: ${docNumber}`, alignment: 'center', fontSize: 9, color: '#555' },
        { text: `Discrepancies: ${count}`, alignment: 'right', fontSize: 9, color: '#555' },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 1, lineColor: '#CBD5E1' }],
      margin: [0, 0, 0, 14],
    },
  ]
}

function bulkFooter(date: string): any[] {
  return [
    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 0.5, lineColor: '#CBD5E1' }],
      margin: [0, 20, 0, 8],
    },
    {
      columns: [
        {
          text: 'Generated automatically by the Registry Data Reconciliation System.',
          fontSize: 8,
          color: '#888',
          width: '*',
        },
        { text: `Date: ${date}`, fontSize: 8, color: '#888', alignment: 'right', width: 'auto' },
      ],
    },
    { text: 'Authorized signature: ____________________________', fontSize: 9, margin: [0, 12, 0, 0] },
  ]
}

export function generateLandDiffPdf(items: LandDiffViewDto[]): void {
  const date = format(new Date(), 'dd.MM.yyyy')
  const docNumber = `ЗОД-ЗД-${format(new Date(), 'yyyyMMdd')}`

  const tableBody: any[][] = [
    [
      { text: '#', style: 'th' },
      { text: 'Cadastral Number', style: 'th' },
      { text: 'Status', style: 'th' },
      { text: 'Reg. Date', style: 'th' },
      { text: 'Registry: owner', style: 'th' },
      { text: 'Registry: area (ha)', style: 'th' },
      { text: 'Registry: est. value', style: 'th' },
      { text: 'CRM: owner', style: 'th' },
      { text: 'CRM: area (ha)', style: 'th' },
      { text: 'CRM: est. value', style: 'th' },
      { text: 'Similarity', style: 'th' },
    ],
  ]

  items.forEach((row, idx) => {
    const isOnlyCrm = row.diffStatus === 'MISSING_IN_REGISTRY'
    const isOnlyRegistry = row.diffStatus === 'NEW_IN_REGISTRY'
    const fillColor = STATUS_COLORS[row.diffStatus] ?? '#FFFFFF'
    const cell = (text: string) => ({ text, fontSize: 7, fillColor })

    tableBody.push([
      cell(String(idx + 1)),
      cell(row.cadastralNumber),
      cell(STATUS_LABELS[row.diffStatus] ?? row.diffStatus),
      cell(fmtDate(row.registryStateRegistrationDate ?? row.crmStateRegistrationDate)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registryUser)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registrySquare)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registryEstimateValue)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmUser)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmSquare)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmEstimateValue)),
      cell(row.similarityScore !== null ? `${row.similarityScore}%` : '—'),
    ])
  })

  const docDef: TDocumentDefinitions = {
    info: {
      title: 'Data Update Request — Land Parcels',
      author: 'Registry Data Reconciliation System',
      subject: 'Registry vs CRM Discrepancies',
    },
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [24, 30, 24, 50],
    styles: {
      docTitle: { fontSize: 18, bold: true },
      th: { fontSize: 7, bold: true, fillColor: '#1E3A8A', color: '#FFFFFF' },
    },
    content: [
      ...bulkHeaderSection('Land Parcels', items.length, docNumber, date),
      {
        table: { headerRows: 1, widths: [16, 70, 60, 50, 55, 45, 60, 55, 45, 60, 35], body: tableBody },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#E2E8F0',
          vLineColor: () => '#E2E8F0',
        },
      },
      ...bulkFooter(date),
    ] as TDocumentDefinitions['content'],
  }

  pdfMake.createPdf(docDef).download(`land-diff-request-${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export function generateRealtyDiffPdf(items: RealtyDiffViewDto[]): void {
  const date = format(new Date(), 'dd.MM.yyyy')
  const docNumber = `ЗОД-НМ-${format(new Date(), 'yyyyMMdd')}`

  const tableBody: any[][] = [
    [
      { text: '#', style: 'th' },
      { text: 'Tax ID / Code', style: 'th' },
      { text: 'Status', style: 'th' },
      { text: 'Reg. Date', style: 'th' },
      { text: 'Registry: taxpayer', style: 'th' },
      { text: 'Registry: address', style: 'th' },
      { text: 'Registry: area (m²)', style: 'th' },
      { text: 'Registry: share', style: 'th' },
      { text: 'CRM: taxpayer', style: 'th' },
      { text: 'CRM: address', style: 'th' },
      { text: 'CRM: area (m²)', style: 'th' },
      { text: 'CRM: share', style: 'th' },
      { text: 'Similarity', style: 'th' },
    ],
  ]

  items.forEach((row, idx) => {
    const isOnlyCrm = row.diffStatus === 'MISSING_IN_REGISTRY'
    const isOnlyRegistry = row.diffStatus === 'NEW_IN_REGISTRY'
    const fillColor = STATUS_COLORS[row.diffStatus] ?? '#FFFFFF'
    const cell = (text: string) => ({ text, fontSize: 7, fillColor })

    tableBody.push([
      cell(String(idx + 1)),
      cell(row.stateTaxId),
      cell(STATUS_LABELS[row.diffStatus] ?? row.diffStatus),
      cell(fmtDate(row.ownershipRegistrationDate)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registryTaxpayerName)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registryAddress)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registryTotalArea)),
      cell(isOnlyCrm ? '—' : fmtVal(row.registryOwnershipShare)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmTaxpayerName)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmAddress)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmTotalArea)),
      cell(isOnlyRegistry ? '—' : fmtVal(row.crmOwnershipShare)),
      cell(row.similarityScore !== null ? `${row.similarityScore}%` : '—'),
    ])
  })

  const docDef: TDocumentDefinitions = {
    info: {
      title: 'Data Update Request — Realty',
      author: 'Registry Data Reconciliation System',
      subject: 'Registry vs CRM Discrepancies',
    },
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [24, 30, 24, 50],
    styles: {
      docTitle: { fontSize: 18, bold: true },
      th: { fontSize: 7, bold: true, fillColor: '#1E3A8A', color: '#FFFFFF' },
    },
    content: [
      ...bulkHeaderSection('Realty', items.length, docNumber, date),
      {
        table: { headerRows: 1, widths: [16, 55, 60, 45, 55, 65, 40, 30, 55, 65, 40, 30, 30], body: tableBody },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#E2E8F0',
          vLineColor: () => '#E2E8F0',
        },
      },
      ...bulkFooter(date),
    ] as TDocumentDefinitions['content'],
  }

  pdfMake.createPdf(docDef).download(`realty-diff-request-${format(new Date(), 'yyyyMMdd')}.pdf`)
}

// ─── Single-item letter generators ───────────────────────────────────────────

function letterHead(docNumber: string, date: string): any {
  return {
    columns: [
      {
        width: '*',
        stack: [
          { text: 'DATA MANAGEMENT DEPARTMENT', fontSize: 10, bold: true, color: '#1E3A8A' },
          { text: 'Registry Data Reconciliation System', fontSize: 8, color: '#64748B', margin: [0, 2, 0, 0] },
        ],
      },
      {
        width: 'auto',
        alignment: 'right',
        stack: [
          { text: `Ref. No: ${docNumber}`, fontSize: 9, bold: true },
          { text: `Date: ${date}`, fontSize: 9, margin: [0, 2, 0, 0] },
        ],
      },
    ],
    margin: [0, 0, 0, 6],
  }
}

function letterRecipient(): any {
  return {
    alignment: 'right',
    stack: [
      { text: 'To the Head of the Registry Division', fontSize: 9, italics: true },
      { text: '____________________________', fontSize: 9 },
      { text: '____________________________', fontSize: 9, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 18],
  }
}

function letterTitle(subject: string): any[] {
  return [
    { text: 'DATA UPDATE REQUEST', fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
    { text: subject, fontSize: 10, alignment: 'center', color: '#475569', margin: [0, 0, 0, 18] },
  ]
}

function letterBody(objectId: string, statusLabel: string, regDate: string): any {
  return {
    text: [
      'During an automated data reconciliation check between the Registry and CRM system, a discrepancy was identified for object ',
      { text: objectId, bold: true },
      ` (status: ${statusLabel}; registration date: ${regDate}). Please take the necessary steps to resolve the identified discrepancy and bring the records into alignment.`,
    ],
    fontSize: 10,
    lineHeight: 1.5,
    margin: [0, 0, 0, 16],
  }
}

function comparisonTable(rows: Array<{ label: string; registry: string; crm: string; differs: boolean }>): any {
  const header = [
    { text: 'Field', style: 'th', alignment: 'left' },
    { text: '— Registry data', style: 'th', alignment: 'left' },
    { text: '+ CRM data', style: 'th', alignment: 'left' },
  ]

  const body = rows.map((r) => [
    { text: r.label, fontSize: 9, bold: true, color: '#374151' },
    {
      text: r.registry || '—',
      fontSize: 9,
      color: r.differs && r.registry !== '—' ? '#DC2626' : '#6B7280',
      fillColor: r.differs && r.registry !== '—' ? '#FEF2F2' : undefined,
    },
    {
      text: r.crm || '—',
      fontSize: 9,
      color: r.differs && r.crm !== '—' ? '#16A34A' : '#6B7280',
      fillColor: r.differs && r.crm !== '—' ? '#F0FDF4' : undefined,
    },
  ])

  return {
    table: {
      headerRows: 1,
      widths: [130, '*', '*'],
      body: [header, ...body],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#E2E8F0',
      vLineColor: () => '#E2E8F0',
    },
    margin: [0, 0, 0, 20],
  }
}

function letterSignature(date: string): any[] {
  return [
    { text: 'Yours sincerely,', fontSize: 10, margin: [0, 0, 0, 24] },
    {
      columns: [
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5, lineColor: '#94A3B8' }] },
            { text: '(signature)', fontSize: 8, color: '#94A3B8', margin: [0, 2, 0, 0] },
          ],
          width: 200,
        },
        {
          stack: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5, lineColor: '#94A3B8' }] },
            { text: '(printed name)', fontSize: 8, color: '#94A3B8', margin: [0, 2, 0, 0] },
          ],
          width: 200,
        },
      ],
      margin: [0, 0, 0, 16],
    },
    {
      columns: [
        { text: 'Position: ________________________', fontSize: 9, width: '*' },
        { text: `Date: ${date}`, fontSize: 9, width: 'auto' },
      ],
    },
  ]
}

const LETTER_STYLES: TDocumentDefinitions['styles'] = {
  th: { fontSize: 9, bold: true, fillColor: '#1E3A8A', color: '#FFFFFF' },
}

export function generateLandDiffLetterPdf(row: LandDiffViewDto): void {
  const date = format(new Date(), 'dd.MM.yyyy')
  const docNumber = `REF-LD-${format(new Date(), 'yyyyMMdd-HHmm')}`
  const objectId = row.cadastralNumber
  const regDate = fmtDate(row.registryStateRegistrationDate ?? row.crmStateRegistrationDate)
  const statusLabel = STATUS_LABELS[row.diffStatus] ?? row.diffStatus
  const isOnlyCrm = row.diffStatus === 'MISSING_IN_REGISTRY'
  const isOnlyRegistry = row.diffStatus === 'NEW_IN_REGISTRY'

  const rows = [
    {
      label: 'Tax ID / Code',
      registry: isOnlyCrm ? '' : fmtVal(row.registryTaxId),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmTaxId),
      differs: row.registryTaxId !== row.crmTaxId,
    },
    {
      label: 'Owner',
      registry: isOnlyCrm ? '' : fmtVal(row.registryUser),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmUser),
      differs: row.registryUser !== row.crmUser,
    },
    {
      label: 'Area (ha)',
      registry: isOnlyCrm ? '' : fmtVal(row.registrySquare),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmSquare),
      differs: row.registrySquare !== row.crmSquare,
    },
    {
      label: 'Estimated value',
      registry: isOnlyCrm ? '' : fmtVal(row.registryEstimateValue),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmEstimateValue),
      differs: row.registryEstimateValue !== row.crmEstimateValue,
    },
    {
      label: 'Location',
      registry: isOnlyCrm ? '' : fmtVal(row.registryLocation),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmLocation),
      differs: row.registryLocation !== row.crmLocation,
    },
    {
      label: 'Registration date',
      registry: isOnlyCrm ? '' : fmtDate(row.registryStateRegistrationDate),
      crm: isOnlyRegistry ? '' : fmtDate(row.crmStateRegistrationDate),
      differs: String(row.registryStateRegistrationDate) !== String(row.crmStateRegistrationDate),
    },
  ]

  const content: any[] = [
    letterHead(docNumber, date),
    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 483, y2: 0, lineWidth: 1.5, lineColor: '#1E3A8A' }],
      margin: [0, 0, 0, 16],
    },
    letterRecipient(),
    ...letterTitle(`Regarding land parcel: ${objectId}`),
    letterBody(objectId, statusLabel, regDate),
    comparisonTable(rows),
    ...(row.similarityScore !== null
      ? [
          {
            text: `Data similarity index: ${row.similarityScore}%`,
            fontSize: 9,
            color: '#64748B',
            margin: [0, -12, 0, 20],
          },
        ]
      : []),
    ...letterSignature(date),
  ]

  const docDef: TDocumentDefinitions = {
    info: { title: `Data Update Request — ${objectId}`, author: 'Registry Data Reconciliation System' },
    pageSize: 'A4',
    pageMargins: [56, 48, 56, 56],
    styles: LETTER_STYLES,
    content: content as TDocumentDefinitions['content'],
  }

  pdfMake.createPdf(docDef).download(`letter-land-${row.cadastralNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`)
}

export function generateRealtyDiffLetterPdf(row: RealtyDiffViewDto): void {
  const date = format(new Date(), 'dd.MM.yyyy')
  const docNumber = `REF-RE-${format(new Date(), 'yyyyMMdd-HHmm')}`
  const objectId = row.stateTaxId
  const regDate = fmtDate(row.ownershipRegistrationDate)
  const statusLabel = STATUS_LABELS[row.diffStatus] ?? row.diffStatus
  const isOnlyCrm = row.diffStatus === 'MISSING_IN_REGISTRY'
  const isOnlyRegistry = row.diffStatus === 'NEW_IN_REGISTRY'

  const rows = [
    {
      label: 'Taxpayer / Owner',
      registry: isOnlyCrm ? '' : fmtVal(row.registryTaxpayerName),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmTaxpayerName),
      differs: row.registryTaxpayerName !== row.crmTaxpayerName,
    },
    {
      label: 'Property address',
      registry: isOnlyCrm ? '' : fmtVal(row.registryAddress),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmAddress),
      differs: row.registryAddress !== row.crmAddress,
    },
    {
      label: 'Total area (m²)',
      registry: isOnlyCrm ? '' : fmtVal(row.registryTotalArea),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmTotalArea),
      differs: row.registryTotalArea !== row.crmTotalArea,
    },
    {
      label: 'Ownership share',
      registry: isOnlyCrm ? '' : fmtVal(row.registryOwnershipShare),
      crm: isOnlyRegistry ? '' : fmtVal(row.crmOwnershipShare),
      differs: row.registryOwnershipShare !== row.crmOwnershipShare,
    },
  ]

  const content: any[] = [
    letterHead(docNumber, date),
    {
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 483, y2: 0, lineWidth: 1.5, lineColor: '#1E3A8A' }],
      margin: [0, 0, 0, 16],
    },
    letterRecipient(),
    ...letterTitle(`Regarding realty object: ${objectId}`),
    letterBody(objectId, statusLabel, regDate),
    comparisonTable(rows),
    ...(row.similarityScore !== null
      ? [
          {
            text: `Data similarity index: ${row.similarityScore}%`,
            fontSize: 9,
            color: '#64748B',
            margin: [0, -12, 0, 20],
          },
        ]
      : []),
    ...letterSignature(date),
  ]

  const docDef: TDocumentDefinitions = {
    info: { title: `Data Update Request — ${objectId}`, author: 'Registry Data Reconciliation System' },
    pageSize: 'A4',
    pageMargins: [56, 48, 56, 56],
    styles: LETTER_STYLES,
    content: content as TDocumentDefinitions['content'],
  }

  pdfMake.createPdf(docDef).download(`letter-realty-${row.stateTaxId}-${format(new Date(), 'yyyyMMdd')}.pdf`)
}
