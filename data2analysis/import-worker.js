'use strict';
importScripts('import-limits.js?v=33103f9056e99e17','vendor/xlsx-0.20.3.full.min.js');
self.onmessage=function(event){
  try{
    const {name,buffer}=event.data||{};
    if(!(buffer instanceof ArrayBuffer))throw new Error('Invalid file data.');
    validateImportFile({name,size:buffer.byteLength});
    if(/\.xlsx$/i.test(name))inspectXlsxArchive(buffer);
    const textFile=/\.(csv|tsv|txt)$/i.test(name);
    const workbook=XLSX.read(textFile?new TextDecoder('utf-8').decode(buffer):buffer,{type:textFile?'string':'array',sheets:0,sheetRows:IMPORT_LIMITS.rows+2,cellFormula:false,cellHTML:false,cellStyles:false});
    const sheet=workbook.Sheets[workbook.SheetNames[0]];
    if(!sheet||!sheet['!ref'])throw new Error('The first worksheet contains no usable data.');
    const range=XLSX.utils.decode_range(sheet['!fullref']||sheet['!ref']);
    if(range.e.r-range.s.r>IMPORT_LIMITS.rows)throw new Error('The dataset exceeds 10,000 data rows.');
    if(range.e.c-range.s.c+1>IMPORT_LIMITS.columns)throw new Error('The dataset exceeds 100 columns.');
    const data=validateImportedRows(XLSX.utils.sheet_to_json(sheet,{defval:''}));
    self.postMessage({ok:true,data});
  }catch(error){self.postMessage({ok:false,error:String(error.message||'The file could not be parsed.').slice(0,300)});}
};
