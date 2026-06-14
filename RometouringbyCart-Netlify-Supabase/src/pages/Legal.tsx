import { Head } from "@/components/Head";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function Legal({ title, content }: { title: string, content: string }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Head title={`${title} | RometouringbyCart`} />
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif text-primary mb-8">{title}</h1>
          <div className="prose prose-stone prose-primary max-w-none">
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              This is a placeholder for the {title} page. 
            </p>
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-foreground/80 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
