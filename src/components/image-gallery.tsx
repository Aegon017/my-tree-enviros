"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Props {
    images: string[];
    name: string;
}

export default function ImageGallery( { images, name }: Props ) {
    const [ selected, setSelected ] = useState( 0 );
    const [ isZooming, setIsZooming ] = useState( false );
    const [ lensPos, setLensPos ] = useState( { x: 0, y: 0 } );
    const [ smoothLens, setSmoothLens ] = useState( { x: 0, y: 0 } );
    const [ containerRect, setContainerRect ] = useState<DOMRect | null>( null );
    const [ imgSize, setImgSize ] = useState( { width: 0, height: 0 } );

    const main = images[ selected ] || "/placeholder.jpg";
    const lensSize = 170;
    const zoomFactor = 2.4;
    const zoomBoxSize = 550;
    const smoothingFactor = 0.15;

    const imgRef = useRef<HTMLDivElement>( null );
    const imageEl = useRef<HTMLImageElement | null>( null );
    const animationFrame = useRef<number | null>( null );

    useEffect( () => {
        const container = document.querySelector( ".container" );
        if ( container ) setContainerRect( container.getBoundingClientRect() );
    }, [] );

    useEffect( () => {
        const observer = new ResizeObserver( () => {
            if ( imageEl.current ) {
                const { width, height } = imageEl.current.getBoundingClientRect();
                setImgSize( { width, height } );
            }
        } );
        if ( imageEl.current ) observer.observe( imageEl.current );
        return () => observer.disconnect();
    }, [ selected ] );

    const handleMouseMove = ( e: React.MouseEvent ) => {
        const rect = imgRef.current?.getBoundingClientRect();
        if ( !rect ) return;

        const half = lensSize / 2;
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = Math.max( half, Math.min( x, rect.width - half ) );
        y = Math.max( half, Math.min( y, rect.height - half ) );

        setLensPos( { x: x - half, y: y - half } );
    };

    useEffect( () => {
        const animate = () => {
            setSmoothLens( ( prev ) => ( {
                x: prev.x + ( lensPos.x - prev.x ) * smoothingFactor,
                y: prev.y + ( lensPos.y - prev.y ) * smoothingFactor,
            } ) );
            animationFrame.current = requestAnimationFrame( animate );
        };
        animationFrame.current = requestAnimationFrame( animate );
        return () => {
            if ( animationFrame.current ) cancelAnimationFrame( animationFrame.current );
        };
    }, [ lensPos ] );

    return (
        <div className="w-full relative">
            <div className="flex flex-col gap-4">
                <div
                    ref={ imgRef }
                    className="relative w-full h-[500px] rounded-2xl border bg-muted/30 overflow-hidden cursor-crosshair"
                    onMouseEnter={ () => setIsZooming( true ) }
                    onMouseLeave={ () => setIsZooming( false ) }
                    onMouseMove={ handleMouseMove }
                >
                    <Image
                        ref={ ( node ) => {
                            if ( node ) imageEl.current = node;
                        } }
                        src={ main }
                        alt={ name }
                        fill
                        className="object-cover select-none transition-transform duration-300"
                        draggable={ false }
                        priority
                    />

                    { isZooming && (
                        <div
                            className="absolute border-2 border-primary/60 bg-primary/10 rounded-lg pointer-events-none shadow-md transition-transform"
                            style={ {
                                width: `${ lensSize }px`,
                                height: `${ lensSize }px`,
                                left: `${ smoothLens.x }px`,
                                top: `${ smoothLens.y }px`,
                            } }
                        />
                    ) }
                </div>

                { images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        { images.map( ( url, idx ) => (
                            <Button
                                key={ idx }
                                variant="outline"
                                type="button"
                                className={ `relative h-20 w-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${ selected === idx
                                        ? "border-primary ring-2 ring-primary/20 scale-105"
                                        : "border-muted hover:border-muted-foreground/30"
                                    }` }
                                onClick={ () => setSelected( idx ) }
                            >
                                <Image
                                    src={ url }
                                    alt={ `${ name } ${ idx + 1 }` }
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                    priority
                                />
                            </Button>
                        ) ) }
                    </div>
                ) }
            </div>

            { isZooming && containerRect && imgSize.width > 0 && (
                <div
                    className="hidden md:block absolute z-50 rounded-2xl border overflow-hidden shadow-2xl bg-background transition-all duration-200 ease-out"
                    style={ {
                        top: 0,
                        left: imgRef.current
                            ? imgRef.current.getBoundingClientRect().right - containerRect.left + 32
                            : 0,
                        width: `${ zoomBoxSize }px`,
                        height: `${ zoomBoxSize }px`,
                        opacity: isZooming ? 1 : 0,
                        transform: isZooming ? "scale(1)" : "scale(0.98)",
                    } }
                >
                    <div
                        className="relative w-full h-full"
                        style={ {
                            transformOrigin: "top left",
                            transform: ( () => {
                                const { width, height } = imgSize;
                                const zoomW = width * zoomFactor;
                                const zoomH = height * zoomFactor;

                                const maxOffsetX = Math.max( zoomW - zoomBoxSize, 0 );
                                const maxOffsetY = Math.max( zoomH - zoomBoxSize, 0 );

                                let offsetX =
                                    ( ( smoothLens.x + lensSize / 2 ) / width ) * zoomW -
                                    zoomBoxSize / 2;
                                let offsetY =
                                    ( ( smoothLens.y + lensSize / 2 ) / height ) * zoomH -
                                    zoomBoxSize / 2;

                                if ( offsetX < 0 ) offsetX = 0;
                                if ( offsetY < 0 ) offsetY = 0;
                                if ( offsetX > maxOffsetX ) offsetX = maxOffsetX;
                                if ( offsetY > maxOffsetY ) offsetY = maxOffsetY;

                                return `translate(-${ offsetX }px, -${ offsetY }px) scale(${ zoomFactor })`;
                            } )(),
                            transition: "transform 0.04s linear",
                        } }
                    >
                        <Image
                            src={ main }
                            alt={ `${ name } zoom` }
                            fill
                            className="object-cover select-none"
                            draggable={ false }
                        />
                    </div>
                </div>
            ) }
        </div>
    );
}