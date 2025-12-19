interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "", id }) => {
  return (
    <section id={id} className={`px-4 py-8 md:py-16 ${className}`} suppressHydrationWarning>
      <div className="container max-w-6xl mx-auto">{children}</div>
    </section>
  );
};

export default Section;
