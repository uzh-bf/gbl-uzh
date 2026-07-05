import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { cn, formatCurrency } from '~/lib/utils'
import { HelpCircle, Info, Activity, DollarSign, Building2, Zap } from 'lucide-react'

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface BalanceSheet {
  assets: {
    currentAssets?: Record<string, number>
    nonCurrentAssets?: Record<string, number>
  }
  liabilitiesAndEquity: {
    shortTermLiabilities?: Record<string, number>
    longTermLiabilities?: Record<string, number>
    equity?: Record<string, number>
  }
}

export interface IncomeStatement {
  revenue: number
  costsOP: number
  otherOPExpenses: number
  grossProfit: number
  overheadCosts: number
  licensingCosts: number
  ebitda: number
  depreciation: number
  ebit: number
  interest: number
  ebt: number
  taxEbt: number
  netIncome: number
}

export interface CashFlowStatement {
  nopat: number
  investmentsAV: number
  investmentsNUV: {
    deltaDebit: number
    deltaInventories: number
    deltaCredit: number
  }
  freeCashFlow: number
}

// ==========================================
// BALANCE SHEET DISPLAY
// ==========================================

const renameSectionTitle = (title: string): string => {
  switch (title) {
    case 'machines':
      return 'Plant and Equipment'
    case 'realEstate':
      return 'Property'
    default:
      return title
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
  }
}

interface SectionTableProps {
  title: string
  data?: Record<string, number>
}

