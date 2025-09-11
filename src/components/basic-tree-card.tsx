import Image, { type StaticImageData } from 'next/image';
import { Card, CardFooter } from './ui/card';

interface Props {
    name: string;
    image: StaticImageData;
}

const BasicTreeCard = ( { name, image }: Props ) => {
    return (
        <Card className="relative bg-primary/10 rounded-lg shadow-md overflow-visible p-0">
            <div className="relative w-full">
                <Image
                    src={ image }
                    alt={ name }
                    className="w-full h-full object-cover rounded-t-lg transform transition-all duration-300 hover:scale-125"
                />
            </div>
            <CardFooter className="bg-primary/20 justify-center py-2 text-xl font-semibold uppercase text-primary hover:bg-primary/30 transition-colors rounded-b-lg">
                { name }
            </CardFooter>
        </Card>
    );
}

export default BasicTreeCard;