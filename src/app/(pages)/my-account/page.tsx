import AppLayout from "@/components/app-layout"
import Section from "@/components/section"
import SectionTitle from "@/components/section-title"

const Page = () => {
    return (
        <AppLayout>
            <Section>
                <SectionTitle title="My Account" align="center" subtitle="Manage your profile, settings, and account details." />
            </Section>
        </AppLayout>
    )
}

export default Page