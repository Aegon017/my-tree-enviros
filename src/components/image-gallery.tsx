"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Lens } from "@/components/ui/lens";

interface Props {
    images: string[];
    name: string;
}

export default function ImageGallery( { images, name }: Props ) {
    const [ selected, setSelected ] = useState( 0 );
    const main = images[ selected ] || "/placeholder.jpg";

    return (
        <div className="space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/30 border">
                <Lens zoomFactor={ 2.5 }>
                    <Image
                        src={ main }
                        alt={ name }
                        width={ 1080 }
                        height={ 1080 }
                        className="object-cover"
                        priority
                    />
                </Lens>
            </div>

            { images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    { images.map( ( url, idx ) => (
                        <Button
                            key={ idx }
                            variant="outline"
                            type="button"
                            className={ `relative h-20 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${ selected === idx
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-muted hover:border-muted-foreground/30"
                                }` }
                            onClick={ () => setSelected( idx ) }
                        >
                            <Image src={ url } alt={ `${ name } ${ idx + 1 }` } fill className="object-cover" sizes="80px" priority />
                        </Button>
                    ) ) }
                </div>
            ) }
        </div>
    );
}