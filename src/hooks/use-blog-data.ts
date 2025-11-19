"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { blogService } from "@/services/blog.services";
import { BaseMeta } from "@/types/common.types";

export function useBlogData( { slug, initialParams = {} }: { slug?: string; initialParams?: any } = {} ) {
    const [ blog, setBlog ] = useState( null );
    const [ blogs, setBlogs ] = useState( [] );
    const [ meta, setMeta ] = useState<BaseMeta | null>( null );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( null );

    const paramsRef = useRef( initialParams );
    const initializedRef = useRef( false );

    const loadList = useCallback( async ( overrideParams?: any, reset = false ) => {
        setLoading( true );
        setError( null );

        try {
            const params = overrideParams || paramsRef.current;
            const res = await blogService.list( params );

            const list = res.data?.blogs ?? [];
            const m = res.data?.meta ?? null;

            setBlogs( prev => ( reset ? list : [ ...prev, ...list ] ) );
            setMeta( m );

            if ( overrideParams ) {
                paramsRef.current = overrideParams;
            }
        } catch ( err: any ) {
            setError( err.message || "Failed to load blogs" );
        } finally {
            setLoading( false );
        }
    }, [] );

    const loadMore = () => {
        if ( !meta || loading ) return;
        if ( meta.current_page >= meta.last_page ) return;

        const nextParams = {
            ...paramsRef.current,
            page: meta.current_page + 1,
        };

        loadList( nextParams );
    };

    useEffect( () => {
        if ( initializedRef.current ) return;
        initializedRef.current = true;

        ( async () => {
            setLoading( true );
            setError( null );

            try {
                if ( slug ) {
                    const res = await blogService.get( slug );
                    setBlog( res.data?.blog ?? null );
                }

                await loadList( paramsRef.current, true );
            } catch ( err: any ) {
                setError( err.message || "Failed to load blog data" );
            } finally {
                setLoading( false );
            }
        } )();
    }, [] );

    return {
        blog,
        blogs,
        meta,
        loading,
        error,
        loadList,
        loadMore,
    };
}