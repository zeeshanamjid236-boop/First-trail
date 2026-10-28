/* CHAMPIONS website
   1) For demo mode, leave SUPABASE_URL and SUPABASE_ANON_KEY empty.
   2) For shared online data, create a Supabase project and follow README.md.
   Never put a service_role key in this file.
*/
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
const db = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const initials = (name) => (String(name || "?").trim().charAt(0) || "?").toUpperCase();
const samplePosts = [
  {id:"sample1",name:"Amina",type:"Shout-out",content:"A little kindness can make someone's whole day. Keep smiling, champions! 💜",image_url:null,created_at:new Date(Date.now()-3600000).toISOString()},
  {id:"sample2",name:"Class Star",type:"Poetry",content:"Khushiyon ke rang sajao,\nDosti ke deep jalao ✨",image_url:null,created_at:new Date(Date.now()-7200000).toISOString()}
];
const sampleChat = [{id:"c1",name:"Class Star",message:"Welcome to our class space! Keep it positive 🌈",created_at:new Date().toISOString()}];
let selectedVote = "";
let localVotes = JSON.parse(sessionStorage.getItem("champions_votes") || "[]");
let localPosts = JSON.parse(localStorage.getItem("champions_posts") || "null") || samplePosts;
let localChat = JSON.parse(sessionStorage.getItem("champions_chat") || "null") || sampleChat;

