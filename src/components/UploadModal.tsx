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

          const input = fileRef.current;
          const file = input!.files![0];

          // API Call to get Presigned POST data
          const formData = new FormData();
          if (clickMarker) {
            const { lng, lat } = clickMarker.getLngLat();
            formData.append('longitude', lng.toPrecision(8));
            formData.append('latitude', lat.toPrecision(8));
          }

          try {
            const res = await fetch('/api/sunsets', {
              method: 'POST',
              body: formData
            });

            if (!res.ok) {
              throw new Error('Failed to get upload parameters');
            }

            const { url, fields } = await res.json();

            // Construct FormData for S3 upload
            const s3FormData = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
              s3FormData.append(key, value as string);
            });
            s3FormData.append('file', file);

            // Upload to S3
            const uploadRes = await fetch(url, {
              method: 'POST',
              body: s3FormData
            });

            if (!uploadRes.ok) {
              if (uploadRes.status === 400 && (await uploadRes.text()).includes('EntityTooLarge')) {
                throw new Error('File too large (max 5MB)');
              }
              throw new Error('Upload to S3 failed');
            }

            handleCloseModal();
            alert("image uploaded!");
          } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : "Upload failed");
          }
        }}>
          <input ref={fileRef} type="file" id="sunset" name="sunset" accept="image/png, image/jpeg" required />
          <button>OK</button>
        </form>
      </div>
    </div>
  )
}
