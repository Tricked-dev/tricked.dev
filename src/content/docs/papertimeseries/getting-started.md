---
title: My docs
description: Learn more about my project in this docs site built with Starlight.
sidebar:
  hidden: false
head: []
---

# Getting Started

After installing the plugin in your server you have to start it once to generate the config in plugins/PaperTimeSeries folder.

You should edit the database configuration inside so that it can connect to the database and generate the table and insert the data

```yml [plugin.yml]
database:
  password: time
  url: jdbc:postgresql://localhost:5432/paper
  user: paper
```

And a example docker-compose.yml file

PaperTimeSeries requires [TimescaleDB](https://www.timescale.com/), you can find out how to host it here <https://docs.timescale.com/self-hosted/latest/>

```yml [ocker-compose.yml]
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
