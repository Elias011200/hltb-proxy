import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Divide o nome em palavras
function splitTerms(name) {
  return name.split(" ").filter(x => x.trim());
}

// Rota principal
app.get("/hltb", async (req, res) => {
  const name = req.query.name;
  if (!name) return res.json({ error: "Missing ?name=" });

  try {
    // Endpoint oficial do HLTB
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
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: { min: 0, max: 2000 },
          gameplay: { min: 0, max: 2000 },
          difficulty: 0,
          tbc: false,
          isGt: false,
          includeDlc: true,
          isReleases: false
        }
      }
    };

    // Headers necessários para evitar 404
    const { data } = await axios.post(searchUrl, body, {
      headers: {
        "Host": "howlongtobeat.com",
        "Connection": "keep-alive",
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        "sec-ch-ua-mobile": "?0",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "sec-ch-ua-platform": "\"Windows\"",
        "Origin": "https://howlongtobeat.com",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://howlongtobeat.com/",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const results = data.data || [];

    if (results.length === 0) {
      return res.json({ error: "No results" });
    }

    const g = results[0]; // primeiro resultado relevante

    return res.json({
      id: g.game_id,
      name: g.game_name,
      main: g.comp_main || "",
      main_extra: g.comp_plus || "",
      completionist: g.comp_100 || "",
      gameplay_main: g.gameplay_main || "",
      gameplay_extra: g.gameplay_plus || "",
      gameplay_compl: g.gameplay_100 || ""
    });

  } catch (e) {
    return res.json({ error: e.toString() });
  }
});

// Rota de teste
app.get("/", (req, res) => {
  res.send("HLTB Proxy funcionando! Use /hltb?name=nome do jogo");
});

// Inicia
app.listen(3000, () =>
  console.log("🔥 HLTB Proxy ativo em http://localhost:3000")
);
