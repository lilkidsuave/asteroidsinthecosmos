const fs = require('fs')
const { config } = require('process')
const configFile = require('./config.json')

// list all directories in the directory servapps and compile them in servapps.json

const servapps = fs.readdirSync('./servapps').filter(file => fs.lstatSync(`./servapps/${file}`).isDirectory())

let servappsJSON = []
for (const file of servapps) {
  try {
    try {
      const servapp = require(`./servapps/${file}/description.json`);
    }
    catch (error) {
    if (error.message.includes('Cannot find module')) {
      console.error(`Description.json not found for ${file}. Skipping.`);
      continue;
    } else {
      console.error(`Error loading description.json for ${file}: Skipping`, error.message);
      continue;
    }
  }
    const servapp = require(`./servapps/${file}/description.json`);
    servapp.id = file;
    servapp.screenshots = [];
    servapp.artefacts = {};
    // list all screenshots in the directory servapps/${file}/screenshots
    if (fs.existsSync(`./servapps/${file}/screenshots`)) {
      const screenshots = fs.readdirSync(`./servapps/${file}/screenshots`);
      for (const screenshot of screenshots) {
        servapp.screenshots.push(`https://lilkidsuave.github.io/asteroidsinthecosmos/servapps/${file}/screenshots/${screenshot}`);
      }
    }
    if (fs.existsSync(`./servapps/${file}/artefacts`)) {
      const artefacts = fs.readdirSync(`./servapps/${file}/artefacts`);
      for (const artefact of artefacts) {
        servapp.artefacts[artefact] = (`https://lilkidsuave.github.io/asteroidsinthecosmos/servapps/${file}/artefacts/${artefact}`);
      }
    }
    const primaryIconSource = `https://lilkidsuave.github.io/asteroidsinthecosmos/servapps/${file}/icon.png`;
    const alternativeIconSource = findAlternativeImage(`https://lilkidsuave.github.io/cosmos-casaos-store/servapps/app/logo/i/${file}`); // Find PNG files only in this path 
    const primaryComposeSource =  `https://lilkidsuave.github.io/asteroidsinthecosmos/servapps/${file}/docker-compose.yml`;
    const alternativeComposeSource =  `https://lilkidsuave.github.io/asteroidsinthecosmos/servapps/${file}/cosmos-compose.yml`; 
    servapp.icon = fs.existsSync(primaryIconSource) ? primaryIconSource : alternativeIconSource;
    servapp.compose = fs.existsSync(primaryComposeSource) ? primaryComposeSource : alternativeComposeSource; 
    servappsJSON.push(servapp)
    function findAlternativeImage(directory) {
      const files = fs.readdirSync(directory);
      const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));
      return pngFiles.length > 0 ? `${directory}/${pngFiles[0]}` : null;
}
  } catch (error) {
      if (error.message.includes('is not defined')) {
      console.error(`Error: servapp is not defined for ${file}. Skipping.`);
      continue;
    } else {
      console.error(`Unknown Error`, error.message);
      continue;
    }
  }
}

// add showcase
const _sc = ["Jellyfin", "Home Assistant", "Nextcloud"];
const showcases = servappsJSON.filter((app) => _sc.includes(app.name));

let apps = {
  "source": configFile.url,
  "showcase": showcases,
  "all": servappsJSON
}

fs.writeFileSync('./servapps.json', JSON.stringify(servappsJSON, null, 2))
fs.writeFileSync('./index.json', JSON.stringify(apps, null, 2))

for (const servapp of servappsJSON) {
  servapp.compose = `http://localhost:3000/servapps/${servapp.id}/docker-compose.yml`
  servapp.icon = `http://localhost:3000/servapps/${servapp.id}/icon.png`
  for (let i = 0; i < servapp.screenshots.length; i++) {
    servapp.screenshots[i] = servapp.screenshots[i].replace('https://lilkidsuave.github.io/asteroidsinthecosmos', 'http://localhost:3000')
  }
  for (const artefact in servapp.artefacts) {
    servapp.artefacts[artefact] = servapp.artefacts[artefact].replace('https://lilkidsuave.github.io/asteroidsinthecosmos', 'http://localhost:3000')
  }
}

fs.writeFileSync('./servapps_test.json', JSON.stringify(apps, null, 2))
