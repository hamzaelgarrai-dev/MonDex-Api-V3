import { searchCardsWithFilter , getCardsDetails, createCards , updateCard , deleteCard} from './services/api.js'
import { cards, allCards, hideLoading, initFormValidation, loadCardByType, showCardDetails, loadCards, loadType, showCards, showLoading, showMessage, hideMessage , checkFormValid, GlobalEventListner , debounce} from './ui.js';
import { getFavCards , saveToFav } from './storage.js';


const form = document.getElementById("creature-form");
const teamgrid = document.getElementById("team-grid");
const detailSection = document.getElementById("detail");
const cardContainer = document.getElementById("grid");
const searchField = document.getElementById("search");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// create new card


form.addEventListener('submit'  , async(e) =>{
    e.preventDefault();

    if(checkFormValid()){
        

        const newCard = {
        id: Number(document.querySelector('[name="id"]').value),
        name: document.querySelector('[name="name"]').value.trim(),
        type: document.querySelector('[name="type"]').value,
        race: "Custom",
        image: document.querySelector('[name="image"]').value.trim(),
        description: document.querySelector('[name="description"]').value.trim(),
        stats: {
            level: Number(document.querySelector('[name="level"]').value),
            attack: Number(document.querySelector('[name="stat1"]').value),
            defense: Number(document.querySelector('[name="stat2"]').value)
        }
    };

    try {

      if (editingCardId !== null) {

                await updateCard(editingCardId, newCard);

                editingCardId = null;

            } else {

                await createCards(newCard);

            }

            sessionStorage.removeItem("cards");

            const updatedCards = await getData();

            cards.length = 0;
            cards.push(...updatedCards);

            searchField.value = "";
            localStorage.setItem("selectedType", "All");

            showCards(cards);

            form.reset();

            idInput.disabled = false;
            const createCardBtn = document.getElementById("create-card")
            createCardBtn.textContent = "Create Card";
    } catch (error) {
      console.error(error);
    }

        
    }
    

})




// Search in api 


searchField.addEventListener("input", debounce(async () => {
    const searchValue = searchField.value.trim();
    const selectedType = localStorage.getItem("selectedType") || "All"
    hideMessage();
    showLoading();
    try {
      const results = await searchCardsWithFilter(selectedType, searchValue);

      cards.length = 0;
      cards.push(...results);
      showCards(results);
      if (results.length === 0) {
        showMessage("No cards found. Try another name.");
       
      }

      
    } catch (error) {
      console.log(error);

      if (error instanceof TypeError) {
        showMessage("Network error! Please check your internet connection.");
      } else {
        showMessage("Something went wrong. Please try again.");
      }
    } finally {
      hideLoading();
    }
  },400));






//Add to collection button

GlobalEventListner("click" , ".AddtoCollection" , e =>{
    
     const selectedCardID = e.target.parentElement.getAttribute("data-id")
     console.log(selectedCardID)

    const cardCount = document.getElementById("team-count");
     const alreadyAdded = teamgrid.querySelector(`[data-id="${selectedCardID}"]`);

     if (alreadyAdded) { 
        alert("card already exist in collection")
        return;
     }
    cards.forEach((card)=>{
                if(card.id == selectedCardID && teamgrid.children.length <= 6 ){
                    
                    
                    teamgrid.innerHTML += `<div class="team-card relative" data-id="${selectedCardID}">
                      <button type="button" aria-label="Remove card"
                     class="closeBtn absolute btn-outline bg-white/60 w-9 h-9 px-0 z-50 right-4 top-2">✕</button>

                     <img class="relative h-56 w-full object-contain"
                    src="${card.image}" alt="${card.name}">
                     </div>`
                     
                     cardCount.textContent = teamgrid.children.length
                }

                if (teamgrid.children.length >= 6) {
                   document.querySelectorAll(".AddtoCollection").forEach((btn) => {
                   btn.disabled = true;
                   btn.classList.add("opacity-40", "cursor-not-allowed");
                   btn.textContent = "Collection is Full"
                 });
                }


})
},[cardContainer , detailSection ])

//remove from team button

GlobalEventListner("click", ".closeBtn", (e) => {
  
  const CollectionCard = e.target.closest(".team-card");

  console.log("clicked")

  if (CollectionCard) {
    CollectionCard.remove();
  }

  if (teamgrid.children.length < 6) {
    document.querySelectorAll(".AddtoCollection").forEach((btn) => {
        btn.textContent = "Add to my Collections"
      btn.disabled = false;
      btn.classList.remove("opacity-40", "cursor-not-allowed");
    });
  }
},[teamgrid]);


//load more button


loadMoreBtn.addEventListener("click", async () => {
    await loadCards();
    showCards(cards);
});


// handle favorites

