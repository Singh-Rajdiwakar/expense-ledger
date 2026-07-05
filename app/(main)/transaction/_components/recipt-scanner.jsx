"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
    setData: setScannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    await scanReceiptFn(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      if (scannedData.success) {
        onScanComplete(scannedData.data);
      } else {
        toast.error(scannedData.error || "Receipt scan failed");
      }
      setScannedData(undefined);
    }
  }, [onScanComplete, scanReceiptLoading, scannedData, setScannedData]);

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-[#E5E7EB] bg-[#F0EEFF] text-[#695CF6] hover:bg-[#E5E1FF]"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
}
