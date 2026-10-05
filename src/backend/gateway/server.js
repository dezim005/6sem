const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

const ALLAN_API = process.env.ALLAN_API || "https://vaga-livre-api.onrender.com";
const GUSTAVO_API = process.env.GUSTAVO_API || "https://gusstavo-api.onrender.com";
const PEDRO_API = process.env.PEDRO_API || "https://pmv-si-2026-2-pe6-t2-g09-1.onrender.com";
const ROBERTA_API =
  process.env.ROBERTA_API || "https://pmv-si-2026-2-pe6-t2-g09-1-jbk9.onrender.com";
const ANDRE_API = process.env.ANDRE_API || "https://andre-api-bhnv.onrender.com";
const GIOVANNY_API = process.env.GIOVANNY_API || "";

app.use(cors({ origin: true }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    services: {
      allan: ALLAN_API,
      gustavo: GUSTAVO_API,
      pedro: PEDRO_API,
      roberta: ROBERTA_API,
      andre: ANDRE_API,
      giovanny: GIOVANNY_API || null,
    },
  });
});

function matches(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function proxyTo(target, prefix) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 60000,
    proxyTimeout: 60000,
    pathFilter: (pathname) => matches(pathname, prefix),
    on: {
      error(_err, _req, res) {
        if (!res.headersSent) {
          res.status(502).json({ message: "Serviço indisponível." });
        }
      },
    },
  });
}

app.use(proxyTo(PEDRO_API, "/api/v1/auth"));
app.use(proxyTo(ROBERTA_API, "/api/v1/users"));
app.use(proxyTo(ROBERTA_API, "/api/v1/condominiums"));
app.use(proxyTo(ALLAN_API, "/api/v1/spots"));
app.use(proxyTo(GUSTAVO_API, "/api/v1/reservations"));
app.use(proxyTo(ANDRE_API, "/notifications"));

if (GIOVANNY_API) {
  app.use(proxyTo(GIOVANNY_API, "/api/ParkingSpots"));
}

app.listen(PORT, () => {
  console.log(`Gateway em http://localhost:${PORT}`);
});