const toggleFavorite = (id) => {
    let favorites = getFavCards("favorites");

    if (favorites.includes(String(id))) {
        favorites = favorites.filter(favId => favId !== String(id));
    } else {
        favorites.push(String(id));
    }

    saveToFav("favorites", favorites);

    showCards(cards);
};

GlobalEventListner("click", ".favorite-btn", (e) => {

    const id = e.target.dataset.id;

    console.log("Card ID:", id);

    toggleFavorite(id);
});


// handle sorting

document.querySelectorAll("[data-sort]").forEach(btn =>{
  btn.addEventListener("click", async ()=>{
    const sort = btn.dataset.sort;
    const order = btn.dataset.order;

const selectedType = localStorage.getItem("selectedType") || "All";
  const searchValue = searchField.value.trim();
  hideMessage();
  showLoading()
  try {
      const results = await searchCardsWithFilter(selectedType, searchValue , sort, order);

      cards.length = 0;
      cards.push(...results);
      showCards(results);
      if (results.length === 0) {
        showMessage("No cards found. Try another name.");
       
      }

      
    } catch (error) {
      console.log(error);

      if (error instanceof TypeError) {
        showMessage("Network error! Please check your internet connection.");
      } else {
        showMessage("Something went wrong. Please try again.");
      }
    } finally {
      hideLoading();
    }

  })})
  


// handle cards click to display details

cardContainer.addEventListener("click" , async(e)=>{

  const article = e.target.closest(".article");

  if(!article){
    return;
  }
  if(e.target.closest(".AddtoCollection")){
    return;
  }
  if(e.target.closest(".favorite-btn")){
    return;
  }

  const id = article.dataset.id;

  detailSection.innerHTML = `<div id="loader" class="flex justify-center items-center py-10 w-full h-full ">
          <div class="w-8 h-8 border-4 border-gray-300 border-t-brand rounded-full animate-spin">
            
          </div>
      </div>`

      try{

      const card = await getCardsDetails(id);

      if(!card){
        detailSection.innerHTML = `<p>No details for this card</p>`
      }

      showCardDetails(card , detailSection);

      }
      catch(error){

        console.log(error);

        detailSection.innerHTML = `<p>something went wrong</p>`

      }
   



})


// handle card editing 

let editingCardId = null;


detailSection.addEventListener("click", (e) => {

  const idInput = document.querySelector('[name="id"]');
  const nameInput = document.querySelector('[name="name"]');
  const typeInput = document.querySelector('[name="type"]');
  const levelInput = document.querySelector('[name="level"]');
  const stat1Input = document.querySelector('[name="stat1"]');
  const stat2Input = document.querySelector('[name="stat2"]');
  const imageInput = document.querySelector('[name="image"]');
  const descriptionInput = document.querySelector('[name="description"]');

    const editBtn = e.target.closest(".editCard");

    if (!editBtn) return;

    const id = editBtn.dataset.id;

    const card = cards.find(card => String(card.id) === id);

    if (!card) return;

    editingCardId = card.id;

    // Fill the form with existing values
    idInput.value = `#${card.id}`;
    nameInput.value = card.name;
    typeInput.value = card.type;
    levelInput.value = card.stats?.level ?? "";
    stat1Input.value = card.stats?.attack ?? "";
    stat2Input.value = card.stats?.defense ?? "";
    imageInput.value = card.image;
    descriptionInput.value = card.description;

    // Change button text
    const createCardBtn = document.getElementById("create-card")
    createCardBtn.textContent = "Update Card";

    form.scrollIntoView({ behavior: "smooth" });
});



// handle deleting a card

detailSection.addEventListener("click", async (e) => {

    const deleteBtn = e.target.closest(".deleteCard");

    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;

    const confirmed = confirm("Are you sure you want to delete this card?");

    if (!confirmed) return;

    try {
        await deleteCard(id);

        const index = cards.findIndex(card => String(card.id) === id);

        if (index !== -1) {
            cards.splice(index, 1);
        }

        sessionStorage.removeItem("cards");

        showCards(cards);

    } catch (error) {
        console.error(error);
        alert("Error while deleting the card.");
    }
});

const main = async () => {

 showLoading();

    try {

        await loadCards();
        let customCards = JSON.parse(localStorage.getItem("customCards")) || [];

       if (customCards) {
         cards.push(...customCards);
         allCards.push(...customCards);
       }

        initFormValidation()
        allCards.push(cards)
        showCards(cards);
        loadType();
        loadCardByType();
        

    } catch (error) {
        console.log(error);

        if (error instanceof TypeError) {
            showMessage("Network error! Please check your internet connection.");
        } else {
            showMessage("Something went wrong. Please try again.");
        }

    } finally {
        hideLoading();
    }


  

  
};

main();