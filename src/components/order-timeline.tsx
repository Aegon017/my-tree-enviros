import { Check, Truck, Package, MapPin, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStepProps {
    label: string;
    date?: string;
    completed: boolean;
    current: boolean;
    icon: React.ComponentType<{ className?: string }>;
    last?: boolean;
}

const TimelineStep = ({ label, date, completed, current, icon: Icon, last }: TimelineStepProps) => {
    return (
        <div className={cn("flex flex-col items-center relative flex-1 group")}>
            <div
                className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors duration-300",
                    completed || current ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
                )}
            >
                <Icon className="w-5 h-5" />
            </div>

            {!last && (
                <div
                    className={cn(
                        "absolute top-5 left-1/2 w-full h-[2px] -z-0 transition-colors duration-300",
                        completed ? "bg-primary" : "bg-muted"
                    )}
                />
            )}

            <div className="mt-2 text-center">
                <p className={cn("text-sm font-medium", (completed || current) ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                </p>
                {date && <p className="text-xs text-muted-foreground">{date}</p>}
            </div>
        </div>
    );
};

export const OrderTimeline = ({ order }: { order: any }) => {
    const isShippable = order.is_shippable ?? true;

    const baseSteps = [
        {
            id: "placed",
            label: "Placed",
            icon: Package,
            completed: true,
            date: new Date(order.created_at).toLocaleDateString(),
        },
        {
            id: "processing",
            label: "Processing",
            icon: Check,
            completed: ["paid", "shipped", "out_for_delivery", "delivered", "completed"].includes(order.status),
            current: order.status === "paid",
        },
    ];

    const shippableSteps = [
        {
            id: "shipped",
            label: "Shipped",
            icon: Truck,
            completed: ["shipped", "out_for_delivery", "delivered", "completed"].includes(order.status),
            current: order.status === "shipped",
            date: order.tracking?.shipped_at ? new Date(order.tracking.shipped_at).toLocaleDateString() : undefined,
        },
        {
            id: "out_for_delivery",
            label: "Out for Delivery",
            icon: MapPin,
            completed: ["out_for_delivery", "delivered", "completed"].includes(order.status),
            current: order.status === "out_for_delivery",
        },
        {
            id: "delivered",
            label: "Delivered",
            icon: Home,
            completed: ["delivered", "completed"].includes(order.status),
            current: order.status === "delivered" || order.status === "completed",
            date: order.tracking?.delivered_at ? new Date(order.tracking.delivered_at).toLocaleDateString() : undefined,
        },
    ];

    const digitalSteps = [
        {
            id: "completed",
            label: "Completed",
            icon: Check,
            completed: order.status === "completed",
            current: order.status === "completed",
        }
    ];

    const steps = [...baseSteps, ...(isShippable ? shippableSteps : digitalSteps)];

    if (order.status === 'cancelled' || order.status === 'refunded') {
        return (
            <div className="bg-destructive/10 p-4 rounded-lg flex items-center gap-3 text-destructive border border-destructive/20">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold">Order Cancelled</h4>
                    <p className="text-sm opacity-80">{order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : 'This order has been cancelled.'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between w-full">
                {steps.map((step, index) => (
                    <TimelineStep
                        key={step.id}
                        {...step}
                        last={index === steps.length - 1}
                    />
                ))}
            </div>

            {order.tracking?.tracking_id && (
                <div className="bg-muted/30 p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm mt-6">
                    <div>
                        <span className="text-muted-foreground">Courier Partner:</span>
                        <span className="font-medium ml-2 block sm:inline">{order.tracking.courier_name}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Tracking ID:</span>
                        <span className="font-medium ml-2 font-mono block sm:inline">{order.tracking.tracking_id}</span>
                    </div>
                    {/* Future: Add 'Track Now' button linking to courier website */}
                    <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                        Manual Tracking
                    </div>
                </div>
            )}
        </div>
    );
};
