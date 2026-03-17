let favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
let clothes=[]
let outfits=[]
let outfitItems=[]

const grid=document.getElementById("outfitsGrid")

const searchInput=document.getElementById("searchInput")
const occasionFilter=document.getElementById("occasionFilter")
const seasonFilter=document.getElementById("seasonFilter")

async function loadData(){

const c=await fetch("data/clothes.json")
clothes=await c.json()

const o=await fetch("data/outfits.json")
outfits=await o.json()

const oi=await fetch("data/outfit_items.json")
outfitItems=await oi.json()

renderOutfits(outfits)
renderClothes()

}

function getItems(outfitId){

const links=outfitItems.filter(x=>x.outfit_id===outfitId)

return links.map(l=>{
const item=clothes.find(c=>c.id===l.clothing_id)
return item.name
})

}

function renderOutfits(list){

grid.innerHTML=""

document.getElementById("resultCount").innerText =
list.length + " outfits"
  
list.forEach(o=>{

const div=document.createElement("div")

div.className="card"

div.innerHTML=`

<div class="favorite">
${favorites.includes(o.id) ? "⭐" : "☆"}
</div>

<img src="${o.image}">

<div class="cardTitle">
${o.name}
</div>
`
div.querySelector(".favorite").onclick=(e)=>{
e.stopPropagation()
if(favorites.includes(o.id)){
favorites=favorites.filter(x=>x!==o.id)
}else{
favorites.push(o.id)
}
localStorage.setItem("favorites",JSON.stringify(favorites))
renderOutfits(outfits)
}
  

div.onclick=()=>showDetail(o)

grid.appendChild(div)

})

}

function showDetail(outfit){

const detail=document.getElementById("detailContent")

const items=getItems(outfit.id)

detail.innerHTML=`

<img src="${outfit.image}">

<h2>${outfit.name}</h2>

<div class="itemsList">

${items.join("<br>")}

</div>

<p>
Säsong: ${outfit.season.join(", ")}
</p>

<p>
Tillfälle: ${outfit.occasion.join(", ")}
</p>

`

switchView("detailView")

}

function renderClothes(){

const list=document.getElementById("clothesList")

list.innerHTML=""

clothes.forEach(c=>{

const div=document.createElement("div")

div.innerHTML=`

<b>${c.name}</b>

`

div.onclick=()=>showOutfitsForClothing(c.id)

list.appendChild(div)

})

}

function showOutfitsForClothing(id){

const outfitIds=outfitItems
.filter(o=>o.clothing_id===id)
.map(o=>o.outfit_id)

const filtered=outfits.filter(o=>outfitIds.includes(o.id))

renderOutfits(filtered)

switchView("outfitsView")

}

function applyFilters(){

let filtered=[...outfits]

const term=searchInput.value.toLowerCase()

if(term){


filtered=filtered.filter(o=>{

const items=getItems(o.id).join(" ").toLowerCase()
const name=o.name.toLowerCase()
const season=o.season.join(" ").toLowerCase()
const occasion=o.occasion.join(" ").toLowerCase()

return (
items.includes(term) ||
name.includes(term) ||
season.includes(term) ||
occasion.includes(term)
)

})

}

const occ=occasionFilter.value
if(occ){

filtered=filtered.filter(o=>o.occasion.includes(occ))

}

const season=seasonFilter.value
if(season){

filtered=filtered.filter(o=>o.season.includes(season))

}

renderOutfits(filtered)

}

searchInput.addEventListener("input",applyFilters)
occasionFilter.addEventListener("change",applyFilters)
seasonFilter.addEventListener("change",applyFilters)

document.getElementById("randomBtn").onclick=()=>{

applyFilters()

const cards=document.querySelectorAll(".card")

if(cards.length){

const r=Math.floor(Math.random()*cards.length)

cards[r].click()

}
  
renderOutfits([r])

}

function switchView(view){

document.querySelectorAll("main section")
.forEach(s=>s.classList.add("hidden"))

document.getElementById(view)
.classList.remove("hidden")

}

document.querySelectorAll(".bottomNav button")
.forEach(btn=>{

btn.onclick=()=>{

switchView(btn.dataset.view)

}

})

document.getElementById("backBtn").onclick=()=>{

switchView("outfitsView")

}

document.querySelectorAll(".quickFilters button")
.forEach(btn=>{

btn.onclick=()=>{

searchInput.value=btn.dataset.term
applyFilters()

}

})



loadData()





