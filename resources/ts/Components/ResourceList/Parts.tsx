import { useState,useEffect, createContext, useContext, HTMLProps, useRef } from "react";
import { ApiItem, FuncApi } from "../../Api/Api"
import { SvgEdit, SvgTrash } from "../../Svgs";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
export const EditListContext = createContext((item:ApiItem<any>)=>{});
//TODO make the base structure from the resource list
type ResourceItemProp =number | string | boolean | {ref:number,name:string}
interface ResourceListI<T>{
    api:FuncApi<T,any>
    renamer?:Record<string,string>
    propsToreturn:string[]
}
interface ResourceItemI{
    propsToReturn:string[]
    item:ApiItem<Record<any,any>>
}
/**
 * Render a list to show the items from the specified API resource.
 * 
 * use the context `EditListContext` to receive the selected element to by edited. 
 */
export function ResourceList<PROPS extends {[index:string]:any} = {[index:string]:any}>({api,propsToreturn,renamer}:ResourceListI<PROPS>){
    let [isLoading,setLoadingState] = useState(true);
    let [data,setData] = useState([] as any[]);
    let [head,setHead] = useState([] as string[]);
    const [rowSelection, setRowSelection] = useState({})
    const collumHelper = createColumnHelper<any>();
    let onEdit = useContext(EditListContext);
    const columns = propsToreturn.map(prop =>{
        let header = prop;
        if(renamer){
            if(renamer[prop]){
                header = renamer[prop]
            }
        }
        return collumHelper.accessor(prop,{
            header:header,
            cell:(e)=>e.getValue()
        })
    })
    columns.unshift(collumHelper.accessor('select',{
        id:'select',
        header:({table})=>(<CheckBox 
            indeterminate={table.getIsSomeRowsSelected()}
            checked = {table.getIsAllRowsSelected()}
            onChange = {table.getToggleAllRowsSelectedHandler()}/>),
        cell:({row})=>(<CheckBox 
            checked={row.getIsSelected()}
            disabled = {!row.getCanSelect()}
            indeterminate = {row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
        />)
    }));
    columns.push(collumHelper.accessor('edit',{
        header:'',
        cell:({row})=>(<button onClick={()=>onEdit(row.original)}><SvgEdit/></button>)
    }))
    const table = useReactTable({
        state:{rowSelection},
        columns,
        data,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel:getCoreRowModel()
    })
    useEffect(()=>{
        api().then(e =>{
            let list = e.list;
            setData(list);
            setLoadingState(false);
        })
        api.on('create',onCreate);
        api.on('delete',onDelete);
        api.on('update',onEdit);
        return ()=>{
            api.off('create',onCreate);
            api.off('delete',onDelete);
            api.off('update',onEdit);
        }
        function onCreate(newItem:any){
            setData(e => [...e,newItem])
        }
        function onDelete(e:any){
            let id:number = e.id;
            setData(a => [...a.filter(t => t.id != id)])
        }
        function onEdit(e:any){
            setData(a => [...a])
        }
    },[]);
    return (
        <div>
            <span hidden={!isLoading}>Carregando Dados...</span>
            <table hidden={isLoading}>
                <thead className="rl-t-head">
                    {
                        table.getHeaderGroups().map(headerGroup =>(
                            <tr key={headerGroup.id}>
                                {
                                    headerGroup.headers.map(header =>(
                                        <th key={header.id}>
                                            {flexRender(header.column.columnDef.header,header.getContext())}
                                        </th>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </thead>
                <tbody>
                    {
                        table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {
                                    row.getVisibleCells().map(cell =>(
                                        <th key={cell.id}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</th>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <button 
            disabled = {Object.keys(rowSelection).length == 0}
            onClick={()=>{table.getSelectedRowModel().flatRows.forEach(e =>e.original.delete())}
            }><SvgTrash/></button>
        </div>
    )
}
function CheckBox({indeterminate,...rest}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>){
    const ref = useRef<HTMLInputElement>(null!)

    useEffect(() => {
        if (typeof indeterminate === 'boolean') {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate])
    return (
        <input type="checkbox" ref={ref} className={'rl-checkbox'} {...rest}/>
    )
}
export function ResourceItem({propsToReturn,item}:ResourceItemI){
    let onEdit = useContext(EditListContext);
    return (
        <tr>
            {
                propsToReturn.map( (e,i) =>{
                    let value = item[e];
                    let finalVal:any = '';
                    switch(typeof value){
                        case "boolean":
                            finalVal =value ? "Sim" : "Não";
                            break;
                        default:
                            finalVal = value;
                            break;
                    }
                    return <th key={'i-'+i}>{finalVal}</th>
                })
            }
            <th onClick={()=>{onEdit(item)}}><SvgEdit/></th>
            <th onClick={()=>{item.delete()}}><SvgTrash/></th>
        </tr>
    )
}