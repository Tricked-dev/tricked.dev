const url = import.meta.env.DEV ? "/" : "https://tricked.dev/";

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
    description: "An game api that serves around 30k people daily",
    timestart: "01-08-2022",
    image:
      url +
      "assets/1910807468_A image of a hyper efficient trading section of a _xl-beta-v2-2-2.png",
    bits: 0b111,
  },
  {
    repo: "tricked-dev/stardew-mod-manager"
  },
  {
    repo: "BlazeWatch/carbon"
  },
  {
    repo: "nowrom/devices",
    name: "Nowrom",
    website: "https://nowrom.pages.dev",
    bits: 0b01,
  },
  { repo: "tricked-dev/diplo", bits: 0b01 },
  {
    repo: "ascellahost/ascellav3",
    website: "https://ascella.host",
    name: "Ascella",
    image: url + "assets/2023-06-03_23-41-01.png",
    description:
      "A fast image uploader made for all platforms. It has a home made desktop application written in rust",
    timestart: "01-07-2021",
    bits: 0b111,
  },
  {
    name: "Aethor",
    website: "https://aethor.xyz",
    timestart: "01-07-2020",
    image: url + "assets/2023-06-03_23-40-45.png",
    description:
      "A discord bot made to manage suggestions in discord servers used by over 450 servers",
    bits: 0b111,
  },
  {
    name: "Is gw2 online?",
    website: "https://pvz.tricked.dev",
    timestart: "01-06-2023",
    description: "Find out if Plants vs. Zombies GW2 is online",
  },
  { repo: "Tricked-dev/musicembeds" },
  { repo: "Tricked-dev/Speech-To-Text-Bot" },
  { repo: "Tricked-dev/argoninstaller" },
  { repo: "tricked-dev/darkvault" },
  { repo: "Tricked-dev/xsteps" },
  { repo: "Tricked-dev/dws" },
  { repo: "octocat-rs/octocat-rs" },
  { repo: "Tricked-dev/tricked-bot" },
  { repo: "Tricked-dev/vwmetrics" },
  { repo: "a2m8-app/a2m8" },
  { repo: "Tricked-dev/dockermc" },
  { repo: "Tricked-dev/bun-docs" },
  { repo: "Tricked-dev/bun-modules" },
];

let query = `
{
${projects
    .filter((x) => x.repo)
    .map(
      (x) =>
        `  ${x.repo?.split("/")[1]?.replaceAll("-", "_")}: repository(owner: "${x.repo?.split("/")[0]
        }", name: "${x.repo?.split("/")[1]}") {
    description
    name
    stargazerCount
    homepageUrl
    nameWithOwner
    url
    repositoryTopics(first: 50) {
      edges {
        node {
          id
          topic {
            name
          }
        }
      }
    }
  }
`
    )
    .join("")}}
`;

let result: any[];
export const getData = async () => {
  let token = import.meta.env.SECRET_GITHUB_API;
  if (!token || result) return result ?? [];
  let req = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
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
    const topics = x?.repositoryTopics?.edges.map(
      (x: any) => x.node.topic.name
    );
    let nameWithOwner = x?.nameWithOwner;
    delete x?.nameWithOwner;
    delete x?.repositoryTopics;
    if (!x.homepageUrl) delete x.homepageUrl;
    const result = {
      bits: 0b00,
      ...x,
      ...project,
      name: x.name || project?.name,
      repo: nameWithOwner || project?.repo,
      topics,
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
