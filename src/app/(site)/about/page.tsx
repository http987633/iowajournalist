import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `About ${siteConfig.name} — resources for Iowa journalists.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">About {siteConfig.name}</h1>
      <div className="prose prose-zinc mt-6 max-w-none">
        <p>
          <strong>{siteConfig.name}</strong> is an independent resource platform
          dedicated to supporting journalists working in Iowa. We publish guides,
          career resources, and commentary on the state&apos;s local news ecosystem.
        </p>
        <h2>Our Mission</h2>
        <p>
          To strengthen Iowa journalism by providing practical resources — from FOIA
          guides and training opportunities to career insights and industry analysis.
        </p>
        <h2>What We Cover</h2>
        <ul>
          <li>Freedom of Information (FOI) and public records access in Iowa</li>
          <li>Career development for aspiring and working journalists</li>
          <li>Local news ecosystem and media policy commentary</li>
          <li>Tools, scholarships, and training resources</li>
        </ul>
        <h2>Editorial Standards</h2>
        <p>
          We strive for accuracy, transparency, and usefulness. Content is reviewed
          before publication. We do not fabricate quotes, statistics, or sources.
        </p>
      </div>
    </div>
  );
}
