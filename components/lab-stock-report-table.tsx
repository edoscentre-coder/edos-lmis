"use client";

import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { LabStockReportRow } from "@/lib/data/lab-stock-checks";
import { PostStockCorrectionButton } from "@/components/post-stock-correction-button";

function fmt(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

export function LabStockReportTable({ rows }: { rows: LabStockReportRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(itemId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  return (
    <div className="overflow-auto md:max-h-[70vh] md:rounded-lg md:border md:border-border">
      <table className="stack-table sticky-head sticky-col w-full min-w-[1700px] text-sm">
        <thead className="bg-surface-muted text-left text-muted-foreground">
          <tr>
            {/* The expand toggle lives inside the Commodity cell so that
                Commodity is the first column and can be frozen while the
                fourteen figures beside it are scrolled. */}
            <th className="px-3 py-2 font-medium">Commodity</th>
            <th className="px-3 py-2 font-medium">Beginning Balance</th>
            <th className="px-3 py-2 font-medium">Qty Received (KEMSA)</th>
            <th className="px-3 py-2 font-medium">Qty Received (Other)</th>
            <th className="px-3 py-2 font-medium">Quantity Used</th>
            <th className="px-3 py-2 font-medium">Tests Done</th>
            <th className="px-3 py-2 font-medium">QAQC Repeats</th>
            <th className="px-3 py-2 font-medium">Losses/Wastage</th>
            <th className="px-3 py-2 font-medium">Positive Adj.</th>
            <th className="px-3 py-2 font-medium">Negative Adj.</th>
            <th className="px-3 py-2 font-medium">Expiring &lt;6mo</th>
            <th className="px-3 py-2 font-medium">#Stocked Out</th>
            <th className="px-3 py-2 font-medium">Physical Count</th>
            <th className="px-3 py-2 font-medium">Qty Required (Supply)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={14} className="px-4 py-6 text-center text-muted-foreground">
                No lab stock checks recorded for this period.
              </td>
            </tr>
          )}
          {rows.map((row) => {
            const isOpen = expanded.has(row.itemId);
            const isLow = row.hasEntries && row.physicalCount <= row.reorderLevel;
            return (
              <Fragment key={row.itemId}>
                <tr className="border-t border-border hover:bg-surface-muted">
                  <td data-stack-head className="px-3 py-2 font-medium text-foreground">
                    <span className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(row.itemId)}
                        disabled={row.dailyRows.length === 0}
                        className="mt-0.5 shrink-0 text-muted-foreground disabled:opacity-30"
                        aria-label="Toggle daily breakdown"
                      >
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <span className="min-w-0">
                        {row.name} <span className="text-muted-foreground">({row.code})</span>
                        {row.departmentName && (
                          <span className="ml-1 text-xs text-muted-foreground">&middot; {row.departmentName}</span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td data-label="Beginning Balance" className="px-3 py-2 text-muted-foreground">{fmt(row.beginningBalance)}</td>
                  <td data-label="Qty Received (KEMSA)" className="px-3 py-2 text-muted-foreground">{fmt(row.qtyReceived)}</td>
                  <td data-label="Qty Received (Other)" className="px-3 py-2 text-muted-foreground">{fmt(row.qtyReceivedOtherSources)}</td>
                  <td data-label="Quantity Used" className="px-3 py-2 font-medium text-foreground">{fmt(row.quantityUsed)}</td>
                  <td data-label="Tests Done" className="px-3 py-2 text-muted-foreground">{fmt(row.testsDone)}</td>
                  <td data-label="QAQC Repeats" className="px-3 py-2 text-muted-foreground">{fmt(row.qaqcRepeats)}</td>
                  <td data-label="Losses/Wastage" className="px-3 py-2 text-muted-foreground">{fmt(row.lossesWastage)}</td>
                  <td data-label="Positive Adj." className="px-3 py-2 text-muted-foreground">{fmt(row.positiveAdjustments)}</td>
                  <td data-label="Negative Adj." className="px-3 py-2 text-muted-foreground">{fmt(row.negativeAdjustments)}</td>
                  <td data-label="Expiring <6mo" className="px-3 py-2">
                    {row.expiringUnder6Months > 0 ? (
                      <Badge tone="warning">{fmt(row.expiringUnder6Months)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td data-label="#Stocked Out" className="px-3 py-2">
                    {row.stockedOutQty > 0 ? (
                      <Badge tone="critical">{fmt(row.stockedOutQty)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td
                    data-label="Physical Count"
                    className={`px-3 py-2 font-medium ${
                      row.hasDiscrepancy ? "bg-critical/15 text-critical" : isLow ? "text-warning" : "text-foreground"
                    }`}
                  >
                    {fmt(row.physicalCount)}
                  </td>
                  <td data-label="Qty Required (Supply)" className="px-3 py-2 text-muted-foreground">{fmt(row.quantityRequiredSupply)}</td>
                </tr>
                {isOpen && row.dailyRows.length > 0 && (
                  <tr className="border-t border-border bg-surface-muted/50">
                    <td colSpan={14} className="px-3 py-2">
                      <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-xs">
                        <thead className="text-muted-foreground">
                          <tr>
                            <th className="px-2 py-1 text-left font-medium">Date</th>
                            <th className="px-2 py-1 text-left font-medium">Beginning</th>
                            <th className="px-2 py-1 text-left font-medium">Received (KEMSA)</th>
                            <th className="px-2 py-1 text-left font-medium">Used</th>
                            <th className="px-2 py-1 text-left font-medium">Expected</th>
                            <th className="px-2 py-1 text-left font-medium">Physical Count</th>
                            <th className="px-2 py-1 text-left font-medium" />
                          </tr>
                        </thead>
                        <tbody>
                          {row.dailyRows.map((d) => {
                            const discrepancy = d.physicalCount - d.computedExpectedBalance;
                            return (
                              <tr key={d.checkDate} className="border-t border-border">
                                <td className="px-2 py-1">{d.checkDate}</td>
                                <td className="px-2 py-1">{fmt(d.beginningBalance)}</td>
                                <td className="px-2 py-1">{fmt(d.qtyReceived)}</td>
                                <td className="px-2 py-1">{fmt(d.quantityUsed)}</td>
                                <td className="px-2 py-1">{fmt(d.computedExpectedBalance)}</td>
                                <td
                                  className={`px-2 py-1 ${
                                    Math.abs(discrepancy) > 0.01 ? "font-medium text-critical" : ""
                                  }`}
                                >
                                  {fmt(d.physicalCount)}
                                </td>
                                <td className="px-2 py-1">
                                  {d.quantityUsedIsManual ? (
                                    <span className="text-muted-foreground" title="Quantity Used was manually overridden for this date — Expected isn't ledger-verified, so no correction can be posted from here.">
                                      Used is manual
                                    </span>
                                  ) : (
                                    <PostStockCorrectionButton itemId={row.itemId} checkDate={d.checkDate} difference={discrepancy} />
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
