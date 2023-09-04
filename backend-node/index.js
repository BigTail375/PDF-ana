const fetch = require("node-fetch");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const constants = require("./components/Constants");
const API_KEY = "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";
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(cors());

const port = 5000;

app.post("/upload", async (req, res) => {
  if (!req.files) {
    return res.status(500).send({ msg: "file is not found" });
  } else {
    const client_data = await pdfParse(req.files.file);
    console.log(client_data)
    const str = String(client_data.text);
    const query = `
    ${str}
    
    please descript above sentences.

    And then please find the possible questions  like these format.

    Number of Questions shuld be more than 50

    Question 1:
    
    Question 2:
   
    Question 3:
   

    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(API_KEY),
      },

      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: query,
          },
        ],
      }),
    });

    const data = await response.json();

    res.send(JSON.stringify({ message: data.choices[0].message.content }));
  }
});

app.post("/asked", async (req, res) => {
  const prompt1 = req.body.option;
  const prompt2 = req.body.userInput;
  const query = `
  ${prompt2}

  From above solidity script ${prompt1}.
  Result should be below format.

  '''
  Audit Report for Smart Contract: should be Smart Contract Type, not smart contract name.

  1. Overview
  2. Contract Structure
  3. Function Analysis

  '''
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(API_KEY),
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    }),
  });

  const data = await response.json();

  console.log(data.choices[0].message.content);

  res.send(JSON.stringify({ message: data.choices[0].message.content }));
});

app.listen(port, () => console.log(`Server is running on port ${port}!!`));
