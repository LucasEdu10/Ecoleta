import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import './styles.css';

interface Props{
    onFileUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({onFileUpload}) => {
    
    const [seletedFileUrl, setseletedFileUrl] = useState('');
  
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        
        const fileUrl = URL.createObjectURL(file);

        setseletedFileUrl(fileUrl);
        onFileUpload(file);
  }, [onFileUpload])

  const {getRootProps, getInputProps} = useDropzone({
      onDrop,
      accept: 'image/*'
    })

  return (
    <div className="dropzone"  {...getRootProps()}>
      <input {...getInputProps()} accept="image/*"/>

      { seletedFileUrl
        ? <img src={seletedFileUrl} alt="Point"/>
        : (
            <p><FiUpload/>Clique para adicionar uma imagem, ou arraste aqui!</p>  
        )
      }

      
    </div>
  )
}

export default Dropzone;