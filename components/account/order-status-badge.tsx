import type { OrderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const STATUS_VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive" | "success"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }): JSX.Element {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
