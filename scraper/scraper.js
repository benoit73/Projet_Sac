import * as cheerio from 'cheerio';
import axios from 'axios';


async function getDataPage(url) 
{
    try {
        // Étape 1 : Récupérer le HTML de la page
        const { data } = await axios.get(url);
    
        // Étape 2 : Charger le HTML avec Cheerio
        const $ = cheerio.load(data);
    
        // Étape 3 : Extraire les informations
        const title = $('.summary-max-lines-4 .web_ui__Text__title').text().trim();
        const condition = $('[data-testid="item-attributes-status"] .web_ui__Text__bold').text().trim();
        const brand = $('[itemprop="name"]').text().trim();
        const material = $('[data-testid="item-attributes-material"] .web_ui__Text__bold').text().trim();
        const color = $('[data-testid="item-attributes-color"] .web_ui__Text__bold').text().trim();
        const price = $('[data-testid="item-price"] .web_ui__Text__subtitle').text().trim();
        const description = $('[itemprop="description"] .web_ui__Text__format').text().trim();

        // Afficher les informations extraites
        console.log({
          title,
          condition,
          brand,
          material,
          color,
          price,
          description,
        });

      } catch (error) {
        console.error('Erreur lors de l\'extraction :', error.message);
      }
}

async function getAllArticles()
{
    const data = await axios.get('https://www.vinted.fr/member/217626666', {withCredentials: true})

    const cookie = data.headers['set-cookie'];
    const json = await axios.get('https://www.vinted.fr/api/v2/wardrobe/217626666/items?page=2&per_page=20&order=relevance', {withCredentials: true})
    console.log(json)
}
getAllArticles()