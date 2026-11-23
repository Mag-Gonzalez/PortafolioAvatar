import IntroAbout from "@/components/sections/IntroAbout";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <IntroAbout />
      <Projects />
      <Contact />
      <Footer />
    </>
  );
}
