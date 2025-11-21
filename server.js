import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();

// Faz busca por nome e retorna o ID do jogo
async function searchHLTB(query) {
  const searchUrl = `https://howlongtobeat.com/?q=${encodeURIComponent(query)}`;

  const { data } = await axios.get(searchUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  // procura links que começam com /game/
  const link = $('a[href^="/game/"]').first().attr("href");
  if (!link) return null;

  // link vem no formato /game/12345
  const id = link.split("/game/")[1];
  return id;
}

// Pega as horas dentro da página do jogo
async function fetchGameTimes(gameId) {
  const url = `https://howlongtobeat.com/game/${gameId}`;

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(data);

  const getTime = (title) => {
    const row = $(`h4:contains("${title}")`).parent();
    return row.find("div").last().text().trim() || "";
  };

  return {
    main: getTime("Main Story"),
    main_extra: getTime("Main + Extra"),
    completionist: getTime("Completionist")
  };
}

app.get("/hltb", async (req, res) => {
  const name = req.query.name;
  if (!name) return res.json({ error: "Missing ?name=" });

  try {
    // 1. busca ID
    const id = await searchHLTB(name);
    if (!id) return res.json({ error: "Game not found" });

    // 2. pega tempos usando o ID
    const times = await fetchGameTimes(id);

    return res.json(times);

  } catch (e) {
    return res.json({ error: e.toString() });
  }
});

app.listen(3000, () =>
  console.log("🔥 HLTB Proxy ativo em http://localhost:3000")
);
