import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {FiUpload} from 'react-icons/fi'
import './styles.css'

interface Props {
    onFileChanged: (file: File) => void
}

const DropZone: React.FC<Props> = ({onFileChanged}) => {
    const [selectedFileURL, setSelectedFileURL] = useState('')
    const onDrop = useCallback(acceptableFiles => {
        const file = acceptableFiles[0]
        const fileUrl = URL.createObjectURL(file)
        setSelectedFileURL(fileUrl)
        onFileChanged(file)
    }, [onFileChanged])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: 'image/*'
    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()}/>
            {
                selectedFileURL === ''
                    ? (
                        <p>
                            <FiUpload />
                            Imagem do estabelecimento
                        </p>
                    )
                    : <img src={selectedFileURL} alt="imagem selecionada" />
            }
        </div>
    )
}

export default DropZone