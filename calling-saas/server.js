require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/call", async (req, res) => {
  try {
    const response = await axios.post(process.env.CALL_API_URL, {
      From: process.env.CALLER_ID,
      To: req.query.number,
      Url: `${process.env.BASE_URL}/ivr`
    }, {
      auth: {
        username: process.env.API_KEY,
        password: process.env.API_SECRET || ""
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/ivr", (req, res) => {
  res.type("text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Gather numDigits="1" action="/input" method="POST">
<Say>Press 1 for yes, 2 for no</Say>
</Gather>
</Response>`);
});

app.post("/input", (req, res) => {
  const digit = req.body.Digits;
  res.type("text/xml");
  if (digit === "1") {
    res.send(`<Response><Say>Thank you</Say></Response>`);
  } else {
    res.send(`<Response><Say>Goodbye</Say></Response>`);
  }
});

app.listen(process.env.PORT || 3000);
