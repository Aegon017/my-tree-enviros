"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus } from "lucide-react";

export default function CartItemCard( {
  item,
  onRemove,
  onIncrease,
  onDecrease,
}: {
  item: any;
  onRemove: ( id: number ) => void;
  onIncrease: ( id: number ) => void;
  onDecrease: ( id: number ) => void;
} ) {
  const isTree = item.type === "tree";

  return (
    <Card className="p-0 overflow-hidden flex">
      <div className="w-32 h-32 relative bg-muted">
        { item.image ? (
          <Image src={ item.image } fill alt={ item.name } className="object-cover" sizes="128px" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">🪴</div>
        ) }
      </div>

      <CardContent className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{ item.name }</h3>
          <p className="text-sm text-muted-foreground">{ item.variant_name }</p>

          <div className="mt-2">
            { item.original_price ? (
              <div>
                <span className="line-through text-muted-foreground mr-2">₹{ item.original_price }</span>
                <span className="font-semibold text-primary">₹{ item.price }</span>
              </div>
            ) : (
              <div className="font-semibold text-primary">₹{ item.price }</div>
            ) }
          </div>
        </div>

        { !isTree && (
          <div className="flex items-center gap-2 mt-4">
            <Button size="icon" variant="outline" onClick={ () => onDecrease( item.id ) }>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-medium">{ item.quantity }</span>
            <Button size="icon" variant="outline" onClick={ () => onIncrease( item.id ) }>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) }
      </CardContent>

      <CardFooter className="p-4">
        <Button variant="destructive" size="icon" onClick={ () => onRemove( item.id ) }>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}