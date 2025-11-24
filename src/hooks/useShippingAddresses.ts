import { useEffect, useState, useCallback } from "react";
import api from "@/services/http-client";
import type { ShippingAddress } from "@/types/shipping-address.types";

interface UseShippingAddressesResult {
    addresses: ShippingAddress[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
    create: (payload: Omit<ShippingAddress, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>;
    update: (id: number, payload: Partial<ShippingAddress>) => Promise<void>;
    remove: (id: number) => Promise<void>;
    setDefault: (id: number) => Promise<void>;
}

export function useShippingAddresses(): UseShippingAddressesResult {
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get<{ data: ShippingAddress[] }>("/shipping-addresses");
            setAddresses(res.data ?? []);
        } catch (e: any) {
            setError(e.message || "Failed to load addresses");
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (payload: Omit<ShippingAddress, "id" | "created_at" | "updated_at" | "user_id">) => {
        try {
            const response = await api.post<{ data: ShippingAddress }>("/shipping-addresses", payload as any);
            if (response.data) {
                setAddresses((prev) => [...prev, response.data!]);
            }
        } catch (e: any) {
            setError(e.message || "Failed to create address");
            throw e;
        }
    }, []);

    const update = useCallback(async (id: number, payload: Partial<ShippingAddress>) => {
        try {
            const response = await api.put<{ data: ShippingAddress }>(`/shipping-addresses/${id}`, payload);
            if (response.data) {
                setAddresses((prev) => prev.map((a) => (a.id === id ? response.data! : a)));
            }
        }
    }, []); \n\n    const remove = useCallback(async (id: number) => {
        \n        try { \n            await api.delete(`/shipping-addresses/${id}`); \n            setAddresses((prev) => prev.filter((a) => a.id !== id)); \n } catch (e: any) {
        \n            setError(e.message || \"Failed to delete address\");\n            throw e;\n        }\n    }, []);

    const setDefault = useCallback(async (id: number) => {
            try {
                await api.post(`/shipping-addresses/${id}/set-default`);
                await fetchAll();
            } catch (e: any) {
                setError(e.message || "Failed to set default address");
                throw e;
            }
        }, [fetchAll]);

            useEffect(() => {
                fetchAll();
            }, [fetchAll]);

            return {
                addresses,
                isLoading,
                error,
                refresh: fetchAll,
                create,
                update,
                remove,
                setDefault,
            };
        }
