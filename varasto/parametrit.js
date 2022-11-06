"use strict";
const syotaParametrit = peli => [
    +peli.numero, peli.nimi, +peli.vuosi, +peli.lukumaara, peli.genre
];

const paivitaParametrit = peli => [
    peli.nimi, +peli.vuosi, +peli.lukumaara, peli.genre, +peli.numero
];

module.exports = {
    syotaParametrit,
    paivitaParametrit
}
