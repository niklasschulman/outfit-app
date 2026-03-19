let showFavoritesOnly = false
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
  
outfits.forEach(o=>{
  o.items = getItems(o.id)
})
applyFilters()
renderOutfits(outfits)
renderClothes()
showDetail(outfit)

}
function updateFavButton(){

const btn = document.getElementById("favBtn")
  btn.classList.toggle("active", showFavoritesOnly)

if(showFavoritesOnly){
btn.style.background = "#ffd700"
}else{
btn.style.background = ""
}

}
function getRecommendation(){

const occ=occasionFilter.value
const season=seasonFilter.value

let candidates=[...outfits]

// filtrera på tillfälle
if(occ){
candidates=candidates.filter(o=>o.occasion.includes(occ))
}

// filtrera på säsong
if(season){
candidates=candidates.filter(o=>o.season.includes(season))
}

// fallback om inget hittas
if(candidates.length===0){
candidates=[...outfits]
}

// slumpa från relevanta
return candidates[Math.floor(Math.random()*candidates.length)]

}

document.getElementById("recommendBtn").onclick=()=>{

const r=getRecommendation()

showDetail(r)

}

function showStats(){

const stats={}

outfitItems.forEach(i=>{

const item=clothes.find(c=>c.id===i.clothing_id)

stats[item.name]=(stats[item.name]||0)+1

})

let html="<h2>Mest använda plagg</h2>"

Object.entries(stats)
.sort((a,b)=>b[1]-a[1])
.slice(0,8)
.forEach(s=>{
html+=`${s[0]} – ${s[1]} outfits<br>`
})

document.getElementById("detailContent").innerHTML=html

switchView("detailView")

}

function getItems(outfitId){

const links=outfitItems.filter(x=>x.outfit_id===outfitId)

return links.map(l=>{
const item=clothes.find(c=>c.id===l.clothing_id)
return item ? item.name : ""
})

}

function renderOutfits(list){
grid.innerHTML=""

  list = [...list].sort((a, b)=>{
  const aFav = favorites.includes(a.id)
  const bFav = favorites.includes(b.id)
  if(aFav==bFav) return 0
  return aFav ? -1 : 1
})

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
<img src="${outfit.image}" class="zoomable">

<h2>
${outfit.name}
<span id="detailFav" style="margin-left:10px; cursor:pointer;">
${favorites.includes(outfit.id) ? "⭐" : "☆"}
</span>
</h2>

<div class="itemsList">

&nbsp;${items.join("<br>&nbsp;")}

</div>

<p>
&nbsp;Säsong: ${outfit.season.join(", ")}
</p>

<p>
&nbsp;Tillfälle: ${outfit.occasion.join(", ")}
</p>`
document.getElementById("detailFav").onclick = ()=>{

if(favorites.includes(outfit.id)){
favorites = favorites.filter(x=>x!==outfit.id)
}else{
favorites.push(outfit.id)
}

localStorage.setItem("favorites", JSON.stringify(favorites))

// uppdatera ikon direkt
showDetail(outfit)

}

switchView("detailView")

}

function renderClothes(){

const list=document.getElementById("clothesList")

list.innerHTML=""

clothes.forEach(c=>{

const div=document.createElement("div")

div.innerHTML=`

&nbsp;<b>${c.name}</b>

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
if(showFavoritesOnly){
filtered = filtered.filter(o=>favorites.includes(o.id))
}
const term=searchInput.value.toLowerCase()

if(term){


filtered=filtered.filter(o=>{
const items=o.items.join(" ").toLowerCase()
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
  
const rIndex=Math.floor(Math.random()*cards.length)
cards[rIndex].click()
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


document.getElementById("statsBtn").onclick = showStats
outfits.forEach(o=>{
o.items=getItems(o.id)
})

document.getElementById("weatherBtn").onclick=async()=>{

const pos=await new Promise(resolve=>{
navigator.geolocation.getCurrentPosition(resolve)
})

const lat=pos.coords.latitude
const lon=pos.coords.longitude

const r=await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
)

const data=await r.json()
const temp=data.current_weather.temperature

let season="sommar"

if(temp<5) season="vinter"
else if(temp<12) season="höst"
else if(temp<20) season="vår"

const filtered=outfits.filter(o=>o.season.includes(season))

const random=filtered[Math.floor(Math.random()*filtered.length)]

showDetail(random)

}

document.getElementById("favBtn").onclick=()=>{
showFavoritesOnly = !showFavoritesOnly
if(showFavoritesOnly){
const filtered = outfits.filter(o=>favorites.includes(o.id))
renderOutfits(filtered)
}else{
applyFilters() // tillbaka till normalt läge
}
updateFavButton()

}
loadData()

outfits.forEach(o=>{
o.items=getItems(o.id)
})

