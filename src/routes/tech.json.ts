export let tech = {
  Rust: 90,
  Actix: 90,
  Typescript: 100,
  Flutter: 70,
  Dart: 70,
  React: 70,
  Deno: 100,
  Node: 100,
  Postgresql: 70,
  MongoDB: 70,
  Rest: 70,
  Git: 70,
  Docker: 50,
  Linux: 90,
  Kotlin: 50,
  Grafana: 70,
  Prometheus: 70,
  InfluxDB: 20,
  CSS3: 70,
  HTML5: 100,
  Go: 70,
  Discord: 100,
  EdgeDB: 60,
  VScode: 70,
  Tailwind: 70,
  Vite: 50,
};
export const GET = () => {
  return {
    body: JSON.stringify(tech),
  };
};
