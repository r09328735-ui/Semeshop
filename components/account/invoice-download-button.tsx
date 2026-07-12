"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function InvoiceDownloadButton({ orderNumber }: { orderNumber: string }): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload(): Promise<void> {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/account/orders/${orderNumber}/invoice`);
      if (!res.ok) {
        toast.error("Impossible de générer la facture.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Télécharger la facture
    </Button>
  );
}
