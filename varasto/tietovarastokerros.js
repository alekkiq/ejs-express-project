"use strict";

const { STATUSKOODIT, STATUSVIESTIT } = require("./statuskoodit");

const Tietokanta = require("./tietokanta");

const optiot = require("./SQLconfig.json");

const { syotaParametrit, paivitaParametrit } = require("./parametrit");

const sql = require("./sqlLauseet.json");

const haeKaikkiSql = sql.haeKaikki.join(" ");
const haeSql = sql.hae.join(' ');
const lisaaSql = sql.lisaa.join(' ');
const paivitaSql = sql.paivita.join(' ');
const poistaSql = sql.poista.join(' ');

const PERUSAVAIN = sql.perusavain;

module.exports = class Tietovarasto {
    constructor() {
        this.db = new Tietokanta(optiot);
    }
    get STATUSKOODIT() {
        return STATUSKOODIT;
    };

    haeKaikki() {
        return new Promise(async (resolve, reject) => {
            try {
                const tulos = await this.db.sqlKysely(haeKaikkiSql);
                resolve(tulos.kyselytulos)
            }
            catch (err) {
                reject(STATUSVIESTIT.OHJELMAVIRHE());
            }
        })
    }

    hae(numero) {
        return new Promise(async (resolve, reject) => {
            if (!numero) {
                reject(STATUSVIESTIT.EI_LOYTYNYT("tyhjä"));
            }
            else {
                try {
                    const tulos = await this.db.sqlKysely(haeSql, [numero]);
                    if (tulos.kyselytulos.length > 0) {
                        resolve(tulos.kyselytulos[0]);
                    }
                    else {
                        reject(STATUSVIESTIT.EI_LOYTYNYT(numero));
                    }
                }
                catch (err) {
                    reject(STATUSVIESTIT.OHJELMAVIRHE());
                }
            }
        });
    }

    lisaa(uusi) {
        return new Promise(async (resolve, reject) => {
            try {
                if (uusi) {
                    if (!uusi[PERUSAVAIN]) {
                        reject(STATUSVIESTIT.EI_LISATTY());
                    }
                    else {
                        const tulos = await this.db.sqlKysely(haeSql, [uusi[PERUSAVAIN]]);
                        if (tulos.kyselytulos.length > 0) {
                            reject(STATUSVIESTIT.JO_KAYTOSSA(uusi[PERUSAVAIN]));
                        }
                        else {
                            const status = await this.db.sqlKysely(lisaaSql, syotaParametrit(uusi));
                            resolve(STATUSVIESTIT.LISAYS_OK(uusi[PERUSAVAIN]));
                        }
                    }
                }
                else {
                    reject(STATUSVIESTIT.EI_LISATTY());
                }
            }
            catch (err) {
                reject(STATUSVIESTIT.EI_LISATTY());
            }
        });
    }

    poista(numero) {
        return new Promise(async (resolve, reject) => {
            if (!numero) {
                reject(STATUSVIESTIT.EI_LOYTYNYT("tyhjä"));
            }
            else {
                try {
                    const status = await this.db.sqlKysely(poistaSql, [numero]);
                    if (status.kyselytulos.muutetutMaara === 0) {
                        resolve(STATUSVIESTIT.EI_POISTETTU());
                    }
                    else {
                        resolve(STATUSVIESTIT.POISTO_OK(numero));
                    }
                }
                catch (err) {
                    reject(STATUSVIESTIT.OHJELMAVIRHE());
                }
            }
        });
    }

    paivita(muutettava) {
        return new Promise(async (resolve, reject) => {
            if (muutettava) {
                try {
                    const status = await this.db.sqlKysely(paivitaSql, paivitaParametrit(muutettava));
                    if (status.kyselytulos.muutetutMaara === 0) {
                        resolve(STATUSVIESTIT.EI_PAIVITETTY());
                    }
                    else {
                        resolve(STATUSVIESTIT.PAIVITYS_OK(muutettava[PERUSAVAIN]));
                    }
                }
                catch (err) {
                    reject(STATUSVIESTIT.EI_PAIVITETTY());
                }
            }
            else {
                reject(STATUSVIESTIT.EI_PAIVITETTY());
            }
        });
    }
}