import{n as e,t}from"./FindablesRepository-B3-2PKNv.js";function n(e){return Math.round(e*100)/100}var r=class{#e=null;#t=[];get sceneIndex(){return this.#e}get points(){return this.#t}get isValid(){return this.#t.length>=3}addPoint(e,t,r){if(this.#e===null)this.#e=e;else if(e!==this.#e)return!1;return this.#t.push([n(t),n(r)]),!0}undoLastPoint(){this.#t.pop(),this.#t.length===0&&(this.#e=null)}reset(){this.#e=null,this.#t=[]}},i=class{#e;#t;#n;#r;#i;#a;#o;constructor(e,{onUndo:t,onCancel:n,onSave:r,onExport:i,onDelete:a}){this.#o=a,this.#e=document.createElement(`div`),this.#e.className=`authoring-panel`,this.#e.innerHTML=`
      <h1>Zoekboek — objecten tekenen</h1>
      <p class="authoring-panel__help">
        Klik punten op de afbeelding om een vorm rond een object te tekenen
        (minimaal 3 punten). Slepen blijft pannen tussen de platen.
      </p>

      <div class="authoring-panel__status" data-role="status"></div>

      <div class="authoring-panel__field">
        <label for="findable-label">Naam</label>
        <input id="findable-label" type="text" placeholder="Rode scooter" />
      </div>
      <div class="authoring-panel__field">
        <label for="findable-clue">Zoek-tekst</label>
        <textarea id="findable-clue" rows="2" placeholder="Zoek de man op de rode scooter"></textarea>
      </div>

      <div class="authoring-panel__actions">
        <button type="button" data-action="undo">Punt ongedaan maken</button>
        <button type="button" data-action="cancel">Vorm annuleren</button>
        <button type="button" data-action="save" class="authoring-panel__save">Object opslaan</button>
      </div>

      <h2>Objecten</h2>
      <ul class="authoring-panel__list" data-role="list"></ul>

      <button type="button" data-action="export" class="authoring-panel__export">Exporteer findables.json</button>
    `,e.appendChild(this.#e),this.#t=this.#e.querySelector(`#findable-label`),this.#n=this.#e.querySelector(`#findable-clue`),this.#r=this.#e.querySelector(`[data-role="status"]`),this.#i=this.#e.querySelector(`[data-role="list"]`),this.#a=this.#e.querySelector(`[data-action="save"]`),this.#e.querySelector(`[data-action="undo"]`).addEventListener(`click`,t),this.#e.querySelector(`[data-action="cancel"]`).addEventListener(`click`,n),this.#e.querySelector(`[data-action="export"]`).addEventListener(`click`,i),this.#a.addEventListener(`click`,()=>{r(this.#t.value.trim(),this.#n.value.trim())})}setStatus(e){this.#r.textContent=e}setSaveEnabled(e){this.#a.disabled=!e}clearForm(){this.#t.value=``,this.#n.value=``}renderList(e){this.#i.innerHTML=``,e.forEach(({sceneIndex:e,findable:t})=>{let n=document.createElement(`li`);n.className=`authoring-panel__list-item`;let r=document.createElement(`span`);r.textContent=`Plaat ${e+1} — ${t.label}`;let i=document.createElement(`button`);i.type=`button`,i.textContent=`Verwijderen`,i.addEventListener(`click`,()=>this.#o(e,t.id)),n.append(r,i),this.#i.appendChild(n)})}};function a(e,t){let n=new Blob([t],{type:`application/json`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=e,i.click(),URL.revokeObjectURL(r)}function o(e){return e.toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/(^-|-$)/g,``)||`object`}new class{#e;#t;#n;#r;#i=new r;#a=0;constructor(e){this.#e=e}async init(){let n=document.createElement(`div`);n.className=`authoring-layout`,this.#e.appendChild(n);let r=document.createElement(`div`);r.className=`authoring-gallery`,n.appendChild(r);let o=document.createElement(`div`);n.appendChild(o),this.#t=new e(r,{onClick:e=>this.#o(e)}),this.#r=await t.load(),this.#t.strip.slots.forEach((e,t)=>{let n=this.#t.strip.getOverlay(t);n.setEditable(!0),n.setPolygons(this.#r.getScene(t))}),this.#n=new i(o,{onUndo:()=>this.#s(),onCancel:()=>this.#c(),onSave:(e,t)=>this.#l(e,t),onExport:()=>a(`findables.json`,this.#r.toJSON()),onDelete:(e,t)=>this.#u(e,t)}),this.#f(),this.#d(),await this.#t.eagerLoadFirstScenes()}#o(e){let{sceneIndex:t,x:n,y:r}=this.#t.coordinateMapper.fromPointerEvent(e);if(!this.#i.addPoint(t,n,r)){this.#n.setStatus(`Blijf op dezelfde plaat om deze vorm af te maken (of annuleer eerst).`);return}this.#t.strip.getOverlay(t).setDraft(this.#i.points),this.#d()}#s(){let e=this.#i.sceneIndex;if(e===null)return;this.#i.undoLastPoint();let t=this.#t.strip.getOverlay(e);this.#i.points.length===0?t.clearDraft():t.setDraft(this.#i.points),this.#d()}#c(){let e=this.#i.sceneIndex;e!==null&&this.#t.strip.getOverlay(e).clearDraft(),this.#i.reset(),this.#d()}#l(e,t){if(!this.#i.isValid){this.#n.setStatus(`Teken minstens 3 punten voor je opslaat.`);return}if(!e){this.#n.setStatus(`Geef het object een naam voor je opslaat.`);return}let n=this.#i.sceneIndex;this.#a+=1;let r={id:`scene${n}-${o(e)}-${this.#a}`,label:e,clue:t||`Zoek: ${e}`,polygon:this.#i.points};this.#r.add(n,r),this.#t.strip.getOverlay(n).setPolygons(this.#r.getScene(n)),this.#i.reset(),this.#n.clearForm(),this.#f(),this.#d()}#u(e,t){this.#r.remove(e,t),this.#t.strip.getOverlay(e).setPolygons(this.#r.getScene(e)),this.#f()}#d(){let e=this.#i.points.length;if(e===0)this.#n.setStatus(`Klik op de afbeelding om een nieuwe vorm te starten.`);else{let t=`${e} punt${e===1?``:`en`}`,n=e<3?` (minimaal 3 nodig)`:``;this.#n.setStatus(`Plaat ${this.#i.sceneIndex+1} — ${t} geplaatst${n}.`)}this.#n.setSaveEnabled(this.#i.isValid)}#f(){let e=this.#r.all.flatMap((e,t)=>e.map(e=>({sceneIndex:t,findable:e})));this.#n.renderList(e)}}(document.querySelector(`#app`)).init();