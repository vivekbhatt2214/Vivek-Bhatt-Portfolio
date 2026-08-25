import Resume from "@/components/Resume";
import InterviewBooking from "@/components/Interviewbooking";
import Education from "@/components/Education";
import Hero from "@/components/Hero";
import Certifications from "@/components/Certifications";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import VisitorBadge from "@/components/VisitorBadge";
import Navbar from "@/components/Navbar";
import VisitorTracker from "@/components/AnalyticsTracker";
import { getProjects } from "@/lib/projects";
import ScrollProgress from "@/components/extras/ScrollProgress";
import CustomCursor from "@/components/extras/CustomCursor";
import CommandPalette from "@/components/extras/CommandPalette";
import Toast from "@/components/extras/Toast";
import BackToTop from "@/components/extras/BackToTop";
import AIPortfolioBot from "@/components/AIPortfolioBot";
import { SiteContentProvider } from "@/components/SiteContentProvider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjects();
  return (
    <SiteContentProvider>
      <VisitorTracker />
      <ScrollProgress />
      <CustomCursor />
      <CommandPalette />
      <Toast />
      <Navbar />
      <Hero />
      <VisitorBadge />
      <About />
      <Skills />
      <Education />
      <Certifications />
      <Projects projects={projects} />
      <Experience />
      <Resume />
      <Contact />
      <InterviewBooking />
      <Footer />
      <BackToTop />
      <AIPortfolioBot />
    </SiteContentProvider>
  );
}
