import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {S3Client,ListObjectsV2Command,PutObjectCommand,HeadObjectCommand,GetPublicAccessBlockCommand} from '@aws-sdk/client-s3';
import {fromIni} from '@aws-sdk/credential-providers';

const config=JSON.parse(fs.readFileSync('scripts/s3.config.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('s3-assets/manifest.json','utf8'));
const dryRun=process.argv.includes('--dry-run');
if(!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(config.bucket))throw new Error('Invalid bucket name');
if(!/^[a-z0-9-]+$/.test(config.region))throw new Error('Invalid region');
const prefix=(config.prefix||'').replace(/^\/+|\/+$/g,'');
if(!prefix||prefix.split('/').some(p=>p==='..'||p==='.')||/[^a-zA-Z0-9_./-]/.test(prefix))throw new Error('Use a non-empty, ordinary folder prefix');
if(!manifest.report.targetMet)throw new Error('Compression target not met; prepare assets again');
const root=path.resolve('s3-assets/files');
const objectKey=item=>`${prefix}/${item.key}`;
function bytesFor(item){
 const absolute=path.resolve(root,item.key);
 if(!absolute.startsWith(root+path.sep))throw new Error('Asset path escaped upload directory');
 const bytes=fs.readFileSync(absolute);
 if(bytes.length!==item.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw new Error('Prepared asset changed: '+item.key);
 return bytes;
}
if(dryRun){
 for(const item of manifest.objects)bytesFor(item);
 console.log(JSON.stringify({mode:'local dry run; no AWS calls',bucket:config.bucket,region:config.region,prefix,objects:manifest.objects.length,bytes:manifest.report.outputBytes,cacheControl:'public, max-age=31536000, immutable',deletes:false,changesToBucketPermissions:false},null,2));
 process.exit(0);
}
const client=new S3Client({region:config.region,credentials:fromIni({profile:process.env.AWS_PROFILE||config.profile})});
try{
 // List once per page, rather than issuing HEAD for every unchanged asset on repeat uploads.
 const existing=new Map();let token;
 do{const result=await client.send(new ListObjectsV2Command({Bucket:config.bucket,Prefix:prefix+'/',ContinuationToken:token}));for(const o of result.Contents||[])existing.set(o.Key,o.Size);token=result.NextContinuationToken;}while(token);
 let uploaded=0,skipped=0;const verified=[];
 for(const item of manifest.objects){
  const body=bytesFor(item),key=objectKey(item);
  if(existing.get(key)===item.bytes){skipped++;continue;}
  await client.send(new PutObjectCommand({Bucket:config.bucket,Key:key,Body:body,ContentType:item.contentType,CacheControl:item.cacheControl,ChecksumSHA256:Buffer.from(item.sha256,'hex').toString('base64')}));
  const head=await client.send(new HeadObjectCommand({Bucket:config.bucket,Key:key}));
  if(head.ContentLength!==item.bytes||head.CacheControl!==item.cacheControl)throw new Error('Uploaded object verification failed: '+key);
  verified.push(key);uploaded++;
  if(uploaded%40===0)console.log(`Uploaded and verified ${uploaded} objects`);
 }
 const baseUrl=(config.deliveryBaseUrl||`https://${config.bucket}.s3.${config.region}.amazonaws.com/${prefix}`).replace(/\/$/,'');
 const sample=manifest.objects.find(o=>o.contentType==='image/svg+xml')||manifest.objects[0];
 let publicStatus;try{const response=await fetch(`${baseUrl}/${sample.key}`,{method:'HEAD'});publicStatus=response.status;}catch{publicStatus='unreachable';}
 let accessBlock;try{accessBlock=(await client.send(new GetPublicAccessBlockCommand({Bucket:config.bucket}))).PublicAccessBlockConfiguration;}catch{accessBlock='not available with this profile';}
 const result={bucket:config.bucket,region:config.region,prefix,uploaded,skipped,verified,baseUrl,publicReadStatus:publicStatus,publicAccessBlock:accessBlock};
 fs.writeFileSync('s3-assets/upload-result.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({uploaded,skipped,baseUrl,publicReadStatus:publicStatus},null,2));
 console.log(publicStatus===200?'Assets are readable at the configured delivery URL. Use this baseUrl for VITE_ASSET_BASE_URL.':'Objects uploaded, but delivery is not available at the configured URL. Keep local delivery until CloudFront or bucket read access is configured.');
}catch(error){
 console.error(`Upload stopped: ${error.name}: ${error.message}`);
 console.error(`Use the locally configured AWS profile "${process.env.AWS_PROFILE||config.profile}" with access to s3://${config.bucket}/${prefix}/. Do not put credentials in Vite environment files.`);
 process.exitCode=1;
}finally{client.destroy();}
