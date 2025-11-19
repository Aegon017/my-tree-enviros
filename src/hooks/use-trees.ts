"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { treeService } from "@/services/tree.services";
import type { BaseMeta } from "@/types/common.types";

type TreeParams = {
    type: "sponsor" | "adopt";
    lat?: number;
    lng?: number;
    page?: number;
    per_page?: number;
    radius_km?: number;
};

export function useTrees( initialParams: TreeParams ) {
    const [ trees, setTrees ] = useState<any[]>( [] );
    const [ meta, setMeta ] = useState<BaseMeta | null>( null );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState<any>( null );

    const paramsRef = useRef( initialParams );
    const initializedRef = useRef( false );

    const loadList = useCallback( async ( overrideParams?: TreeParams, reset = false ) => {
        setLoading( true );
        setError( null );

        try {
            const params = overrideParams || paramsRef.current;

            if ( !params.lat || !params.lng ) {
                setTrees( [] );
                setMeta( null );
                return;
            }

            const res = await treeService.list( {
                user_lat: params.lat,
                user_lng: params.lng,
                type: params.type,
                radius_km: params.radius_km ?? 50,
                page: params.page ?? 1,
                per_page: params.per_page ?? 20,
            } );

            const list = res.data?.trees ?? [];
            const m = res.data?.meta ?? null;

            setTrees( prev => ( reset ? list : [ ...prev, ...list ] ) );
            setMeta( m );

            if ( overrideParams ) {
                paramsRef.current = overrideParams;
            }
        } catch ( err: any ) {
            setError( err.message || "Failed to load trees" );
        } finally {
            setLoading( false );
        }
    }, [] );

    const loadMore = () => {
        if ( !meta || loading ) return;
        if ( meta.current_page >= meta.last_page ) return;

        const nextParams = {
            ...paramsRef.current,
            page: ( meta.current_page + 1 ),
        };

        loadList( nextParams );
    };

    useEffect( () => {
        if ( initializedRef.current ) return;
        initializedRef.current = true;

        loadList( paramsRef.current, true );
    }, [] );

    useEffect( () => {
        loadList( initialParams, true );
    }, [ initialParams.lat, initialParams.lng, initialParams.type ] );

    return {
        trees,
        meta,
        loading,
        error,
        loadList,
        loadMore,
    };
}