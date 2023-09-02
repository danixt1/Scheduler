export type ApiRouting<A> ={
    [Prop in keyof A]: A[Prop] extends Array<any> ? FuncApi<A[Prop][0],A[Prop][1]> : A[Prop] extends Item ? FuncApi<A[Prop],genericEntry<A[Prop]>> : ApiRouting<A[Prop]>
}
export type genericEntry<A> =remapEntry<Omit<A,'id'>>
export type remapEntry<A> = {
    [Prop in keyof A]:A[Prop] extends ApiRef<any> ? number : A[Prop]
} 
export interface InputerObject{
    value:any
    dbName?:string
}
export type InputerFunc = (prop:any)=>InputerObject

export interface RouteItem{
    name:string,
    /** How data is trated in API side. */
    output:{[index:string]:(prop:any)=>any}
    /** How data is transformed to pass to DB */
    input?:{[index:string]:InputerFunc},
    ref?:string[]
}
export interface Routes{
    [route:string]:string | RouteItem
}
export interface FuncApi<T,CREAT>{
    ():Promise<{list:(ApiItem<T>)[]}>
    (data:number):Promise<ApiItem<T>>
    (data:CREAT):Promise<ApiItem<T>>
    delete(item:string | number):Promise<boolean>
}
export type ApiItem<T> = ApiBaseItem & T;
/**
 * getter interface from reference object can by setted passing the new id
 */
export interface ApiRef<T>{
    id:number,
    get:()=>Promise<ApiItem<T>>
}
/**
 * The base item used in all declare items
 */
export interface Item{
    id:number
}
export interface ApiBaseItem{
    waitUpdate():Promise<boolean>
    delete():Promise<boolean>
    readonly deleted:boolean
}