"use client";

import { Wallet, PiggyBank, TrendingUp, Landmark } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/widgets/stat-tile";
import { IncomeExpenseChart, NetWorthChart } from "@/components/widgets/finance-charts";
import { financeSnapshots } from "@/lib/mock/data";

export default function FinancesPage() {
  const latest = financeSnapshots[financeSnapshots.length - 1];
  const savingsRate = Math.round((latest.savings / latest.income) * 100);

  return (
    <div>
      <SectionHeader eyebrow="Finances" title="Financial Overview" description={`As of ${latest.month}`} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Wallet} label="Monthly income" value={`$${latest.income.toLocaleString()}`} accent="primary" />
        <StatTile icon={Landmark} label="Monthly expenses" value={`$${latest.expenses.toLocaleString()}`} accent="danger" />
        <StatTile icon={PiggyBank} label="Savings rate" value={`${savingsRate}%`} accent="success" />
        <StatTile icon={TrendingUp} label="Net worth" value={`$${latest.netWorth.toLocaleString()}`} accent="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <IncomeExpenseChart />
        <NetWorthChart />
      </div>
    </div>
  );
}
