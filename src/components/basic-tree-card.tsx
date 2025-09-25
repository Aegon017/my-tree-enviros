"use client"

import Image, { type StaticImageData } from "next/image"
import { Card } from "./ui/card"

interface Props {
  name: string
  image: StaticImageData | string
}

const BasicTreeCard = ( { name, image }: Props ) => {
  return (
    <Card className="gap-0 elegant-hover group relative overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out py-0">
      <div className="relative aspect-square overflow-hidden" style={ { width: "100%", height: "100%" } }>
        <Image
          src={ image || "/placeholder.svg" }
          alt={ name }
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="px-6 py-4">
        <h3 className="text-base font-semibold text-card-foreground tracking-tight text-balance leading-relaxed group-hover:text-primary transition-colors duration-300">
          { name }
        </h3>
        <div className="mt-3 h-px bg-gradient-to-r from-primary/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </Card>
  )
}

export default BasicTreeCard
