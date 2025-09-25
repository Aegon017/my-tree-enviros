import AppLayout from "@/components/app-layout"
import Section from "@/components/section"
import SectionTitle from "@/components/section-title"

const Page = async () => {
  return (
    <AppLayout>
      <Section>
        <SectionTitle
          title="Feed Tree"
          align="center"
          subtitle="Support our campaign to nourish and sustain trees for a greener future."
        />
      </Section>
    </AppLayout>
  )
}

export default Page