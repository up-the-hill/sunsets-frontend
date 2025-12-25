import { css } from '@linaria/core';
import { useRef } from 'react';

export default function UploadModal({ handleCloseModal, clickMarker }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  return (
    <div 
      onClick={handleCloseModal}
      className={css`
            z-index: 999;
            position: fixed;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4); 
            display: grid;
            place-content: centre;
    `}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={css`
              z-index: 9999;
              background-color: #fff;
              padding: 1em;
              margin: auto auto;
              min-width: 20em;
            `}>
        <button onClick={handleCloseModal} className={css`float:right;`}>&#10005;</button>
        <p>Upload Sunset</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData();
          if (clickMarker) {
            const { lng, lat } = clickMarker.getLngLat();
            formData.append('longitude', lng.toPrecision(17));
            formData.append('latitude', lat.toPrecision(17));
          }
          const clientUrlRes = await fetch('/api/sunsets', {
            method: 'POST',
            body: formData
          });
          const clientUrl = await clientUrlRes.text();

          const input = fileRef.current;
          const file = input!.files![0];
          await fetch(clientUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream'
            },
            body: file
          })

          handleCloseModal();
          alert("image uploaded!")
        }}>
          <input ref={fileRef} type="file" id="sunset" name="sunset" accept="image/png, image/jpeg" required />
          <button>OK</button>
        </form>
      </div>
    </div>
  )
}
