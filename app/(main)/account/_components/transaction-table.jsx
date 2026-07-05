"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  ReceiptText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bulkDeleteTransactions } from "@/actions/account";
import { categoryColors } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";
import { formatCategoryLabel, formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";
import DownloadCSVButton from "./download-csv";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

function SortIndicator({ active, direction }) {
  if (!active) return null;
  return direction === "asc" ? (
    <ChevronUp className="ml-1 size-4" />
  ) : (
    <ChevronDown className="ml-1 size-4" />
  );
}

function CategoryBadge({ category }) {
  const color = categoryColors[category] || "#94A3B8";

  return (
    <span
      className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold"
      style={{
        backgroundColor: `${color}18`,
        color,
      }}
    >
      {formatCategoryLabel(category)}
    </span>
  );
}

function RecurringBadge({ transaction }) {
  if (!transaction.isRecurring) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="size-3" />
        One-time
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="gap-1 bg-[#F0EEFF] text-[#695CF6] hover:bg-[#E5E1FF]">
            <RefreshCw className="size-3" />
            {RECURRING_INTERVALS[transaction.recurringInterval]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">Next Date:</div>
            <div>{format(new Date(transaction.nextRecurringDate), "PPP")}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TransactionActions({ transaction, onDelete }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0" aria-label="Transaction actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[#EF4444]" onClick={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TransactionTable({ transactions }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryOptions = useMemo(
    () => [...new Set(transactions.map((transaction) => transaction.category))].sort(),
    [transactions]
  );

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (categoryFilter) {
      result = result.filter((transaction) => transaction.category === categoryFilter);
    }

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, categoryFilter, recurringFilter, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE)
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
    setData: setDeleted,
  } = useFetch(bulkDeleteTransactions);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((transaction) => transaction.id)
    );
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }

    deleteFn(selectedIds);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setCategoryFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (deleted?.success && !deleteLoading) {
      toast.success("Transactions deleted successfully");
      setSelectedIds([]);
      setDeleted(undefined);
    } else if (deleted?.error && !deleteLoading) {
      toast.error(deleted.error || "Failed to delete transactions");
      setDeleted(undefined);
    }
  }, [deleted, deleteLoading, setDeleted]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const hasFilters = searchTerm || typeFilter || categoryFilter || recurringFilter;

  return (
    <section className="finance-card overflow-hidden">
      {deleteLoading && (
        <BarLoader className="mt-0" width="100%" color="#695CF6" />
      )}

      <div className="border-b border-[#EEF2F7] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <DownloadCSVButton />

            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => {
                setCategoryFilter(value === "all" ? "" : value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter || "all"}
              onValueChange={(value) => {
                setTypeFilter(value === "all" ? "" : value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={recurringFilter || "all"}
              onValueChange={(value) => {
                setRecurringFilter(value === "all" ? "" : value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SlidersHorizontal className="size-4 text-[#64748B]" />
                <SelectValue placeholder="More Filters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">More Filters</SelectItem>
                <SelectItem value="recurring">Recurring Only</SelectItem>
                <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
              </SelectContent>
            </Select>

            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash className="size-4" />
                Delete ({selectedIds.length})
              </Button>
            )}

            {hasFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Clear filters"
                aria-label="Clear filters"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[46px]">
                <Checkbox
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center">
                  Date
                  <SortIndicator
                    active={sortConfig.field === "date"}
                    direction={sortConfig.direction}
                  />
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                <div className="flex items-center">
                  Category
                  <SortIndicator
                    active={sortConfig.field === "category"}
                    direction={sortConfig.direction}
                  />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("amount")}>
                <div className="flex items-center justify-end">
                  Amount
                  <SortIndicator
                    active={sortConfig.field === "amount"}
                    direction={sortConfig.direction}
                  />
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[54px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-[#64748B]">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-[#0F172A]">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </div>
                    <div className="text-xs font-medium text-[#94A3B8]">
                      {format(new Date(transaction.date), "EEEE")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-full bg-[#F8FAFC] text-[#64748B]">
                        <ReceiptText className="size-4" />
                      </span>
                      <span className="font-semibold text-[#334155]">
                        {transaction.description || "Untitled Transaction"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={transaction.category} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "money-nums text-right font-extrabold",
                      transaction.type === "EXPENSE" ? "text-[#FF4D67]" : "text-[#22C55E]"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <RecurringBadge transaction={transaction} />
                  </TableCell>
                  <TableCell className="text-right">
                    <TransactionActions
                      transaction={transaction}
                      onDelete={() => deleteFn([transaction.id])}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="rounded-xl bg-[#F8FAFC] py-10 text-center text-sm font-medium text-[#64748B]">
            No transactions found
          </div>
        ) : (
          paginatedTransactions.map((transaction) => (
            <article key={transaction.id} className="rounded-xl border border-[#E8EDF3] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={() => handleSelect(transaction.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#0F172A]">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#64748B]">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <TransactionActions
                  transaction={transaction}
                  onDelete={() => deleteFn([transaction.id])}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <CategoryBadge category={transaction.category} />
                <p
                  className={cn(
                    "money-nums text-sm font-extrabold",
                    transaction.type === "EXPENSE" ? "text-[#FF4D67]" : "text-[#22C55E]"
                  )}
                >
                  {transaction.type === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
                <RecurringBadge transaction={transaction} />
              </div>
            </article>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EEF2F7] px-4 py-3 text-xs font-semibold text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {paginatedTransactions.length ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)} of{" "}
          {filteredAndSortedTransactions.length} transactions
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-lg"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="grid size-8 place-items-center rounded-lg bg-[#695CF6] text-white">
            {currentPage}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-lg"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
