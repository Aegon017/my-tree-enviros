import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItemType } from "@/types/home";

interface BreadcrumbNavProps {
    items: BreadcrumbItemType[];
    className?: string;
}

const BreadcrumbNav = ( { items, className = "" }: BreadcrumbNavProps ) => {
    return (
        <div className={ className }>
            <Breadcrumb>
                <BreadcrumbList>
                    { items.map( ( item, index ) => (
                        <div
                            key={ item.href ?? item.title }
                            className="flex items-center"
                        >
                            { index > 0 && <BreadcrumbSeparator /> }
                            <BreadcrumbItem>
                                { item.href ? (
                                    <BreadcrumbLink href={ item.href }>{ item.title }</BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{ item.title }</BreadcrumbPage>
                                ) }
                            </BreadcrumbItem>
                        </div>
                    ) ) }
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
};

export default BreadcrumbNav;