function timeLabel(date) { try { return new Date(date).toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}); } catch { return ""; } }
function showStatus(id, message, error=false) { const el=$(id); el.textContent=message; el.style.color=error?"#fda4af":"#aaaac7"; }
function renderPosts(posts) {
  const host=$("postsList");
  if(!posts.length){host.innerHTML='<div class="empty-state">No posts yet. Be the first to share something kind ✨</div>';return;}
  host.innerHTML=posts.map(p=>`<article class="post-card"><div class="post-card-head"><div class="post-avatar">${escapeHTML(initials(p.name))}</div><div class="post-meta"><b>${escapeHTML(p.name)}</b><small>${escapeHTML(timeLabel(p.created_at))}</small></div><span class="post-type">${escapeHTML(p.type)}</span></div><p>${escapeHTML(p.content)}</p>${p.image_url && safeImageURL(p.image_url)?`<img src="${escapeHTML(p.image_url)}" alt="Shared by ${escapeHTML(p.name)}" loading="lazy" referrerpolicy="no-referrer">`:""}</article>`).join("");
}
function safeImageURL(value){try{const u=new URL(value);return u.protocol==="https:";}catch{return false;}}
function renderChat(messages) {
  const host=$("chatMessages");
  if(!messages.length){host.innerHTML='<div class="empty-state">No messages yet. Say hello 👋</div>';return;}
  host.innerHTML=messages.map(m=>`<div class="chat-message"><b>${escapeHTML(m.name)}</b><p>${escapeHTML(m.message)}</p><small>${escapeHTML(timeLabel(m.created_at))}</small></div>`).join("");
  host.scrollTop=host.scrollHeight;
}
function renderResults(votes) {
  const host=$("voteResults"); const choices=["The Funny One","The Helpful One","The Creative One"];
  const total=votes.length; host.classList.remove("hidden");
  host.innerHTML=choices.map(choice=>{const n=votes.filter(v=>v.option===choice).length;const pct=total?Math.round(n/total*100):0;return `<div class="result-row"><div class="result-label"><span>${escapeHTML(choice)}</span><b>${pct}% · ${n}</b></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;}).join("")+`<p class="status">${total} vote(s) counted. Demo votes are only stored in this browser.</p>`;
}
async function loadPosts(){
  if(!db){renderPosts(localPosts);return;}
  const {data,error}=await db.from("posts").select("id,name,type,content,image_url,created_at").order("created_at",{ascending:false}).limit(30);
  if(error){renderPosts(localPosts);showStatus("postStatus","Database could not load posts. Check setup and database policies.",true);return;}
  renderPosts(data||[]);
}
async function loadChat(){
  if(!db){renderChat(localChat);return;}
  const {data,error}=await db.from("chat_messages").select("id,name,message,created_at").order("created_at",{ascending:true}).limit(100);
  if(error){renderChat(localChat);showStatus("chatStatus","Database could not load chat. Check setup and database policies.",true);return;}
  renderChat(data||[]);
}
async function loadVotes(){
  if(!db){renderResults(localVotes);return;}
  const {data,error}=await db.from("votes").select("option");
  if(error){showStatus("voteStatus","Could not load shared vote results. Check database policies.",true);return;}
  renderResults(data||[]);
}
$("voteOptions").addEventListener("click",e=>{const b=e.target.closest("[data-option]");if(!b)return;selectedVote=b.dataset.option;document.querySelectorAll(".vote-option").forEach(x=>x.classList.toggle("selected",x===b));showStatus("voteStatus",`Selected: ${selectedVote}. Press Cast vote to submit.`);});
$("submitVote").addEventListener("click",async()=>{
  if(!selectedVote){showStatus("voteStatus","Please select an option first.",true);return;}
  const name=$("voterName").value.trim().slice(0,40);
  if(db){
    const {error}=await db.from("votes").insert({name:name||"Anonymous",option:selectedVote});
    if(error){showStatus("voteStatus","Vote was not saved. Check database setup or whether voting is enabled.",true);return;}
    showStatus("voteStatus","Your vote was submitted to the shared database.");
    await loadVotes();
  } else {
    localVotes.push({name:name||"Anonymous",option:selectedVote,created_at:new Date().toISOString()});
    sessionStorage.setItem("champions_votes",JSON.stringify(localVotes));
    showStatus("voteStatus","Vote saved in this browser only. Connect Supabase to share votes online.");
    renderResults(localVotes);
  }
});
$("postForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const post={name:$("postName").value.trim(),type:$("postType").value,content:$("postText").value.trim(),image_url:$("postImage").value.trim()||null};
  if(!post.name||!post.content){showStatus("postStatus","Please enter your name and message.",true);return;}
  if(post.image_url&&!safeImageURL(post.image_url)){showStatus("postStatus","Image link must be a valid HTTPS URL.",true);return;}
  if(db){
    const {error}=await db.from("posts").insert(post);
    if(error){showStatus("postStatus","Post was not saved. Check database setup or permissions.",true);return;}
    showStatus("postStatus","Your post is live for users who can access this website.");
    $("postForm").reset();await loadPosts();
  } else {
    localPosts.unshift({...post,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),created_at:new Date().toISOString()});
    localStorage.setItem("champions_posts",JSON.stringify(localPosts.slice(0,30)));
    renderPosts(localPosts);$("postForm").reset();
    showStatus("postStatus","Post saved in this browser only. Connect Supabase to share it online.");
  }
});
$("chatForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const name=$("chatName").value.trim(), message=$("chatText").value.trim();
  if(!name||!message)return;
  if(db){
    const {error}=await db.from("chat_messages").insert({name,message});
    if(error){showStatus("chatStatus","Message was not sent. Check database setup or permissions.",true);return;}
    $("chatText").value="";showStatus("chatStatus","Message sent to the shared chat.");await loadChat();
  } else {
    localChat.push({id:String(Date.now()),name,message,created_at:new Date().toISOString()});
    localChat=localChat.slice(-100);sessionStorage.setItem("champions_chat",JSON.stringify(localChat));
    $("chatText").value="";renderChat(localChat);showStatus("chatStatus","Demo message saved in this browser tab only.");
  }
});
$("refreshWall").addEventListener("click",loadPosts);
function setupMessage(){
  if(supabaseReady) return `<p><b>Database client:</b> configured.</p><p>Now verify that the SQL in <code>schema.sql</code> ran successfully in Supabase. If data fails to load, check table names, Row Level Security policies and browser Console.</p><p><b>Security note:</b> the public anon/publishable key may be used in a browser only when database RLS policies are correctly configured. Never use a service-role key here.</p>`;
  return `<p><b>Current status:</b> demo mode. The website design works, but posts/votes/messages are not shared online yet.</p><ol><li>Create a project at <b>supabase.com</b>.</li><li>Open SQL Editor and run the supplied <code>schema.sql</code>.</li><li>Copy the Project URL and anon/publishable key into the first two constants at the top of <code>script.js</code>.</li><li>Save, upload the files to GitHub and publish with GitHub Pages.</li></ol><p><b>Important:</b> this starter allows public community submissions. Use it only for a class space where that is appropriate. For private student data or restricted access, configure authenticated users and stricter policies before publishing.</p>`;
}
function openSetup(){ $("dialogTitle").textContent="Website setup status";$("dialogBody").innerHTML=setupMessage();$("infoDialog").showModal(); }
$("setupButton").addEventListener("click",openSetup);$("adminHint").addEventListener("click",openSetup);$("closeDialog").addEventListener("click",()=>$("infoDialog").close());
if(db){
  showStatus("voteStatus","Online database configured. Loading shared votes…");
  showStatus("postStatus","Loading shared posts…");showStatus("chatStatus","Loading shared chat…");
  loadVotes();loadPosts();loadChat();
  db.channel("champions-live-posts").on("postgres_changes",{event:"*",schema:"public",table:"posts"},loadPosts).subscribe();
  db.channel("champions-live-chat").on("postgres_changes",{event:"INSERT",schema:"public",table:"chat_messages"},loadChat).subscribe();
  db.channel("champions-live-votes").on("postgres_changes",{event:"INSERT",schema:"public",table:"votes"},loadVotes).subscribe();
}else{
  showStatus("voteStatus","Demo mode: votes are saved only in this browser session.");
  showStatus("postStatus","Demo mode: posts are saved only in this browser.");
  showStatus("chatStatus","Demo mode: messages are saved only in this browser tab.");
  renderPosts(localPosts);renderChat(localChat);renderResults(localVotes);
}