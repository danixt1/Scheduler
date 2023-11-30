import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BaseForm, formBuilder } from '../Components/Creater/Forms';
import { API } from '../Api';
import { buildApiItem } from '../Api/Conector';

describe('BaseForm',()=>{
    it('pass hidden id on edit',()=>{
        const ITEM_ID = 2;
        function Test(){
            let data = formBuilder('test','testing',()=>{return {}},API.sender);
            return (
            <BaseForm data={data} apiItem={buildApiItem({id:ITEM_ID},'',{},{})}>
                <h2>Mid</h2>
            </BaseForm>)
        }
        const {container}= render(<Test/>);
        let elem = container.querySelector(`input[type="hidden"][name="id"][value="${ITEM_ID}"]`);
        expect(elem).to.not.null;
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