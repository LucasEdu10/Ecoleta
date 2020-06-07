import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link , useHistory} from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'; 
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import './styles.css';
import axios from 'axios';
import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    name: string;
    image_url: string;
}
interface IBAGEUFResponse {
    sigla: string,
}

interface IBGEMUNResponse {
    nome: string,
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [city, setCity] = useState<string[]>([]);

    const [initialPosition , setInitialPosition] = useState<[number, number]>([0,0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',

    })

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedCity, setSelectedCity] = useState("0");
    const [selectedPosition , setSelectedPosition] = useState<[number, number]>([0,0]);
    const [seletedFile, setseletedFile] = useState<File>();



    const history = useHistory();

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    },[]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;

            setInitialPosition([latitude, longitude]);
        })
    }, []);
    useEffect(() => {
        axios.get<IBAGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const ufInicials = response.data.map(uf => uf.sigla);
            setUfs(ufInicials);
        });
    },[]);

    useEffect(() => {
        if(selectedUf === '0'){
            return;
        }
        axios.get<IBGEMUNResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{
            const citys = response.data.map(ci => ci.nome);
            setCity(citys);
        });
    }, [ selectedUf ]);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;

        setFormData({
            ...formData, [name]: value
        })
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(items => items === id); 

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(items => items !== id);

            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }


    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;
        

        const data = new FormData();

        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));
        
        if(seletedFile){
            data.append('image', seletedFile);
        }

        await api.post('points', data);
        
        alert('Ponto de coleta Criado!');
        history.push('/');
    }

    return (
    <div id="page-create-point">
        <header>
            <img src={logo} alt="Ecoleta" />
            <Link to="/">
                <FiArrowLeft / >
                Voltar para a Home
            </Link>
        </header>
        <form onSubmit={handleSubmit}>
            <h1>Cadastro do <br /> ponto de Coleta</h1>
            <Dropzone onFileUpload={setseletedFile} />
            <fieldset>
                <legend>
                    <h2>Dados</h2>
                </legend>
                <div className="field">
                    <label htmlFor="name">Nome da entidade</label>
                    <input 
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input 
                            type="email"
                            name="email"
                            id="email"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input 
                            type="text"
                            name="whatsapp"
                            id="nawhatsappme"
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <legend>
                    <h2>Endereço</h2>
                    <span>Selecione o Endereço no Mapa</span>
                </legend>
                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPosition} />
                    </Map>
                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado (UF)</label>
                        <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                            <option value="0">Selecione uma UF</option>
                            {ufs.map(uf => (
                                <option key={uf} value={uf} > {uf} </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                            <option value="0">Selecione uma Cidade</option>
                            {city.map(ci => (
                                <option key={ci} value={ci} > {ci} </option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>
            <fieldset>
                <legend>
                    <h2>Ítens de coleta</h2>
                    <span>Selecione um ou mais itens de coleta</span>
                </legend>
                <ul className="items-grid">
                    {items.map(item => (
                    <li 
                        key={item.id}
                        onClick={() => handleSelectItem(item.id)}
                        className={selectedItems.includes(item.id)? 'selected':''}
                    >
                        <img src={item.image_url} alt={item.name} />
                        <span>{item.name}</span>
                    </li>)
                    )}

                </ul>
            </fieldset>
            <button type="submit">Cadastrar Ponto</button>
        </form>
    </div>
    )
}

export default CreatePoint;