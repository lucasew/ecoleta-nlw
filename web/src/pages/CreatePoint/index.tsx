import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import axios, { AxiosError } from 'axios'
import {LeafletMouseEvent} from 'leaflet'

import api, {baseURL} from '../../services/api'
import toast from '../../utils/toaster'

import './styles.css'
import logo from '../../assets/logo.svg'

import DropZone from '../../components/DropZone'

interface Item {
    image: string
    title: string
    id: number
    is_selected: boolean
}

interface IBGEUFResponse {
    sigla: string,
}

interface IBGECityResponse {
    nome: string
}

function useOptionHandler(setState: (newState: string) => void, invalidValue?: string) {
    return function(ev: ChangeEvent<HTMLSelectElement>) {
        const extractedValue = ev.target.value
        if (invalidValue) {
            if (extractedValue === invalidValue) {
                return
            }
        }
        setState(extractedValue)
    }
}

const CreatePoint = () => {
    const history = useHistory()
    const [items, setItems] = useState<Item[]>([])

    const [ufs, setUFs] = useState<string[]>([])
    const [selectedUF, setSelectedUF] = useState<string>('0')
    const handleSelectUF = useOptionHandler(setSelectedUF, '0')

    const [cities, setCities] = useState<string[]>([])
    const [selectedCity, setSelectedCity] = useState<string>('0')
    const handleSelectCity = useOptionHandler(setSelectedCity, '0')

    const [latLong, setLatLong] = useState<[number, number]>([0, 0])
    
    const [selectedFile, setSelectedFile] = useState<File>()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    function handleInputEvent(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target
        setFormData({...formData, [name]: value})
    }

    function handleSelectItem(id: number) {
        const newState = items.map(item => item.id === id 
            ? {...item, is_selected: !item.is_selected}
            : item
        )
        setItems(newState)
    } 
    
    function handleMapEvent(event: LeafletMouseEvent) {
        const {lat, lng} = event.latlng
        setLatLong([lat, lng])
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        const {name, email, whatsapp} = formData
        const [latitude, longitude] = latLong
        const uf = selectedUF
        if (uf === '0') {
            toast.error("UF não pode ser o valor padrão")
            return
        }
        const city = selectedCity
        if (city === '0') {
            toast.error("Cidade não pode ser o valor padrão")
            return
        }
        const itemIds = items
            .filter(item => item.is_selected)
            .map(item => item.id)

        const data = new FormData()
        Object.entries({
            name, email, whatsapp,
            latitude, longitude,
            uf, city,
            items: itemIds
        }).forEach((item) => {
            const [k, v] = item
            data.append(k, String(v))
        })
        if (selectedFile !== undefined) {
            data.append('image', selectedFile)
        } else {
            toast.error("Selecione uma imagem para o ponto de coleta")
            return
        }
        try {
            const response = await api.post('/api/points', data)
            if (response.status === 200) {
                toast.success("Ponto criado")
            } else {
                toast.error(`Houve um erro na criação do ponto: ${response.data.error}`)
                console.log(response.data)
            }
            toast.info("Redirecionando para a página inicial...")
            history.push('/')
        } catch (err) {
            toast.error(`Erro ao submeter dados: ${err.response.data.error}`)
        }
    }

    useEffect(() => {
        let timeoutExpired = false
        setTimeout(() => {
            toast.warning("Tempo limite de busca de dados de localização excedido. A busca automática de localização foi desabilitada.")
            timeoutExpired = true
        }, 5000)
        toast.info("Buscando localização do usuário para o mapa...")
        navigator.geolocation.getCurrentPosition(position => {
            if (timeoutExpired) {
                return // to avoid warping bugs if the gps detection is so slow
            }
            const {latitude, longitude} = position.coords
            setLatLong([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        api.get('/api/items').then(response => {
            const {error, data} = response.data
            if (error) {
                toast.error(`Erro ao buscar o catálogo de grupos de itens recolhíveis: ${error}`)
                return
            }
            const rawItems = data as Item[]
            setItems(rawItems.map(item => {
                return {
                    ...item,
                    is_selected: false
                }
            }))
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then((response) => {
                setUFs(response.data.map(item => item.sigla))
            })
    }, [])

    useEffect(() => {
        if (selectedUF === '0') {
            return
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
            .then((response) => {
                setCities(response.data.map(city => city.nome))
            })
    }, [selectedUF])

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="ecoleta logo"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <DropZone onFileChanged={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputEvent} />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputEvent} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputEvent} />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[0, 0]} zoom={10} onClick={handleMapEvent}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={latLong}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.sort().map(
                                    uf => <option key={uf} value={uf}>{uf}</option>
                                )}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="uf" id="uf" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.sort().map(
                                    city => <option key={city} value={city}>{city}</option>
                                )}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectItem(item.id)}
                                    className={item.is_selected ? 'selected' : ''}
                                    >
                                    <img src={baseURL + item.image} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint