let key;

// ===== KEY =====
async function getKey(password){
const enc=new TextEncoder();
const baseKey=await crypto.subtle.importKey("raw",enc.encode(password),{name:"PBKDF2"},false,["deriveKey"]);

return crypto.subtle.deriveKey(
{name:"PBKDF2",salt:enc.encode("salt"),iterations:100000,hash:"SHA-256"},
baseKey,
{name:"AES-GCM",length:256},
false,
["encrypt","decrypt"]
);
}

// ===== LOGIN =====
async function login(){
let pass=document.getElementById("master").value;
key=await getKey(pass);

sessionStorage.setItem("logged","1");

document.getElementById("login").style.display="none";
document.getElementById("app").style.display="block";

load();
showToast("تم تسجيل الدخول");
}

// ===== GENERATE =====
function generatePassword(){
let chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
let p="";
for(let i=0;i<12;i++)p+=chars[Math.floor(Math.random()*chars.length)];
document.getElementById("password").value=p;
}

// ===== ENCRYPT =====
async function encrypt(text){
let enc=new TextEncoder();
let iv=crypto.getRandomValues(new Uint8Array(12));

let data=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(text));

return {data:Array.from(new Uint8Array(data)),iv:Array.from(iv)};
}

// ===== DECRYPT =====
async function decrypt(obj){
let dec=new TextDecoder();
let data=await crypto.subtle.decrypt(
{name:"AES-GCM",iv:new Uint8Array(obj.iv)},
key,
new Uint8Array(obj.data)
);
return dec.decode(data);
}

// ===== SAVE =====
async function save(){
let site=document.getElementById("site").value;
let username=document.getElementById("username").value;
let password=document.getElementById("password").value;

let arr=JSON.parse(localStorage.getItem("db"))||[];

arr.push({
site,
username,
password:await encrypt(password)
});

localStorage.setItem("db",JSON.stringify(arr));
load();
showToast("تم الحفظ");
}

// ===== LOAD =====
async function load(){
let list=document.getElementById("list");
list.innerHTML="";

let arr=JSON.parse(localStorage.getItem("db"))||[];

for(let i=0;i<arr.length;i++){
let pass=await decrypt(arr[i].password);

list.innerHTML+=`
<div class="card">
<b>${arr[i].site}</b><br>
👤 ${arr[i].username}<br>
🔑 <span id="p${i}">******</span><br>

<button class="small-btn" onclick="toggle(${i},'${pass}')">👁️</button>
<button class="small-btn" onclick="copyText('${pass}')">📋</button>
</div>
`;
}
}

// ===== TOGGLE =====
function toggle(i,p){
let el=document.getElementById("p"+i);
el.innerText=el.innerText==="******"?p:"******";
}

// ===== COPY =====
function copyText(t){
navigator.clipboard.writeText(t);
showToast("تم النسخ");
}

// ===== SEARCH =====
function searchData(){
let v=document.getElementById("search").value.toLowerCase();
document.querySelectorAll(".card").forEach(c=>{
c.style.display=c.innerText.toLowerCase().includes(v)?"block":"none";
});
}

// ===== THEME =====
function toggleTheme(){
document.body.classList.toggle("light");
localStorage.setItem("theme",document.body.classList.contains("light")?"light":"dark");
}

window.onload=()=>{
if(localStorage.getItem("theme")==="light")document.body.classList.add("light");
};

// ===== LOGOUT =====
function logout(){
sessionStorage.clear();
location.reload();
}

// ===== TOAST =====
function showToast(msg){
let t=document.getElementById("toast");
t.innerText=msg;
t.style.display="block";
setTimeout(()=>t.style.display="none",2000);
}
