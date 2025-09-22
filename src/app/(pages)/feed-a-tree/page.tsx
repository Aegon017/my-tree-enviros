import BasicTreeCard from "@/components/basic-tree-card";
import Section from "@/components/section";
import SectionTitle from "@/components/section-title";
import Link from "next/link";
import neemTree from "../../../../public/neem-tree.webp";
import AppLayout from "@/components/app-layout";

const Page = () => {
  const treeCards = [
    { id: "tree-1", name: "NEEM TREE", image: neemTree },
    { id: "tree-2", name: "MANGO TREE", image: neemTree },
    { id: "tree-3", name: "BANYAN TREE", image: neemTree },
    { id: "tree-4", name: "PEEPAL TREE", image: neemTree },
    { id: "tree-5", name: "TULSI PLANT", image: neemTree },
  ];
  return (
    <AppLayout>
      <Section className="bg-background py-12">
        <SectionTitle
          title="Feed A Tree"
          subtitle="Feeding a tree is more than just planting—it’s a commitment to a sustainable future. With every tree sponsored, you contribute to reducing carbon footprints, improving air quality, and preserving biodiversity. Trees not only beautify our surroundings but also play a vital role in combating climate change and supporting wildlife habitats."
          align="center"
        />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 justify-center gap-6">
          {treeCards.map((tree) => (
            <Link
              key={tree.id}
              href="/"
              className="transition-transform hover:scale-105"
            >
              <BasicTreeCard name={tree.name} image={tree.image} />
            </Link>
          ))}
        </div>
      </Section>
    </AppLayout>
  );
};

export default Page;
