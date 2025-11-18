"use client";

import { useEffect, useRef, useState } from "react";
import { blogService } from "@/services/blog.service";

type ListParams = {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: string;
};

type UseBlogDataProps = {
    slug?: string;
    listParams?: ListParams;
};

export function useBlogData( props?: UseBlogDataProps ) {
    const { slug, listParams } = props || {};

    const [ blog, setBlog ] = useState<any>( null );
    const [ blogs, setBlogs ] = useState<any[]>( [] );
    const [ meta, setMeta ] = useState<any>( null );

    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState<any>( null );

    const initialLoadRef = useRef( false );

    const loadList = async ( params?: ListParams ) => {
        setLoading( true );
        setError( null );

        try {
            const res = await blogService.list( params || listParams || {} );
            setBlogs( res.data?.blogs ?? [] );
            setMeta( res.data?.meta ?? null );
        } catch ( err: any ) {
            setError( err.message || "Failed to load blogs" );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        if ( initialLoadRef.current ) return;
        initialLoadRef.current = true;

        const init = async () => {
            setLoading( true );
            setError( null );

            try {
                if ( slug ) {
                    const res = await blogService.get( slug );
                    setBlog( res.data?.blog ?? null );
                }

                if ( listParams ) {
                    const res = await blogService.list( listParams );
                    setBlogs( res.data?.blogs ?? [] );
                    setMeta( res.data?.meta ?? null );
                }
            } catch ( err: any ) {
                setError( err.message || "Failed to load blog data" );
            } finally {
                setLoading( false );
            }
        };

        init();
    }, [] );

    return {
        blog,
        blogs,
        meta,
        loading,
        error,
        loadList
    };
}