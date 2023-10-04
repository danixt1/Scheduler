import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BaseForm, formBuilder } from '../Components/Creater/Forms';
import { API } from '../Api';

describe('BaseForm',()=>{
    it('pass hidden id on edit',()=>{
        function Test(){
            let data = formBuilder('test','testing',()=>{return {}},API.sender);
            return (
            <BaseForm data={data} item_id={2}>
                <h2>Mid</h2>
            </BaseForm>)
        }
        const {container}= render(<Test/>);
        let elem = container.querySelector('input[type="hidden"][name="id"][value="2"]');
        expect(elem);
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