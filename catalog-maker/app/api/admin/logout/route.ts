import {validOrigin} from '@/lib/catalog-auth';
import {sessionCookie} from '@/lib/admin-session';
export async function POST(request:Request){if(!validOrigin(request))return Response.json({error:'Request origin rejected.'},{status:403});return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}});}
