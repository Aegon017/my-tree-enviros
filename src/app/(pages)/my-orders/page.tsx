import AppLayout from "@/components/app-layout"
import Section from "@/components/section"
import SectionTitle from "@/components/section-title"

const Page = () => {
    return (
        <AppLayout>
            <Section>
                <SectionTitle title="My Orders" align="center" subtitle="Your Orders" />
            </Section>
        </AppLayout>
    )
}

export default Page