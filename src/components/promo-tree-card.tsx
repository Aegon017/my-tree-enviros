import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Props {
    image: StaticImageData;
    title: string;
    description: string;
    linkText?: string;
    linkUrl?: string;
}

const PromoTreeCard = ( { image, title, description, linkText, linkUrl }: Props ) => {
    return (
        <Card className="relative bg-secondary/10 shadow-md flex-1 p-4 group">
            <div className="relative w-full flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Image
                        src={ image }
                        alt={ title }
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-primary">{ title }</h3>
                    <p className="text-base text-muted-foreground">{ description }</p>
                    { linkText && linkUrl && (
                        <Button variant="secondary" className="uppercase mt-4">
                            <Link href={ linkUrl } className="block">
                                { linkText }
                            </Link>
                        </Button>
                    ) }
                </div>
            </div>
        </Card>
    );
};

export default PromoTreeCard;