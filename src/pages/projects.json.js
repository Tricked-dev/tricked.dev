const projects = [
  { repo: "tricked-dev/diplo" },
  {
    repo: "nowrom/devices",
    name: "Nowrom",
    description: "A cool project"
  },
  { repo: "tricked-dev/lowestbins" },
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
]

let query = `
{
${projects.map(x =>
  `  ${x.repo.split("/")[1].replaceAll("-", "_")}: repository(owner: "${x.repo.split("/")[0]}", name: "${x.repo.split("/")[1]}") {
    description
    name
    stargazerCount
    homepageUrl
    nameWithOwner
    url
  }
`).join("")}}
`

let result;
export const getData = async () => {
  let token = import.meta.env.SECRET_GITHUB_API;
  if (!token || result) return result ?? [];
  let req = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables: {}
    })
  })
  let body = await req.json()
  let data = Object.values(body.data ?? {});

  let res = data.map((x, i) => {
    let nameWithOwner = x.nameWithOwner;
    delete x.nameWithOwner
    return {
      ...x,
      ...projects[i],
      name: x.name || projects[i].name,
      repo: nameWithOwner || projects[i].repo,
    }
  })
  result = res;
  return res;
}

export const get = async () => {
  return {
    body: JSON.stringify(await getData()),
    headers: {
      "content-type": "application/json"
    }
  }
}


