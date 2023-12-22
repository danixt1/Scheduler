import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { assert, describe, expect, it } from 'vitest';
import { API } from '../Api';
import { buildApiItem } from '../Api/Conector';
import { formBuilder, BaseForm } from '../Components/Creater/Forms/Base';

describe('BaseForm',()=>{
    it('pass hidden id on edit',(ctx)=>{
        const ITEM_ID = 2;
        return new Promise<void>((res)=>{
            function mock(data:any){
                assert.equal(data.id,2);
                res();
                return new Promise(()=>{})
            }
            function Test(){
                let data = formBuilder('test','testing',(e)=>{return e},mock as any);
                return (
                <BaseForm data={data} apiItem={buildApiItem({id:ITEM_ID},'',{},{})}>
                    <h2>Mid</h2>
                </BaseForm>)
            }
            const {getByTestId}= render(<Test/>);
            waitFor(()=>expect(getByTestId('submit-btn')).toBeEnabled()).then(()=>{
                fireEvent.click(getByTestId('submit-btn'));
            })
        })
    })
    it('create with submit button',()=>{
        function Test(){
            let data = formBuilder('test','testing',()=>{return {}},API.sender);
            return (
            <BaseForm data={data}>
                <h2>Mid</h2>
            </BaseForm>)
        }

        const {container}= render(<Test/>);
        expect(container.getElementsByTagName('input')[0]).toHaveAttribute('type','submit');
    })
})