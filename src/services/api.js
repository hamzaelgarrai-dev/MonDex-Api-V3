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

    const cacheKey = "cards";

    
    const cachedCards = sessionStorage.getItem(cacheKey);

    if (cachedCards) {
        console.log("Cards loaded from cache");
        return JSON.parse(cachedCards);
    }

  
    const response = await fetch(
        'http://localhost:3000/cards'
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cards");
    }

    const data = await response.json();
    sessionStorage.setItem(cacheKey, JSON.stringify(data));

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

    

    return await response.json();
};


// search in the api function

export const searchCardsWithFilter = async (type , search, sort, order) =>{

    const params = new URLSearchParams();

    if(type && type !== "All"){
        params.append("type" , type)
    }
    
    if(search.trim()){
        params.append("name_like" , search.trim())
    }

    if(sort){
        params.append("_sort" , sort);
        params.append("_order" , order);
    }

  const res = await fetch(`http://localhost:3000/cards?${params.toString()}`)

  
  if (!res.ok) {
      throw new Error("API search request failed");
    }
    
    return await res.json();

}

// get cards details 

export const getCardsDetails = async (id) =>{

    const response = await fetch(
        `http://localhost:3000/cards/${id}`
    );

    if(response.status === 400){
        return null;    
    }

    if (!response.ok) {
        throw new Error("Failed to fetch the cards details");
    }

    return await response.json();


}

// create resource (cards) into api


export const createCards = async (card) =>{
    const response = await fetch(`http://localhost:3000/cards` , {
        method : "POST",
        headers : {'Content-Type' : 'application/json'},
        body : JSON.stringify(card)
    });

    if(!response.ok){
        throw new Error("error while creating the card")
    }

    return await response.json();


}