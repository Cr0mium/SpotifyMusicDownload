import express from "express"
import bodyParser from "body-parser"
import { dirname } from "path"
import { fileURLToPath } from "url"
import * as fs from "fs"
import querystring from "query-string"
import crypto from 'crypto';
import axios from "axios"
import { downloadSong } from "./src/downloader.js"


const app = express()
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const scope = 'playlist-read-private'// user-library-read user-top-read';
const client_id = 'db103e66c5684594a5a2dbb3f6ff6fcb';
const redirect_uri = 'http://localhost:3000/callback';
const client_secret = "69f079833098447b8dde4078c46438a2";
const state = crypto.randomBytes(16).toString('hex');
const configPath = "/Users/chini/code/webDev/Backend/MusicDownloader/src/config.JSON"
const libraryPath = "/Users/chini/code/webDev/Backend/MusicDownloader/public/library.html"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.get('/', function (req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state // Assuming session middleware

        }));
});




app.get('/callback', async (req, res) => {

    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        var formData = {
            code: req.query.code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }
        var config = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
        }
        const tokenData = await axios.post("https://accounts.spotify.com/api/token", querystring.stringify(formData), config)
        fs.writeFileSync(configPath, JSON.stringify(tokenData.data))
        res.redirect("/library");
    };


});

app.get("/library", async (req, res) => {
    res.sendFile(libraryPath)
})

app.get("/getPlaylist/:id", async (req, res) => {
    // console.log(req.params.id)
    const configData = JSON.parse(fs.readFileSync(configPath))

    try {
        let o=0
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${req.params.id}/tracks`, {
                params: { offset: o, limit: 100 },
                headers: {
                    Authorization: `Bearer ${configData.access_token}`,
                },
            });
        res.json(response.data)
        // console.log(response.data);
        // res.sendStatus(200);
    } catch (error) {
        console.error("Error fetching playlist tracks:", error.response?.data || error.message);
    }
})

app.get("/playlists", async (req, res) => {
    const configData = JSON.parse(fs.readFileSync(configPath))
    var config = {
        headers: {
            Authorization: `Bearer ${configData.access_token}`
        }
    }
    try {
        var data = await axios.get("https://api.spotify.com/v1/me/playlists", config)

        // console.log(data.data.items);
        res.json(data.data.items);
    } catch (error) {
        res.sendStatus(500)
        console.log(error);
    }

    // res.render("index.ejs",{data:data})
})

app.post("/download", async (req, res) => {
    console.log(req.body)
    try{
        const output= await downloadSong(req.body);
        console.log(output);
        res.send(output)
    }catch(error){
        console.log(error);
        res.send(error.message)
    }
    // res.sendStatus(200)
})

app.get("/login", async (req, res) => {
    const configData = JSON.parse(fs.readFileSync(configPath))

    res.render("index.ejs", { data: JSON.stringify(configData.access_token) })
})

app.listen(port, () => {
    console.log("Listening on port " + port);
});
