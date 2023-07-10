import { Head } from '@inertiajs/react'
import Calendar from '../Components/Calendar.js';

export default function App(){
    return (
        <div>
            <Head title="Testing"/>
            <h2>Testando</h2>
            <Calendar month={2} year={2023}></Calendar>
        </div>
    );
}