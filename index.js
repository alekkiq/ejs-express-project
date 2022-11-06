"use strict";

const path = require("path");
const express = require("express");
const app = express();

const { port, host } = require("./config.json");

const Tietovarasto = require("./varasto/tietovarastokerros");
const varasto = new Tietovarasto();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "sivut"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.render("valikko", {
    kieli: "fi",
    otsikko: "Valikko",
    aihe: "Valikko",
    valinnat: [
        { reitti: "/haeKaikki", teksti: "Hae kaikki pelit" },
        { reitti: "/hae", teksti: "Hae yksi peli" },
        { reitti: "/lisaa", teksti: "Lisää peli" },
        { reitti: "/muuta", teksti: "Muuta pelin tietoja" },
        { reitti: "/poista", teksti: "Poista pelin tiedot" }
    ]
}));

app.get("/haeKaikki", (req, res) => varasto.haeKaikki().then(tulostaulu => res.render("taulukko", {
    kieli: "fi",
    otsikko: "Hae kaikki",
    aihe: "Pelit",
    sarakeotsikot: ["Numero", "Nimi", "Vuosi", "Lukumäärä", "Genre"],
    tulostaulu,
    laheta: "Lähetä tiedot",
    valikkoteksti: "Valikko"
}))
    .catch(err => lahetaTilaviesti(res, err)));

app.get("/hae", (req, res) => res.render("lomake", {
    kieli: "fi",
    otsikko: "Haku",
    aihe: "Hae peli",
    valikkoteksti: "Valikko",
    toiminto: "/haeYksi",
    laheta: "Lähetä",
    kentat: [
        {
            nimi: "Numero: ",
            tyyppi: "text",
            name: "numero",
            id: "numero",
            koko: 6,
            value: "",
            readonly: ""
        }
    ]
}));

app.post("/haeYksi", async (req, res) => {
    try {
        const numero = req.body.numero;
        const tulos = await varasto.hae(numero);
        const kentat = [];
        for (const [avain, tieto] of Object.entries(tulos)) {
            const [eka, ...loput] = avain;
            const nimi = eka.toUpperCase() + loput.join("");
            kentat.push({ nimi, tieto });
        }
        res.render("tulossivu", {
            kieli: "fi",
            otsikko: "Haku",
            aihe: "Hae peli",
            valikkoteksti: "Valikko",
            kentat
        })
    }
    catch (err) {
        lahetaTilaviesti(res, err);
    }
});

app.get("/lisaa", (req, res) => res.render("lomake", {
    kieli: "fi",
    otsikko: "Syöttölomake",
    aihe: "Syötä pelin tiedot",
    toiminto: "/talletatiedot",
    kentat: muodostaKentat({
        numero: { value: "", readonly: "" },
        nimi: { value: "", readonly: "" },
        vuosi: { value: "", readonly: "" },
        lukumaara: { value: "", readonly: "" },
        genre: { value: "", readonly: "" }
    }),
    laheta: "Lähetä tiedot",
    valikkoteksti: "Valikko"
}));

app.post("/talletatiedot", async (req, res) => {
    try {
        const peli = req.body;
        const status = await varasto.lisaa(peli);
        lahetaTilaviesti(res, status);
    }
    catch (err) {
        lahetaTilaviesti(res, err);
    }
}); //talletus loppu

app.get("/muuta", (req, res) => res.render("lomake", {
    kieli: "fi",
    otsikko: "Muutoslomake",
    aihe: "Päivitä pelin tiedot",
    toiminto: "/haeMuutettava",
    kentat: muodostaKentat({
        numero: { value: "", readonly: "" },
        nimi: { value: "", readonly: "readonly" },
        vuosi: { value: "", readonly: "readonly" },
        lukumaara: { value: "", readonly: "readonly" },
        genre: { value: "", readonly: "readonly" }
    }),
    laheta: "Lähetä tiedot",
    valikkoteksti: "Valikko"
}));

app.post("/haeMuutettava", async (req, res) => {
    try {
        const numero = req.body.numero;
        const peli = await varasto.hae(numero);
        res.render("lomake", {
            kieli: "fi",
            otsikko: "Muutoslomake",
            aihe: "Päivitä pelin tiedot",
            toiminto: "/talletamuutetut",
            kentat: muodostaKentat({
                numero: { value: peli.numero, readonly: "readonly" },
                nimi: { value: peli.nimi, readonly: " " },
                vuosi: { value: peli.vuosi, readonly: " " },
                lukumaara: { value: peli.lukumaara, readonly: " " },
                genre: { value: peli.genre, readonly: " " }
            }),
            laheta: "Lähetä tiedot",
            valikkoteksti: "Valikko"
        });
    }
    catch (err) {
        lahetaTilaviesti(res, err);
    }
});

app.post("/talletamuutetut", (req, res) => varasto.paivita(req.body)
    .then(status => lahetaTilaviesti(res, status))
    .catch(err => lahetaTilaviesti(res, err)));

app.get("/poista", (req, res) => res.render("lomake", {
    kieli: "fi",
    otsikko: "Poista",
    aihe: "Poista peli",
    valikkoteksti: "Valikko",
    toiminto: "/poista",
    laheta: "Lähetä",
    kentat: [
        {
            nimi: "Numero: ",
            tyyppi: "text",
            name: "numero",
            id: "numero",
            koko: 6,
            value: "",
            readonly: ""
        }
    ]
}));

app.post("/poista", (req, res) => varasto.poista(req.body.numero)
    .then(status => lahetaTilaviesti(res, status))
    .catch(err => lahetaTilaviesti(res, err)));

app.listen(port, host, () => console.log(`Palvelin ${host}:${port} käynnissä`));

function lahetaTilaviesti(res, status) {
    res.render("tilasivu", {
        kieli: "fi",
        otsikko: "Status",
        aihe: status.tyyppi === "err" ? "err" : "Tila",
        valikkoteksti: "Valikko",
        status
    });
}

function muodostaKentat(kenttaolio) {
    return [
        {
            nimi: "Numero: ",
            tyyppi: "text",
            name: "numero",
            id: "numero",
            koko: 6,
            value: kenttaolio.numero.value,
            readonly: kenttaolio.numero.readonly
        },
        {
            nimi: "Nimi: ",
            tyyppi: "text",
            name: "nimi",
            id: "nimi",
            koko: 20,
            value: kenttaolio.nimi.value,
            readonly: kenttaolio.nimi.readonly
        },
        {
            nimi: "Vuosi: ",
            tyyppi: "text",
            name: "vuosi",
            id: "vuosi",
            koko: 30,
            value: kenttaolio.vuosi.value,
            readonly: kenttaolio.vuosi.readonly
        },
        {
            nimi: "Lukumäärä: ",
            tyyppi: "text",
            name: "lukumaara",
            id: "lukumaara",
            koko: 15,
            value: kenttaolio.lukumaara.value,
            readonly: kenttaolio.lukumaara.readonly
        },
        {
            nimi: "Genre: ",
            tyyppi: "text",
            name: "genre",
            id: "genre",
            koko: 10,
            value: kenttaolio.genre.value,
            readonly: kenttaolio.genre.readonly
        }
    ]
}