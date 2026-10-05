export type Variant={id:string;name:string;sku:string;price:number;available:boolean;attributes?:Record<string,string>};
export type Product={id:string;externalId:string;source:string;name:string;sku:string;price:number;currency:string;description?:string;categoryId:string;categoryName?:string;available:boolean;images:string[];variants?:Variant[];url?:string;metadata?:Record<string,unknown>;updatedAt?:string};
export type Category={id:string;name:string;parentId:string|null;visible:boolean;sortOrder:number;count:number};
export type Config={name:string;whatsapp:string;design:'gallery'|'studio';currency:string};
export type Normalized=Omit<Product,'id'>&{description:string;variants:Variant[];url:string;metadata:Record<string,unknown>;categoryName:string};
