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
  CSS3: 70,
  HTML5: 100,
  Discord: 100,
  EdgeDB: 60,
  VScode: 70,
};
export const get = () => {
  return {
    body: JSON.stringify(tech),
  };
};
