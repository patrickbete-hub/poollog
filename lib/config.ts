export const points = [
  {id:'innen',name:'Innenbecken',circuit:'Schwimmbecken',auto:true},
  {id:'aussen',name:'Außenbecken',circuit:'Schwimmbecken',auto:true},
  {id:'plansch',name:'Planschbecken',circuit:'Erlebnisbereich',auto:true},
  {id:'rutsche',name:'Rutsche',circuit:'Erlebnisbereich',auto:true},
  {id:'warm',name:'Warmbecken',circuit:'Erlebnisbereich',auto:true},
  {id:'whirlpool',name:'Hot Whirlpool',circuit:'Whirlpool',auto:true},
  {id:'kalt_innen',name:'Kaltbecken Innen',circuit:'Kaltbecken',auto:true},
  {id:'kalt_aussen',name:'Kaltbecken Außen',circuit:'Kaltbecken',auto:false}
] as const;
export type Reading = {auto_cl:string;auto_redox:string;auto_ph:string;manual_cl:string;manual_total_cl:string;manual_ph:string;temperature:string;note:string};
export const emptyReading=():Reading=>({auto_cl:'',auto_redox:'',auto_ph:'',manual_cl:'',manual_total_cl:'',manual_ph:'',temperature:'',note:''});
export const checks=['Rutsche','Schwimmhalle','Technik','Chlorgasraum'];
export const cleaning=['Schwimmhalle','Liegehalle','WCs / Duschen','Umkleiden','Cafeteria','Sauna'];
export const vacuum=['IB','AB','KB','LB','WP'];
