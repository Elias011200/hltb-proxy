import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Função para dividir nome em palavras
function splitTerms(name) {
  return name.split(" ").filter(x => x.trim());
}

app.get("/hltb", async (req, res) => {
  const name = req.query.name;
  if (!name) return res.json({ error: "Missing ?name=" });

  try {
    // 1. faz busca nos servidores do HLTB
    const searchUrl = "https://howlongtobeat.com/api/search";

    const body = {
      searchType: "game",
      searchTerms: splitTerms(name),
      searchPage: 1,
      size: 20,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "name",
          rangeCategory: "main",
          rangeTime: { min: 0, max: 1000 },
          gameplay: { min: 0, max: 1000 },
          difficulty: 0,
          tbc: false,
          isGt: false,
          includeDlc: false,
          isReleases: false
        }
      }
    };

    const { data } = await axios.post(searchUrl, body, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const results = data.data || [];
    if (results.length === 0) {
      return res.json({ error: "No results" });
    }

    // Pega o primeiro jogo mais relevante
    const g = results[0];

    return res.json({
      id: g.game_id,
      name: g.game_name,
      main: g.comp_main || "",
      main_extra: g.comp_plus || "",
      completionist: g.comp_100 || ""
    });

  } catch (e) {
    return res.json({ error: e.toString() });
  }
});

app.listen(3000, () =>
  console.log("🔥 HLTB Proxy API ativo em http://localhost:3000")
);
