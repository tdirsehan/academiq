'use strict';
const IMPORT_LIMITS = Object.freeze({fileBytes:5*1024*1024,rows:10000,columns:100,cellCharacters:10000,totalCharacters:2000000,timeoutMs:10000,zipEntries:512,zipUncompressedBytes:25*1024*1024});
function validateImportFile(file){
  if(!file || typeof file.name!=='string' || !/\.(csv|tsv|txt|xlsx|xls)$/i.test(file.name))throw new Error('Choose a CSV, TSV, TXT, XLSX or XLS file.');
  if(!Number.isFinite(file.size)||file.size<=0)throw new Error('The file is empty.');
  if(file.size>IMPORT_LIMITS.fileBytes)throw new Error('The file exceeds the 5 MiB limit. Split it into smaller datasets.');
}
function inspectXlsxArchive(buffer){
  const view=new DataView(buffer),length=view.byteLength;
  let end=-1;
  for(let i=length-22;i>=Math.max(0,length-65557);i--){if(view.getUint32(i,true)===0x06054b50&&i+22+view.getUint16(i+20,true)===length){end=i;break;}}
  if(end<0)throw new Error('The XLSX archive is invalid or incomplete.');
  const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),start=view.getUint32(end+16,true);
  if(view.getUint16(end+4,true)||view.getUint16(end+6,true)||view.getUint16(end+8,true)!==count||!count||count>IMPORT_LIMITS.zipEntries||start+size>end)throw new Error('This workbook archive is too complex or unsupported.');
  let cursor=start,total=0;
  for(let i=0;i<count;i++){
    if(cursor+46>start+size||view.getUint32(cursor,true)!==0x02014b50)throw new Error('The workbook archive directory is invalid.');
    if(view.getUint16(cursor+8,true)&1)throw new Error('Encrypted workbooks are not supported.');
    const unpacked=view.getUint32(cursor+24,true);
    total+=unpacked;
    if(unpacked===0xffffffff||total>IMPORT_LIMITS.zipUncompressedBytes)throw new Error('The expanded workbook exceeds the 25 MiB safety limit.');
    cursor+=46+view.getUint16(cursor+28,true)+view.getUint16(cursor+30,true)+view.getUint16(cursor+32,true);
    if(cursor>start+size)throw new Error('The workbook archive directory is invalid.');
  }
  if(cursor!==start+size)throw new Error('The workbook archive directory is invalid.');
}
function validateImportedRows(data){
  if(!Array.isArray(data)||!data.length)throw new Error('The selected sheet contains no data rows.');
  if(data.length>IMPORT_LIMITS.rows)throw new Error('The dataset exceeds 10,000 data rows. Split it into smaller datasets.');
  const names=new Set();let characters=0;
  for(const row of data){
    if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('Invalid data row.');
    for(const [name,value] of Object.entries(row)){
      if(name.length>200)throw new Error('A column name exceeds 200 characters.');
      names.add(name);if(names.size>IMPORT_LIMITS.columns)throw new Error('The dataset exceeds 100 columns.');
      const text=String(value??'');characters+=text.length;
      if(text.length>IMPORT_LIMITS.cellCharacters)throw new Error('A cell exceeds 10,000 characters. Shorten long text fields.');
      if(characters>IMPORT_LIMITS.totalCharacters)throw new Error('The dataset contains too much text for browser analysis. Split it into smaller datasets.');
    }
  }
  return data;
}
function safeCsvCell(value){
  let text=String(value??'');
  if(/^[\s\u0000-\u001f]*[=+\-@]/.test(text))text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}
