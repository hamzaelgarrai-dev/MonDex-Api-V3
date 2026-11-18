// =============================================================
// data.js — les créatures de VOTRE univers
// =============================================================
// TODO : remplissez ce tableau avec au moins 12 créatures
// (Pokémon, Digimon ou Yu-Gi-Oh!), en respectant ce format :
//
// {
//   id: "#001",                                   // "#" suivi de 3 chiffres
//   name: "Exemple",                              // texte
//   type: "Feu",                                  // une valeur d'une liste fixe
//   level: "Base",                                // texte
//   stats: { hp: 45, attack: 49, defence: 49 },   // 3 nombres de 0 à 999
//   image: "https://example.com/001.png",         // lien https vers une image
//   description: "Une courte description."        // 10 à 200 caractères
// }
//
// Pensez à citer la source de vos images dans le README.

export const getData = async () => {

    // const cacheKey = `cards_${offset}`;

    
    // const cachedCards = sessionStorage.getItem(cacheKey);

    // if (cachedCards) {
    //     console.log("Cards loaded from cache");
    //     return JSON.parse(cachedCards);
    // }

  
    const response = await fetch(
        'http://localhost:3000/cards'
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cards");
    }

    const data = await response.json();

    // sessionStorage.setItem(cacheKey, JSON.stringify(data.data));

    return data;
};

// filtre from api

export const getFilterData = async (type) => {

    const response = await fetch(
        `http://localhost:3000/cards?type=${type}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch the selected type");
    }

    const data = await response.json();

    return data;
};


// search in the api function

export const searchCardsWithFilter = async (type , search) =>{

    const params = new URLSearchParams();

    if(type && type !== "All"){
        params.append("type" , type)
    }
    
    if(search.trim()){
        params.append("q" , search.trim())
    }

  const res = await fetch(`http://localhost:3000/cards?${params}`)

  
  if (!res.ok) {
      throw new Error("API search request failed");
    }
    
    return await res.json();

}

// 