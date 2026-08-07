"use client";

import { ArrowUpRight, FileCode2, FolderKanban, Globe2, KeyRound, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DocumentSummary } from "@htmlpub/core";
import { Badge } from "@htmlpub/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@htmlpub/ui/components/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@htmlpub/ui/components/chart";

type ActivityPoint = { month: string; documents: number };

const chartConfig = {
  documents: { label: "Updated documents", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

function StatCard({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: typeof FileCode2 }) {
  return (
    <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <CardDescription className="text-xs font-medium uppercase tracking-[0.12em]">{title}</CardDescription>
        <span className="flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon /></span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function WorkspaceOverview({ documents, collections, tokens, activity }: { documents: DocumentSummary[]; collections: number; tokens: number; activity: ActivityPoint[] }) {
  const versions = documents.reduce((total, document) => total + document.versionCount, 0);
  const shared = documents.filter((document) => document.shared).length;

  return (
    <div className="@container/main flex flex-col gap-5 md:gap-6">
      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard title="Documents" value={documents.length.toString()} description="Published and active" icon={FileCode2} />
        <StatCard title="Versions" value={versions.toString()} description="Across the workspace" icon={TrendingUp} />
        <StatCard title="Public links" value={shared.toString()} description="Active share access" icon={Globe2} />
        <StatCard title="Collections" value={collections.toString()} description={`${tokens} API ${tokens === 1 ? "token" : "tokens"} configured`} icon={FolderKanban} />
      </div>

      <Card className="rounded-2xl border-border/80 bg-card/95 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 border-b border-border/70 px-5 py-4">
          <div>
            <CardTitle className="text-sm font-semibold">Publication activity</CardTitle>
            <CardDescription className="mt-1 text-xs">Documents updated in the last six months.</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1.5 rounded-lg font-normal"><ArrowUpRight data-icon="inline-start" />Live data</Badge>
        </CardHeader>
        <CardContent className="px-3 pb-4 pt-5 sm:px-5">
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart accessibilityLayer data={activity} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} width={28} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="documents" fill="var(--color-documents)" radius={[8, 8, 3, 3]} maxBarSize={42} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground"><KeyRound /><span>Use the API tokens page to connect the htmlpub CLI without exposing your Clerk session.</span></div>
    </div>
  );
}
