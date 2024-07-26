---
title: Getting Started
description: information about how to use the plugin and getting started with it.
sidebar:
  hidden: false
  order: 1
head: []
---

After installing the plugin in your server you have to start it once to generate the config in plugins/PaperTimeSeries folder.

You should edit the database configuration inside so that it can connect to the database and generate the table and insert the data

```yml
# file: plugin.yml
database:
  url: jdbc:postgresql://localhost:5432/paper
  user: paper
  password: time
```

And a example docker-compose.yml file

PaperTimeSeries requires [TimescaleDB](https://www.timescale.com/), you can find out how to host it here <https://docs.timescale.com/self-hosted/latest/>

```yml
# file: docker-compose.yml
version: "3"
services:
  postgresql:
    image: timescale/timescaledb-ha:pg15-latest
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: time
      POSTGRES_DB: paper
      POSTGRES_USER: paper
      TZ: UTC
```
