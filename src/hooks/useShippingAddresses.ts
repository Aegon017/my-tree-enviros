import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { shippingAddressService, ShippingAddress, CreateShippingAddressPayload, UpdateShippingAddressPayload } from "@/services/shipping-address.services";

export function useShippingAddresses() {
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await shippingAddressService.index();
            setAddresses(response.data?.addresses ?? []);
        } catch (e: any) {
            setError(e?.message ?? "Failed to fetch addresses");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const create = useCallback(async (payload: CreateShippingAddressPayload) => {
        try {
            const response = await shippingAddressService.store(payload);
            const address = response.data?.address;
            if (address) {
                setAddresses((prev) => [...prev, address]);
            }
            return response;
        } catch (e: any) {
            const validationErrors = e?.data?.errors || e?.data?.validation_errors;
            if (validationErrors) {
                throw { message: e.message ?? "Validation failed", errors: validationErrors };
            }
            toast.error(e?.message ?? "Failed to create address");
            throw e;
        }
    }, []);

    const update = useCallback(async (id: number, payload: UpdateShippingAddressPayload) => {
        try {
            const response = await shippingAddressService.update(id, payload);
            const updated = response.data?.address;
            if (updated) {
                setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
            }
            return response;
        } catch (e: any) {
            const validationErrors = e?.data?.errors || e?.data?.validation_errors;
            if (validationErrors) {
                throw { message: e.message ?? "Validation failed", errors: validationErrors };
            }
            toast.error(e?.message ?? "Failed to update address");
            throw e;
        }
    }, []);

    const remove = useCallback(async (id: number) => {
        try {
            await shippingAddressService.destroy(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to delete address");
            throw e;
        }
    }, []);

    const setDefault = useCallback(async (id: number) => {
        try {
            const response = await shippingAddressService.setDefault(id);
            const updated = response.data?.address;
            if (updated) {
                setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
            } else {
                await fetch();
            }
        } catch (e: any) {
            toast.error(e?.message ?? "Failed to set default address");
            throw e;
        }
    }, [fetch]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return {
        addresses,
        isLoading,
        error,
        refresh: fetch,
        create,
        update,
        remove,
        setDefault,
    } as const;
}