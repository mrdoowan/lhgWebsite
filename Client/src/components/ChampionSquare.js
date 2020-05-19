// npm modules
import React from 'react';
// Static
const versions = require('../static/versions.json');
const champById = require('../static/champById.json');

// If version is blank, grab most recent version.
export default function ChampionSquare({ id, version='' }) {
    let name = getChampName(id);
    version = (version === '') ? getCurrentVersion() : version;
    let url = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/' + name + '.png';
    return (<img src={url} alt={name} width="30" height="30" />);
}

function getChampName(id) {
    if (!(id in champById)) {
        return id;
    }
    else {
        return champById[id];
    }
}

function getCurrentVersion() {
    return versions[0];
}