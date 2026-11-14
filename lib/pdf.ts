import {jsPDF} from 'jspdf';
import {points,checks,cleaning,vacuum,type Reading} from './config';

type ExportDay={id:string;day:string;status:string;responsible_user_id:string;review_note:string|null};
type Audit={actor_id:string|null;created_at:string;details:unknown};
const safe=(v:unknown)=>v===null||v===undefined||v===''?'–':String(v);
const key=(round:string,id:string)=>`${round}|${id}`;
const displayDate=(date:string)=>date.split('-').reverse().join('.');

export function downloadDayPdf(day:ExportDay,readings:Record<string,Reading>,data:Record<string,any>,hotelName:string,audit:Audit[]=[]){
 if(day.status!=='approved')throw new Error('PDF-Export ist nur für freigegebene Tage verfügbar.');
 const doc=new jsPDF({unit:'mm',format:'a4'});
 const margin=14, width=182, bottom=278;
 let y=17,page=1;
 const foot=()=>{doc.setFontSize(8);doc.setTextColor(100);doc.text(`PoolLog · Test-/Entwicklungsstand · Seite ${page}`,margin,290);doc.setTextColor(25)};
 const newPage=()=>{foot();doc.addPage();page++;y=18};
 const ensure=(h:number)=>{if(y+h>bottom)newPage()};
 const line=(label:string,value:unknown)=>{const txt=`${label}: ${safe(value)}`;doc.setFont('helvetica','normal');doc.setFontSize(9);const lines=doc.splitTextToSize(txt,width);ensure(lines.length*4.6+2);doc.text(lines,margin,y);y+=lines.length*4.6+2};
 const section=(title:string)=>{ensure(13);y+=4;doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(title,margin,y);y+=7;doc.setFont('helvetica','normal')};
 const headers=['Bereich','dinotec Cl','Redox','dinotec pH','Photo Cl','Ges. Cl','Photo pH','Temp.'];
 const cols=[43,20,20,20,20,20,20,19];
 const row=(cells:string[],header=false)=>{
   const h=8;ensure(h);
   let x=margin;
   if(header){doc.setFillColor(232,241,248);doc.rect(margin,y-5.5,width,h,'F')}
   doc.setFontSize(header?7.7:7.2);doc.setFont('helvetica',header?'bold':'normal');
   cells.forEach((c,i)=>{const max=cols[i]-2;const text=doc.splitTextToSize(c,max)[0]||'';doc.text(text,x+1,y);x+=cols[i]});
   doc.setDrawColor(220);doc.line(margin,y+2.5,margin+width,y+2.5);y+=h;
 };
 doc.setTextColor(25,55,77);doc.setFont('helvetica','bold');doc.setFontSize(19);doc.text('PoolLog – Betriebstagebuch',margin,y);y+=10;
 doc.setTextColor(25);doc.setFont('helvetica','normal');doc.setFontSize(10);
 line('Hotel',hotelName);line('Betriebstag',displayDate(day.day));line('Status','Freigegeben');line('Verantwortliche Benutzer-ID',day.responsible_user_id);line('Protokoll-ID',day.id);
 line('Exportiert am',new Date().toLocaleString('de-DE'));
 section('Messwerte – Morgenrunde und Abendrunde');
 line('Hinweis','dinotec-Werte wurden manuell abgelesen; Photometerwerte stammen aus separaten Wasserproben.');
 for(const round of ['Morgen','Abend']){
  section(`${round}runde`);row(headers,true);
  for(const p of points){const v=readings[key(round,p.id)];row([p.name,v?.auto_cl??'',v?.auto_redox??'',v?.auto_ph??'',v?.manual_cl??'',v?.manual_total_cl??'',v?.manual_ph??'',v?.temperature??''].map(safe));}
  line('Einheiten','Chlor: mg/l · Redox: mV · Temperatur: °C');
  for(const p of points){const note=readings[key(round,p.id)]?.note;if(note?.trim())line(`Bemerkung ${p.name}`,note)}
 }
 section('Betrieb und Personal');
 for(const [label,k] of [['Schichtleiter / Aufsicht','lead'],['Weitere Mitarbeiter','staff'],['Dienstbeginn','start'],['Dienstende','end'],['Innentemperatur (°C)','indoorTemp'],['Besucherzahl','visitors'],['Geöffnete Stunden','openHours']] as const)line(label,data[k]);
 const group=(title:string,items:readonly string[],field:string)=>{section(title);for(const item of items)line(item,data[field]?.[item]?'Ja':'Nein / nicht markiert')};
 group('Betriebskontrollen',checks,'checks');group('Reinigung / Desinfektion',cleaning,'cleaning');group('Bodensaugung',vacuum,'vacuum');
 section('Bemerkungen und Prüfung');line('Bemerkungen zum Betriebstag',data.notes);line('Letzter Prüfvermerk',day.review_note);
 if(audit.length){section('Erfasste Statusübergänge');for(const a of audit){const d=(a.details||{}) as Record<string,unknown>;line(new Date(a.created_at).toLocaleString('de-DE'),`${safe(d.action)} · Benutzer-ID ${safe(a.actor_id)}${d.note?' · '+safe(d.note):''}`)}}
 ensure(18);y+=5;doc.setFontSize(8);doc.setTextColor(95);const disclaimer=doc.splitTextToSize('PDF-Ausgabe eines elektronischen Testprotokolls. Keine digitale Signatur und kein Nachweis der Erfüllung aller gesetzlichen Dokumentationspflichten. Maßgeblich bleiben die gespeicherten Daten und das Berechtigungssystem.',width);doc.text(disclaimer,margin,y);
 foot();doc.save(`PoolLog-Betriebstagebuch-${day.day}.pdf`);
}
