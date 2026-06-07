export const metadata = {
  title: "Resources",
  description:
    "Essential resources for Iowa journalists — FOIA guides, organizations, training, and tools.",
};

const resources = [
  {
    title: "Iowa Freedom of Information Council",
    url: "https://ifoic.org",
    desc: "FOI advocacy, training, and legal guidance for Iowa reporters and citizens.",
  },
  {
    title: "Iowa Newspaper Association",
    url: "https://inanews.com",
    desc: "Industry association for Iowa daily and weekly newspapers.",
  },
  {
    title: "Iowa Broadcast News Association",
    url: "https://ibna.org",
    desc: "Professional organization for Iowa radio and TV journalists.",
  },
  {
    title: "University of Iowa School of Journalism",
    url: "https://journalism.uiowa.edu",
    desc: "Journalism education, internships, and career resources.",
  },
  {
    title: "Iowa Capital Dispatch",
    url: "https://iowacapitaldispatch.com",
    desc: "Nonprofit state government and investigative news.",
  },
  {
    title: "Iowa Watch",
    url: "https://iowawatch.org",
    desc: "Nonprofit investigative and explanatory journalism.",
  },
  {
    title: "Reporters Committee — Iowa Shield Law Guide",
    url: "https://www.rcfp.org/privilege-compendium/iowa/",
    desc: "Legal guide to reporter's privilege in Iowa courts.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Journalism Resources</h1>
      <p className="mt-2 text-zinc-600">
        Curated links for Iowa journalists — organizations, legal guides, and training.
      </p>

      <div className="mt-8 space-y-4">
        {resources.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
          >
            <h2 className="font-semibold text-zinc-900">{item.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{item.desc}</p>
            <p className="mt-2 text-xs text-blue-700">{item.url}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
