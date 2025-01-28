import * as cheerio from 'cheerio';
import axios from 'axios';

async function main(userId = '217626666')
{
  const headers = await getCookie(userId)
  const articlesUrl = await getAllArticlesUrl(userId, headers)

  let articlesData = []
  let articlesInError = [];

  for (const articleUrl of articlesUrl) 
  {
    const data = await getDataArticle(articleUrl);

    if (data.error) 
    {  
      articlesInError.push(data); 
    } 
    else 
    {
      articlesData.push(data); 
    }
  }
  console.log(articlesData)
  console.log(articlesData.length)
  console.log(articlesInError)
}

async function getCookie(userId)
{
    const data = await axios.get(`https://www.vinted.fr/member/${userId}`)
    const cookies = data.headers['set-cookie'];
    const accessToken = cookies.find(cookie => cookie.startsWith('access_token_web=')).split('=')[1].split(';')[0];
    const headers = {
      'Cookie': `access_token_web=${accessToken}`,
    };

    return headers;
}


async function getAllArticlesUrl(userId, headers)
{
  const json = await axios.get(`https://www.vinted.fr/api/v2/wardrobe/${userId}/items?page=1&per_page=10000&order=relevance`, {headers});
/*   console.log(json.data.items);
 */
  let itemsUrl = [];
  json.data.items.forEach(item => {
    itemsUrl.push(item.url)
  });

  return itemsUrl
}

async function getDataArticle(url) {
  try {
      let retries = 30;  // Nombre de tentatives en cas d'échec
      let response;
      
      // Essayer plusieurs fois en cas d'erreur HTTP
      while (retries > 0) 
      {
          try {
              response = await axios.get(url);

              // Si la réponse est valide (200 OK), on sort de la boucle
              if (response.status === 200) {
                  break;
              } else {
                  retries--;
              }
          } catch (error) {
              retries--;
          }
      }

      // Si on a épuisé toutes les tentatives, on retourne une erreur
      if (retries === 0) {
          return { url: url, error: 'Échec après plusieurs tentatives' };
      }

      const data = response.data;
      const $ = cheerio.load(data);

      const title = $('.summary-max-lines-4 .web_ui__Text__title').text().trim();
      const condition = $('[data-testid="item-attributes-status"] .web_ui__Text__bold').text().trim();
      const brand = $('[itemprop="name"]').text().trim();
      const material = $('[data-testid="item-attributes-material"] .web_ui__Text__bold').text().trim();
      const color = $('[data-testid="item-attributes-color"] .web_ui__Text__bold').text().trim();
      const price = $('[data-testid="item-price"] .web_ui__Text__subtitle').text().trim();
      const description = $('[itemprop="description"] .web_ui__Text__format').text().trim();

      const article = {
          title: title,
          condition: condition,
          brand: brand,
          material: material,
          color: color,
          price: price,
          description: description,
          url: url
      };

      return article;

  } catch (error) {
      return { url: url, error: error.message };
  }
}

main()