const SectionTable: React.FC<SectionTableProps> = ({ title, data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null
  }

  const total = Object.values(data).reduce((sum, value) => sum + value, 0)

  return (
    <div className="mb-4">
      <div className="text-muted-foreground flex justify-between font-semibold border-b pb-1 mb-2 text-sm">
        <h4>{title}</h4>
        <div>{formatCurrency(total, 0)}</div>
      </div>
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between pl-4 text-sm">
            <span className="capitalize text-slate-600">
              {renameSectionTitle(key)}
            </span>
            <span className="font-mono text-right">{formatCurrency(value, 0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export interface BalanceSheetDisplayProps {
  balanceSheetData?: BalanceSheet
  className?: string
}

export const BalanceSheetDisplay: React.FC<BalanceSheetDisplayProps> = ({
  balanceSheetData,
  className = '',
}) => {
  if (!balanceSheetData) {
    return (
      <div className={cn('text-center py-8 text-slate-500', className)}>
        No balance sheet data available.
      </div>
    )
  }

  const { assets, liabilitiesAndEquity } = balanceSheetData

  const totalAssets =
    Object.values(assets?.currentAssets ?? {}).reduce((s, v) => s + v, 0) +
    Object.values(assets?.nonCurrentAssets ?? {}).reduce((s, v) => s + v, 0)

  const totalLiabilities =
    Object.values(liabilitiesAndEquity?.shortTermLiabilities ?? {}).reduce(
      (s, v) => s + v,
      0
    ) +
    Object.values(liabilitiesAndEquity?.longTermLiabilities ?? {}).reduce(
      (s, v) => s + v,
      0
    )

  const totalEquity = Object.values(liabilitiesAndEquity?.equity ?? {}).reduce(
    (s, v) => s + v,
    0
  )

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

  return (
    <Card className={cn('mx-auto w-full max-w-4xl', className)}>
      <CardHeader>
        <CardTitle className="text-xl">Balance Sheet</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between font-bold border-b pb-2 mb-4">
            <h3 className="text-lg">Assets</h3>
            <span className="font-mono">{formatCurrency(totalAssets, 0)}</span>
          </div>
          <SectionTable title="Current Assets" data={assets?.currentAssets} />
          <SectionTable
            title="Non-Current Assets"
            data={assets?.nonCurrentAssets}
          />
        </div>

        <div>
          <div className="flex items-center justify-between font-bold border-b pb-2 mb-4">
            <h3 className="text-lg">Liabilities & Equity</h3>
            <span className="font-mono">{formatCurrency(totalLiabilitiesAndEquity, 0)}</span>
          </div>
          <SectionTable
            title="Short-Term Liabilities"
            data={liabilitiesAndEquity?.shortTermLiabilities}
          />
          <SectionTable
            title="Long-Term Liabilities"
            data={liabilitiesAndEquity?.longTermLiabilities}
          />
          <SectionTable title="Equity" data={liabilitiesAndEquity?.equity} />
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// INCOME STATEMENT CARD
// ==========================================

interface StatementRowProps {
  label: string
  tooltipText?: string
  value: string
  isSubtotal?: boolean
  isTotal?: boolean
  isLess?: boolean
  indent?: boolean
  icon?: React.ElementType
}

const StatementRow = ({
  label,
  tooltipText,
  value,
  isSubtotal = false,
  isTotal = false,
  isLess = false,
  indent = false,
  icon: Icon,
}: StatementRowProps) => {
  const LabelComponent = (
    <span className="text-foreground flex items-center">
      {Icon && (
        <Icon
          className={cn(
            'mr-2 h-3.5 w-3.5',
            isLess ? 'text-muted-foreground' : 'text-primary/80'
          )}
        />
      )}
      {isLess && <span className="mr-1">-</span>}
      {label}
      {tooltipText && (
        <TooltipTrigger asChild>
          <HelpCircle className="text-muted-foreground hover:text-foreground ml-1.5 h-3.5 w-3.5 cursor-help" />
        </TooltipTrigger>
      )}
    </span>
  )

  return (
    <div
      className={cn(
        'flex items-center justify-between text-sm py-1',
        isSubtotal && 'border-border mt-1 border-t border-dashed pt-2',
        isTotal && 'border-primary/50 mt-2 border-t-2 pt-2 font-bold text-base',
        indent && 'pl-4'
      )}
    >
      <span className={cn('flex items-center', isLess ? 'text-muted-foreground' : 'text-foreground')}>
        {tooltipText ? (
          <Tooltip>
            {LabelComponent}
            <TooltipContent side="top" align="start" className="max-w-xs">
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          LabelComponent
        )}
      </span>
      <span
        className={cn(
          isTotal ? 'text-primary font-mono' : 'text-foreground font-mono',
          isLess && value !== 'N/A' && !value.startsWith('-')
            ? 'text-red-600 dark:text-red-500'
            : ''
        )}
      >
        {value}
      </span>
    </div>
  )
}

export interface IncomeStatementCardProps {
  statement?: IncomeStatement
  prospectiveLicensingCosts?: number
  title?: string
}

export const IncomeStatementCard = ({
  statement,
  prospectiveLicensingCosts,
  title = 'Income Statement',
}: IncomeStatementCardProps) => {
  if (!statement) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            No income statement data available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg md:text-xl">
            {title}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground ml-2 h-4 w-4 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Comparison of all revenues and expenses for a period, allowing the profit or
                  loss for that period to be determined.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <StatementRow
            label="Revenue"
            value={formatCurrency(statement.revenue, 0)}
            tooltipText="Total income generated within a period."
          />
          <StatementRow
            label="Cost of Operations"
            value={formatCurrency(statement.costsOP, 0)}
            tooltipText="Total direct expenses for producing goods during the period."
            isLess
          />
          <StatementRow
            label="Other Operation Expenses"
            value={formatCurrency(statement.otherOPExpenses, 0)}
            tooltipText="Additional operational costs not directly tied to production, such as fines."
            isLess
          />
          <StatementRow
            label="= Gross Profit"
            value={formatCurrency(statement.grossProfit, 0)}
            isSubtotal
            tooltipText="Difference between revenue and direct production costs."
          />
          <StatementRow
            label="Overhead Costs"
            value={formatCurrency(statement.overheadCosts, 0)}
            tooltipText="All indirect expenses, such as rent and office staff salaries."
            isLess
          />
          {prospectiveLicensingCosts !== undefined ? (
            <StatementRow
              label="Prospective Licensing Costs"
              value={formatCurrency(prospectiveLicensingCosts, 0)}
              isLess
              tooltipText="Fees paid for licensing."
            />
          ) : (
            <StatementRow
              label="Licensing Costs"
              value={formatCurrency(statement.licensingCosts, 0)}
              isLess
              tooltipText="Fees paid for licensing."
            />
          )}
          <StatementRow
            label="= EBITDA"
            value={formatCurrency(statement.ebitda, 0)}
            isSubtotal
            tooltipText="Operating profit before deducting interest, taxes, and depreciation."
          />
          <StatementRow
            label="Depreciation"
            value={formatCurrency(statement.depreciation, 0)}
            tooltipText="Non-cash expense reflecting the reduction in value of fixed assets."
            isLess
          />
          <StatementRow
            label="= EBIT"
            value={formatCurrency(statement.ebit, 0)}
            isSubtotal
            tooltipText="Operating income before interest and tax expenses."
          />
          <StatementRow
            label="Interest Expense"
            value={formatCurrency(statement.interest, 0)}
            isLess
            tooltipText="Total interest payments due on borrowed capital."
          />
          <StatementRow
            label="= EBT"
            value={formatCurrency(statement.ebt, 0)}
            isSubtotal
            tooltipText="Profit for the period before income taxes are deducted."
          />
          <StatementRow
            label="Income Tax Expense"
            value={formatCurrency(statement.taxEbt, 0)}
            tooltipText="Total taxes owed on earnings for a period."
            isLess
          />
          <StatementRow
            label="= Net Income"
            value={formatCurrency(statement.netIncome, 0)}
            isTotal
            tooltipText="Resulting profit or loss after all expenses have been deducted."
          />
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// ==========================================
// CASH FLOW STATEMENT CARD
// ==========================================

interface CashFlowRowProps {
  label: string
  tooltipText?: string
  value: string
  isSubtotal?: boolean
  isTotal?: boolean
  indent?: number
  icon?: React.ElementType
  valueIsPositiveGood?: boolean
  valueIsNeutral?: boolean
}

const CashFlowRow = ({
  label,
  tooltipText,
  value,
  isSubtotal = false,
  isTotal = false,
  indent = 0,
  icon: Icon,
  valueIsPositiveGood = true,
  valueIsNeutral = false,
}: CashFlowRowProps) => {
  const isNegativeValue = value.startsWith('(') || value.startsWith('-')

  const valueColorClass = () => {
    if (isTotal || isSubtotal || valueIsNeutral || value === 'N/A') return 'text-foreground'
    if (isNegativeValue) {
      return valueIsPositiveGood ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'
    }
    return valueIsPositiveGood ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
  }

  const LabelComponent = (
    <span className="text-foreground flex items-center">
      {Icon && <Icon className="text-muted-foreground mr-2 h-4 w-4" />}
      {label}
      {tooltipText && (
        <TooltipTrigger asChild>
          <HelpCircle className="text-muted-foreground hover:text-foreground ml-1.5 h-3.5 w-3.5 cursor-help" />
        </TooltipTrigger>
      )}
    </span>
  )

  return (
    <div
      className={cn(
        'flex items-center justify-between py-1 text-sm',
        isSubtotal && 'border-border mt-1 border-t border-dashed pt-2',
        isTotal && 'mt-3 border-t border-solid pt-3 text-base font-bold',
        indent === 1 && 'pl-5',
        indent === 2 && 'pl-10'
      )}
    >
      {tooltipText ? (
        <Tooltip>
          {LabelComponent}
          <TooltipContent side="top" align="start" className="max-w-xs">
            <p className="text-xs">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        LabelComponent
      )}
      <span className={cn('tabular-nums font-mono', valueColorClass(), isTotal && 'text-primary')}>
        {value}
      </span>
    </div>
  )
}

export interface CashFlowStatementCardProps {
  statement?: CashFlowStatement
  ebit?: number
  taxEbit?: number
  depreciation?: number
  title?: string
  description?: string
}

export const CashFlowStatementCard = ({
  statement,
  ebit = 0,
  taxEbit = 0,
  depreciation = 0,
  title = 'Cash Flow Statement',
  description = 'Summary of cash inflows and outflows.',
}: CashFlowStatementCardProps) => {
  if (!statement) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="text-primary mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            No cash flow data available.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalChangeInNWC =
    -statement.investmentsNUV.deltaDebit -
    statement.investmentsNUV.deltaInventories +
    statement.investmentsNUV.deltaCredit

  const cashFlowFromInvesting = -statement.investmentsAV

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Activity className="text-primary mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0.5 px-5 pb-5">
          <div className="text-muted-foreground pt-2 pb-1 text-xs font-semibold tracking-wider uppercase">
            Operating Activities
          </div>
          <CashFlowRow
            label="EBIT"
            tooltipText="Operating income before interest and tax expenses."
            value={formatCurrency(ebit, 0)}
            icon={DollarSign}
            valueIsNeutral
          />
          <CashFlowRow
            label="Tax on EBIT"
            tooltipText="Tax liability based on operating income."
            value={formatCurrency(taxEbit, 0)}
            icon={DollarSign}
            valueIsPositiveGood={false}
          />
          <CashFlowRow
            label="NOPAT"
            tooltipText="Net Operating Profit After Tax: Earnings generated from core business operations after taxes."
            value={formatCurrency(statement.nopat, 0)}
            isSubtotal
            icon={DollarSign}
            valueIsNeutral
          />
          <CashFlowRow
            label="Depreciation"
            tooltipText="Non-cash expense reflecting reduction in value of assets over time."
            value={formatCurrency(depreciation, 0)}
            icon={DollarSign}
            valueIsPositiveGood={false}
          />

          <div className="text-muted-foreground pt-4 pb-1 text-xs font-semibold tracking-wider uppercase">
            Investing Activities
          </div>
          <CashFlowRow
            label="PP&E"
            tooltipText="Cash used for acquiring or proceeds from selling long-term assets."
            value={formatCurrency(cashFlowFromInvesting, 0)}
            icon={Building2}
            valueIsNeutral
          />
          <CashFlowRow
            label="Net Working Capital"
            tooltipText="Change in Net Working Capital. Positive indicates more cash tied up."
            value={formatCurrency(totalChangeInNWC, 0)}
            icon={Building2}
            valueIsNeutral
          />
          <CashFlowRow
            label="Change in Receivables"
            value={formatCurrency(statement.investmentsNUV.deltaDebit, 0)}
            indent={2}
            valueIsNeutral
          />
          <CashFlowRow
            label="Change in Inventories"
            value={formatCurrency(statement.investmentsNUV.deltaInventories, 0)}
            indent={2}
            valueIsNeutral
          />
          <CashFlowRow
            label="Change in Payables"
            value={formatCurrency(statement.investmentsNUV.deltaCredit, 0)}
            indent={2}
            valueIsNeutral
          />

          <CashFlowRow
            label="Free Cash Flow (FCF)"
            tooltipText="Cash available after covering operating and capital expenditures."
            value={formatCurrency(statement.freeCashFlow, 0)}
            isTotal
            icon={Zap}
            valueIsPositiveGood
          />
        </CardContent>
        <CardFooter className="text-muted-foreground border-t px-5 pt-2 pb-4 text-xs">
          <Info className="mr-1.5 h-3.5 w-3.5 shrink-0" />
          <span>
            FCF reflects cash generated before financing activities.
          </span>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
