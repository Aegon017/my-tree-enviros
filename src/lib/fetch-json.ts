export type ApiResponse<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T;
};

export class ApiError extends Error {
    status: number;
    body: any;

    constructor( message: string, status = 500, body: any = null ) {
        super( message );
        this.status = status;
        this.body = body;
    }
}

export async function fetchJson<T = any>( input: RequestInfo, init?: RequestInit ) {
    const res = await fetch( input, init );
    const contentType = res.headers.get( "content-type" ) || "";

    if ( !res.ok ) {
        if ( contentType.includes( "application/json" ) ) {
            const body = await res.json();
            throw new ApiError( body?.message || "Request failed", res.status, body );
        }
        const text = await res.text();
        throw new ApiError( text || "Request failed", res.status, text );
    }

    if ( contentType.includes( "application/json" ) ) {
        const body = await res.json();
        return body as ApiResponse<T>;
    }

    return { success: true, data: ( await res.text() ) as unknown as T } as ApiResponse<T>;
}