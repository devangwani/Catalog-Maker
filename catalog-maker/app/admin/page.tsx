import {redirect} from 'next/navigation';
import {isAdmin} from '@/lib/catalog-auth';
import Admin from './workspace';
export const dynamic='force-dynamic';
export default async function Page(){if(!await isAdmin())redirect('/admin/login');return <Admin/>;}
