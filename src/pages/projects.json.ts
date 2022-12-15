const projects = [
  {
    repo: "tricked-dev/betternexus",
    website: "https://addons.mozilla.org/en-US/firefox/addon/betternexus",
    timestart: "09-12-2022",
    bits: 0b11,
  },
  {
    repo: "tricked-dev/lowestbins",
    website: "https://lb.tricked.pro",
    description: "An game api that serves around 25k people daily",
    timestart: "01-08-2022",
    bits: 0b11,
  },
  {
    repo: "nowrom/devices",
    name: "Nowrom",
    website: "https://nowrom.pages.dev",
    description: "A list of all most phones and the roms they have",
    bits: 0b01,
  },
  { repo: "tricked-dev/diplo", bits: 0b01 },
  {
    repo: "ascellahost/tsunami",
    website: "https://ascella.host",
    name: "Ascella",
    description:
      "A fast image uploader made for all platforms. At its peak it had 40 daily active users",
    timestart: "01-07-2021",
    timeend: "01-12-2022",
    bits: 0b11,
  },
  {
    name: "Aethor",
    website: "https://aethor.xyz",
    timestart: "01-07-2020",
    description:
      "A discord bot made to manage suggestions in discord servers used by over 350 servers",
    bits: 0b11,
  },
  { repo: "Tricked-dev/argoninstaller" },
  { repo: "tricked-dev/darkvault" },
  { repo: "Tricked-dev/vwmetrics" },
  { repo: "Tricked-dev/xsteps" },
  { repo: "dg-continuum/dws" },
  { repo: "octocat-rs/octocat-rs" },
  { repo: "Tricked-dev/tricked-bot" },
  { repo: "Tricked-dev/vwmetrics" },
  { repo: "Tricked-dev/bun-docs" },
  { repo: "Tricked-dev/bun-modules" },
];

let query = `
{
${
  projects.filter((x) => x.repo).map((x) =>
    `  ${x.repo?.split("/")[1]?.replaceAll("-", "_")}: repository(owner: "${
      x.repo?.split("/")[0]
    }", name: "${x.repo?.split("/")[1]}") {
    description
    name
    stargazerCount
    homepageUrl
    nameWithOwner
    url
  }
`
  ).join("")
}}
`;

let result: any[];
export const getData = async () => {
  let token = import.meta.env.SECRET_GITHUB_API;
  if (!token || result) return result ?? [];
  let req = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `bearer ${token}`,
    },
    body: JSON.stringify({
      query,
      variables: {},
    }),
  });
  let body = await req.json();
  let data = Object.values(body.data ?? {});

  // append every project  without a repo at the right place in data
  let i = 0;
  for (let x of projects) {
    if (!x.repo) {
      data.splice(i, 0, x);
    }
    i++;
  }

  let res = data.map((x: any, i) => {
    const project = projects[i];
    let nameWithOwner = x?.nameWithOwner;
    delete x?.nameWithOwner;
    if (!x.homepageUrl) delete x.homepageUrl;
    const result = {
      bits: 0b00,
      ...x,
      ...project,
      name: x.name || project?.name,
      repo: nameWithOwner || project?.repo,
    };
    return result;
  });

  result = res;
  return res;
};

export const get = async () => {
  return {
    body: JSON.stringify(await getData()),
    headers: {
      "content-type": "application/json",
    },
  };
};
