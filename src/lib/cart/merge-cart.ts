import { CartItem } from "@/domain/cart/cart-item";

export function mergeGuestIntoServer(
    guestItems: CartItem[],
    serverItems: CartItem[]
): CartItem[] {
    const output = [ ...serverItems.map( ( i ) => ( { ...i } ) ) ];

    const makeKey = ( item: CartItem ) => {
        if ( item.type === "product" ) {
            return `product:${ item.id }:${ item.variant?.sku ?? "" }`;
        }
        return `${ item.type }:tree:${ item.tree?.id }:plan:${ item.plan?.id }`;
    };

    const map = new Map<string, CartItem>();
    output.forEach( ( i ) => map.set( makeKey( i ), i ) );

    guestItems.forEach( ( g ) => {
        const key = makeKey( g );
        const exists = map.get( key );

        if ( exists ) {
            exists.quantity += g.quantity;
            map.set( key, exists );
        } else {
            const clone = { ...g };
            delete clone.clientId;
            output.push( clone );
            map.set( key, clone );
        }
    } );

    return output;
}