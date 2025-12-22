"use client";

import * as React from "react";
import type { Category } from "@prisma/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateTransactionCategory } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function CategoryCell({
  organizationId,
  transactionId,
  categoryId,
  categories
}: {
  organizationId: string;
  transactionId: string;
  categoryId: string | null;
  categories: Category[];
}) {
  const initial = categoryId ?? "uncategorized";

  const [optimisticValue, setOptimisticValue] = React.useState<string>(initial);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setOptimisticValue(initial);
  }, [initial]);

  async function onValueChange(next: string) {
    const prev = optimisticValue;

    setOptimisticValue(next);
    setSaving(true);

    try {
      await updateTransactionCategory({
        organizationId,
        transactionId,
        categoryId: next === "uncategorized" ? null : next
      });

      toast.success("Category updated", {
        description: "Transaction category has been saved."
      });
    } catch (e) {
      setOptimisticValue(prev);

      const message = e instanceof Error ? e.message : "Failed to update category";
      toast.error("Update failed", {
        description: message
      });
    } finally {
      setSaving(false);
    }
  }

  const selectedCategory = categories.find(c => c.id === optimisticValue);
  const displayValue = selectedCategory?.name ?? "Uncategorized";

  return (
    <Select value={optimisticValue} onValueChange={onValueChange} disabled={saving}>
      <SelectTrigger className="w-[180px] border-zinc-200 bg-white shadow-sm transition-all hover:border-violet-300 hover:ring-2 hover:ring-violet-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
        <div className="flex items-center gap-2">
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
          ) : (
            <div className={`h-2 w-2 rounded-full ${
              optimisticValue === "uncategorized"
                ? "bg-zinc-300"
                : "bg-violet-500"
            }`} />
          )}
          <SelectValue placeholder="Select category">
            <span className={optimisticValue === "uncategorized" ? "text-zinc-400" : "text-zinc-700"}>
              {displayValue}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="border-zinc-200 shadow-xl">
        <SelectItem
          value="uncategorized"
          className="cursor-pointer transition-colors hover:bg-zinc-50"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-zinc-300" />
            <span className="text-zinc-500">Uncategorized</span>
          </div>
        </SelectItem>
        {categories.map((c) => (
          <SelectItem
            key={c.id}
            value={c.id}
            className="cursor-pointer transition-colors hover:bg-violet-50"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-500" />
              <span>{c.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
