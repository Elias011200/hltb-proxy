import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();

// converte "Elden Ring" em URL válida do HLTB
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

app.get("/hltb", async (req, res) => {
  const name = req.query.name;
  if (!name) return res.json({ error: "Missing name parameter" });

  try {
    const slug = toSlug(name);
    const url = `https://howlongtobeat.com/game/${slug}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const $ = cheerio.load(data);

    const main = $('h4:contains("Main Story")').next().text().trim();
    const extra = $('h4:contains("Main + Extra")').next().text().trim();
    const comp = $('h4:contains("Completionist")').next().text().trim();

    return res.json({
      name,
      main,
      main_extra: extra,
      completionist: comp
    });
  } catch (e) {
    return res.json({ error: e.toString() });
  }
});

app.listen(3000, () =>
  console.log("🔥 HLTB Proxy ativo em http://localhost:3000")
);
