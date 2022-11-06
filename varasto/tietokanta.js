"use strict";

const mariadb = require("mariadb");

module.exports = class Tietokanta {
    constructor(optiot) {
        this.optiot = optiot;
    }
    sqlKysely(sql, parametrit) {
        return new Promise(async (resolve, reject) => {
            let yhteys;
            try {
                yhteys = await mariadb.createConnection(this.optiot);
                let kyselytulos = await yhteys.query(sql, parametrit);
                if (typeof kyselytulos === "undefined") {
                    reject("Virhe");
                }
                else if (typeof kyselytulos.affectedRows === "undefined") {
                    delete kyselytulos.meta;
                    resolve({ kyselytulos, tulosjoukko: true });
                }
                else {
                    resolve({
                        kyselytulos: {
                            muutetutMaara: kyselytulos.affectedRows,
                            insertNumero: kyselytulos.insertNumero,
                            status: kyselytulos.warningStatus
                        },
                        tulosjoukko: false
                    });
                }
            }
            catch (err) {
                reject(`Sql-virhe ${err}`);
            }
            finally {
                if (yhteys) {
                    yhteys.end();
                }
            }
        });
    }
}