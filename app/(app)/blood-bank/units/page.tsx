import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReleaseQuarantineButton } from "@/components/release-quarantine-button";
import { BLOOD_GROUP_LABELS } from "@/lib/blood-compatibility";
import Link from "next/link";
import { Plus } from "lucide-react";

const statusTone: Record<string, "neutral" | "success" | "warning" | "critical" | "info"> = {
  quarantine: "warning",
  available: "success",
  reserved: "info",
  issued: "neutral",
  discarded: "critical",
  expired: "critical",
};

export default async function BloodUnitsPage() {
  const supabase = await createClient();

  const { data: units, error } = await supabase
    .from("edoslmis_bb_blood_units")
    .select("id, unit_number, blood_group, component, volume_ml, expiry_date, status")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Blood Units</h1>
          <p className="text-sm text-muted-foreground">Unit inventory and screening status</p>
        </div>
        <Link href="/blood-bank/units/new">
          <Button><Plus size={16} /> Add Blood Unit</Button>
        </Link>
      </div>

      <Card className="overflow-auto md:max-h-[70vh]">
        <table className="sticky-head stack-table w-full min-w-[640px] text-sm">
          <thead className="bg-surface-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Group</th>
              <th className="px-4 py-3 font-medium">Component</th>
              <th className="px-4 py-3 font-medium">Volume</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-critical">{error.message}</td>
              </tr>
            )}
            {!error && (units?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No blood units yet.</td>
              </tr>
            )}
            {units?.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-surface-muted">
                <td data-stack-head className="px-4 py-3 font-medium text-foreground">{u.unit_number}</td>
                <td data-label="Group" className="px-4 py-3">
                  <Badge tone="neutral">{BLOOD_GROUP_LABELS[u.blood_group] ?? u.blood_group}</Badge>
                </td>
                <td data-label="Component" className="px-4 py-3 text-muted-foreground">{u.component.replace(/_/g, " ")}</td>
                <td data-label="Volume" className="px-4 py-3 text-muted-foreground">{u.volume_ml} mL</td>
                <td data-label="Expiry" className="px-4 py-3 text-muted-foreground">{u.expiry_date}</td>
                <td data-label="Status" className="px-4 py-3">
                  <Badge tone={statusTone[u.status] ?? "neutral"}>{u.status}</Badge>
                </td>
                <td data-label="Action" className="px-4 py-3">
                  {u.status === "quarantine" && <ReleaseQuarantineButton unitId={u.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
