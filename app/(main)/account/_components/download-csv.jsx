"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DownloadCSVButton() {
    const handleDownload = () => {
        window.open("/api/export", "_blank");
    };

    return (
        <Button
            onClick={handleDownload}
            variant="outline"
            className="h-10"
        >
            <Download className="size-4" />
            Export
        </Button>
    );
}
